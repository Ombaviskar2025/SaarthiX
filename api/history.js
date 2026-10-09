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

// Multi-source fetching: Try primary and query2 endpoints with modern user agents
async function fetchFromYahoo(yahooSymbol, range, interval) {
  const hosts = [
    'https://query1.finance.yahoo.com',
    'https://query2.finance.yahoo.com'
  ];

  let lastError = null;
  for (const host of hosts) {
    try {
      const url = `${host}/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=${range}&interval=${interval}&includeAdjustedClose=true`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': 'https://finance.yahoo.com',
          'Referer': `https://finance.yahoo.com/quote/${encodeURIComponent(yahooSymbol)}`
        }
      });

      if (!response.ok) {
        lastError = new Error(`Yahoo Finance ${host} returned HTTP ${response.status}`);
        continue;
      }

      const json = await response.json();
      const result = json?.chart?.result?.[0];
      if (!result) {
        lastError = new Error(`No chart data returned from ${host}`);
        continue;
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
            timeValue = ts;
          } else {
            const d = new Date(ts * 1000);
            timeValue = d.toISOString().split('T')[0];
          }

          candles.push({
            time: timeValue,
            open: parseFloat(Number(o).toFixed(2)),
            high: parseFloat(Number(h).toFixed(2)),
            low: parseFloat(Number(l).toFixed(2)),
            close: parseFloat(Number(c).toFixed(2)),
            volume: Math.round(v)
          });
        }
      }

      if (candles.length > 0) {
        return candles;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw (lastError || new Error(`All Yahoo endpoints failed for ${yahooSymbol}`));
}

// Optional secondary provider: TwelveData API (if TWELVEDATA_API_KEY is configured in .env)
async function fetchFromTwelveData(cleanSym, exchange, interval) {
  const apiKey = process.env.TWELVEDATA_API_KEY;
  if (!apiKey) return null;

  try {
    const tdInterval = interval === '1wk' ? '1week' : (interval === '1h' ? '1h' : '1day');
    const tdExchange = exchange === 'BSE' ? 'BSE' : 'NSE';
    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(cleanSym)}&exchange=${tdExchange}&interval=${tdInterval}&outputsize=250&apikey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json || !Array.isArray(json.values) || json.values.length === 0) return null;

    // TwelveData returns values newest first -> reverse to chronological
    const sorted = json.values.slice().reverse();
    return sorted.map(v => ({
      time: v.datetime.split(' ')[0],
      open: parseFloat(parseFloat(v.open).toFixed(2)),
      high: parseFloat(parseFloat(v.high).toFixed(2)),
      low: parseFloat(parseFloat(v.low).toFixed(2)),
      close: parseFloat(parseFloat(v.close).toFixed(2)),
      volume: parseInt(v.volume, 10) || 50000
    }));
  } catch (err) {
    console.warn('[TwelveData fetch failed]:', err.message);
    return null;
  }
}

// Fallback synthetic candles in case of third-party network blocking
function generateFallbackOHLC(basePrice = 100, count = 250, interval = '1d') {
  const candles = [];
  const now = new Date();
  const safeBase = Math.max(5, parseFloat(basePrice) || 100);
  let currentPrice = Math.max(5, safeBase * 0.82);
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

    const drift = ((count - i) / count) * (safeBase - currentPrice) * 0.05;
    const randomChange = (Math.random() - 0.48) * (currentPrice * 0.022) + drift;
    const open = parseFloat(Number(currentPrice).toFixed(2));
    currentPrice = Math.max(3, currentPrice + randomChange);
    const close = i === 0 ? parseFloat(Number(safeBase).toFixed(2)) : parseFloat(Number(currentPrice).toFixed(2));
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
      range = '60d';
    }

    const exchange = (req.query.exchange || 'NSE').toUpperCase();
    const isBseRequested = exchange === 'BSE' || rawSym.toUpperCase().endsWith('.BO');
    const requestedPrice = parseFloat(req.query.price || req.query.ltp) || 0;

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

    // 1. Try Yahoo Finance Primary Symbol
    try {
      candles = await fetchFromYahoo(primaryYahooSym, range, interval);
    } catch (primErr) {
      console.warn(`[History API] Primary symbol ${primaryYahooSym} failed:`, primErr.message);
      // 2. Try Yahoo Finance Alternate Exchange
      try {
        candles = await fetchFromYahoo(altYahooSym, range, interval);
        usedSymbol = altYahooSym;
        actualExchange = altSuffix === '.BO' ? 'BSE' : 'NSE';
      } catch (altErr) {
        console.warn(`[History API] Alternate symbol ${altYahooSym} failed:`, altErr.message);
      }
    }

    // 3. Try TwelveData if Yahoo fails and API key is present
    if (!candles || candles.length === 0) {
      try {
        const tdCandles = await fetchFromTwelveData(cleanSym, actualExchange, interval);
        if (tdCandles && tdCandles.length > 0) {
          candles = tdCandles;
          usedSymbol = `${cleanSym}:${actualExchange}`;
        }
      } catch (tdErr) {
        console.warn('[History API] TwelveData fallback failed:', tdErr.message);
      }
    }

    // 4. Reliable synthetic data fallback based on actual requested price
    let isSimulated = false;
    if (!candles || candles.length === 0) {
      console.warn(`[History API] Falling back to synthetic candles for ${cleanSym}`);
      const basePrice = requestedPrice > 0 ? requestedPrice : 66.65;
      candles = generateFallbackOHLC(basePrice, interval === '1h' ? 200 : 350, interval);
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
