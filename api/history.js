// ============================================================
//  api/history.js — Yahoo Finance OHLCV Historical Chart Proxy
//  Proxies Yahoo Finance chart data to avoid CORS on Vercel & local
// ============================================================
'use strict';

const HISTORY_CACHE = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

const YAHOO_SYMBOL_OVERRIDE = {
  'TATAMOTORS': 'TMCV.NS',
  'ZOMATO': 'ETERNAL.NS',
  'NESTLEIND': 'NESTLEIND.BO',
  'SHREECEM': 'SHREECEM.BO',
  'BPCL': 'BPCL.BO'
};

async function fetchFromYahoo(yahooSymbol, range, interval) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=${range}&interval=${interval}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*'
    }
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance returned HTTP ${response.status}`);
  }

  const json = await response.json();
  const result = json?.chart?.result?.[0];
  if (!result) {
    throw new Error('No chart data returned from Yahoo Finance');
  }

  const timestamps = result.timestamp || [];
  const quote = result.indicators?.quote?.[0] || {};
  const opens = quote.open || [];
  const highs = quote.high || [];
  const lows = quote.low || [];
  const closes = quote.close || [];
  const volumes = quote.volume || [];

  const isIntraday = interval === '1h' || interval === '15m' || interval === '5m' || interval === '1m';

  const candles = [];
  for (let i = 0; i < timestamps.length; i++) {
    const ts = timestamps[i];
    const c = closes[i];
    const o = opens[i];
    if (c != null && o != null && !isNaN(c) && !isNaN(o)) {
      const h = highs[i] != null && !isNaN(highs[i]) ? highs[i] : Math.max(o, c);
      const l = lows[i] != null && !isNaN(lows[i]) ? lows[i] : Math.min(o, c);
      const v = volumes[i] != null && !isNaN(volumes[i]) ? volumes[i] : 0;

      let timeValue;
      if (isIntraday) {
        timeValue = ts; // Unix timestamp in seconds for intraday
      } else {
        const d = new Date(ts * 1000);
        timeValue = d.toISOString().split('T')[0]; // YYYY-MM-DD for daily / weekly
      }

      candles.push({
        time: timeValue,
        open: parseFloat(o.toFixed(2)),
        high: parseFloat(h.toFixed(2)),
        low: parseFloat(l.toFixed(2)),
        close: parseFloat(c.toFixed(2)),
        volume: Math.round(v)
      });
    }
  }

  return candles;
}

// Fallback synthetic candles in case of Yahoo network outage
function generateFallbackOHLC(basePrice = 100, count = 250, interval = '1d') {
  const candles = [];
  const now = new Date();
  let currentPrice = Math.max(5, basePrice * 0.85);
  const isIntraday = interval === '1h';

  for (let i = count; i >= 0; i--) {
    let timeVal;
    if (isIntraday) {
      timeVal = Math.floor((Date.now() - (i * 3600 * 1000)) / 1000);
    } else {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const day = d.getDay();
      if (day === 0 || day === 6) continue; // skip weekends
      timeVal = d.toISOString().split('T')[0];
    }

    const change = (Math.random() - 0.48) * (currentPrice * 0.025);
    const open = parseFloat(currentPrice.toFixed(2));
    currentPrice = Math.max(3, currentPrice + change);
    const close = i === 0 ? parseFloat(Number(basePrice).toFixed(2)) : parseFloat(currentPrice.toFixed(2));
    const high = parseFloat((Math.max(open, close) + Math.random() * (open * 0.015)).toFixed(2));
    const low = parseFloat((Math.min(open, close) - Math.random() * (open * 0.015)).toFixed(2));
    candles.push({
      time: timeVal,
      open,
      high,
      low,
      close,
      volume: Math.floor(100000 + Math.random() * 900000)
    });
  }
  return candles;
}

async function historyHandler(req, res) {
  try {
    const rawSym = (req.query.symbol || req.query.ticker || req.query.sym || 'INOXWIND').trim();
    const cleanSym = rawSym.replace(/\.(NS|BO)$/i, '').trim().toUpperCase();

    let interval = (req.query.interval || '1d').toLowerCase();
    if (!['1d', '1wk', '1mo', '1h'].includes(interval)) {
      interval = '1d';
    }

    let range = (req.query.range || (interval === '1h' ? '60d' : '2y')).toLowerCase();
    if (interval === '1h' && (range === '2y' || range === '1y' || range === '5y')) {
      range = '60d'; // Yahoo max range for 1h is 730d, standard safe is 60d
    }

    const exchange = (req.query.exchange || 'NSE').toUpperCase();
    const isBseRequested = exchange === 'BSE' || rawSym.toUpperCase().endsWith('.BO');

    const cacheKey = `${cleanSym}_${range}_${interval}_${isBseRequested ? 'BSE' : 'NSE'}`;
    const now = Date.now();
    if (HISTORY_CACHE.has(cacheKey)) {
      const cached = HISTORY_CACHE.get(cacheKey);
      if (now - cached.timestamp < CACHE_TTL_MS) {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'public, s-maxage=300, max-age=300');
        return res.json({
          status: 'SUCCESS',
          symbol: cleanSym,
          cached: true,
          ...cached.data
        });
      }
    }

    const defaultSuffix = isBseRequested ? '.BO' : '.NS';
    const altSuffix = isBseRequested ? '.NS' : '.BO';

    const primaryYahooSym = YAHOO_SYMBOL_OVERRIDE[cleanSym] || `${cleanSym}${defaultSuffix}`;
    const altYahooSym = `${cleanSym}${altSuffix}`;

    let candles = [];
    let usedSymbol = primaryYahooSym;
    let actualExchange = isBseRequested ? 'BSE' : 'NSE';

    try {
      candles = await fetchFromYahoo(primaryYahooSym, range, interval);
    } catch (primErr) {
      console.warn(`[History API] Primary symbol ${primaryYahooSym} failed:`, primErr.message);
      // Try alternate exchange
      try {
        candles = await fetchFromYahoo(altYahooSym, range, interval);
        usedSymbol = altYahooSym;
        actualExchange = altSuffix === '.BO' ? 'BSE' : 'NSE';
      } catch (altErr) {
        console.warn(`[History API] Alternate symbol ${altYahooSym} failed:`, altErr.message);
      }
    }

    let isSimulated = false;
    if (!candles || candles.length === 0) {
      console.warn(`[History API] Falling back to synthetic candles for ${cleanSym}`);
      candles = generateFallbackOHLC(100, interval === '1h' ? 200 : 400, interval);
      isSimulated = true;
    }

    const payload = {
      status: 'SUCCESS',
      symbol: cleanSym,
      yahooSymbol: usedSymbol,
      exchange: actualExchange,
      range,
      interval,
      count: candles.length,
      isSimulated,
      candles: candles,
      data: candles
    };

    HISTORY_CACHE.set(cacheKey, { timestamp: now, data: payload });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, s-maxage=300, max-age=300');
    return res.json(payload);

  } catch (err) {
    console.error('[History API Error]:', err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      status: 'FAILURE',
      error: err.message || 'Failed to fetch historical chart data',
      data: []
    });
  }
}

module.exports = historyHandler;
