// ============================================================
//  api/candles.js — Historical OHLCV Candle Proxy (NSE/BSE)
//  Primary: Yahoo Finance Charts | Fallback: Twelve Data
// ============================================================
'use strict';

const CANDLE_CACHE = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

const SYMBOL_OVERRIDES = {
  'TATAMOTORS': 'TMCV.NS',
  'ZOMATO': 'ETERNAL.NS',
  'NESTLEIND': 'NESTLEIND.BO',
  'SHREECEM': 'SHREECEM.BO',
  'BPCL': 'BPCL.BO'
};

function resolveYahooSymbol(rawSym) {
  if (!rawSym) return 'RELIANCE.NS';
  const clean = rawSym.trim().toUpperCase();
  if (clean === 'SENSEX') return '^BSESN';
  if (clean === 'NIFTY' || clean === 'NIFTY50') return '^NSEI';
  if (clean === 'BANKNIFTY') return '^NSEBANK';
  if (SYMBOL_OVERRIDES[clean]) return SYMBOL_OVERRIDES[clean];
  if (clean.endsWith('.NS') || clean.endsWith('.BO') || clean.startsWith('^')) {
    return clean;
  }
  return `${clean}.NS`;
}

function normalizeRange(range) {
  const r = (range || '2y').toLowerCase();
  if (r === '1m') return '1mo';
  if (r === '6m') return '6mo';
  if (r === '1y') return '1y';
  if (r === '2y') return '2y';
  if (r === '5y') return '5y';
  return '2y';
}

function normalizeInterval(interval) {
  const i = (interval || '1d').toLowerCase();
  if (i === '1wk' || i === '1w' || i === 'weekly') return '1wk';
  if (i === '1h' || i === '60m') return '1h';
  return '1d';
}

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
          'Accept': 'application/json, text/plain, */*'
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
      const adjclose = result.indicators?.adjclose?.[0]?.adjclose || [];
      const opens = quote.open || [];
      const highs = quote.high || [];
      const lows = quote.low || [];
      const closes = quote.close || [];
      const volumes = quote.volume || [];

      const isIntraday = interval === '1h' || interval === '15m' || interval === '5m' || interval === '1m';

      const candles = [];
      for (let i = 0; i < timestamps.length; i++) {
        const ts = timestamps[i];
        const rawClose = closes[i];
        const rawOpen = opens[i];
        if (rawClose != null && rawOpen != null && !isNaN(rawClose) && !isNaN(rawOpen)) {
          // Use split-adjusted factor if available
          const adjFactor = (adjclose[i] && rawClose > 0) ? (adjclose[i] / rawClose) : 1;
          const o = parseFloat((rawOpen * adjFactor).toFixed(2));
          const c = parseFloat((rawClose * adjFactor).toFixed(2));
          const rawHigh = highs[i] != null && !isNaN(highs[i]) ? highs[i] : Math.max(rawOpen, rawClose);
          const rawLow = lows[i] != null && !isNaN(lows[i]) ? lows[i] : Math.min(rawOpen, rawClose);
          const h = parseFloat((rawHigh * adjFactor).toFixed(2));
          const l = parseFloat((rawLow * adjFactor).toFixed(2));
          const v = volumes[i] != null && !isNaN(volumes[i]) ? Math.round(volumes[i]) : 0;

          let timeValue;
          if (isIntraday) {
            timeValue = ts;
          } else {
            const d = new Date(ts * 1000);
            timeValue = d.toISOString().split('T')[0];
          }

          candles.push({
            time: timeValue,
            open: Math.min(o, Math.max(h, l)),
            high: Math.max(h, o, c),
            low: Math.min(l, o, c),
            close: c,
            volume: v
          });
        }
      }

      if (candles.length > 0) {
        return {
          candles,
          meta: result.meta || {},
          currency: result.meta?.currency || 'INR',
          exchange: result.meta?.exchangeName || 'NSE'
        };
      }
    } catch (err) {
      lastError = err;
    }
  }

  // Fallback: if .NS failed, try .BO
  if (yahooSymbol.endsWith('.NS')) {
    const bseSym = yahooSymbol.replace(/\.NS$/, '.BO');
    try {
      return await fetchFromYahoo(bseSym, range, interval);
    } catch (e) {
      // ignore
    }
  }

  throw (lastError || new Error(`All Yahoo endpoints failed for ${yahooSymbol}`));
}

async function fetchFromTwelveData(cleanSym, interval) {
  const apiKey = process.env.TWELVEDATA_API_KEY;
  if (!apiKey) return null;

  try {
    const tdInterval = interval === '1wk' ? '1week' : (interval === '1h' ? '1h' : '1day');
    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(cleanSym)}&exchange=NSE&interval=${tdInterval}&outputsize=500&apikey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json || !Array.isArray(json.values) || json.values.length === 0) return null;

    const sorted = json.values.slice().reverse();
    const candles = sorted.map(v => ({
      time: v.datetime.split(' ')[0],
      open: parseFloat(parseFloat(v.open).toFixed(2)),
      high: parseFloat(parseFloat(v.high).toFixed(2)),
      low: parseFloat(parseFloat(v.low).toFixed(2)),
      close: parseFloat(parseFloat(v.close).toFixed(2)),
      volume: parseInt(v.volume, 10) || 50000
    }));

    return {
      candles,
      meta: { symbol: cleanSym, exchange: 'NSE' },
      currency: 'INR',
      exchange: 'NSE'
    };
  } catch (err) {
    return null;
  }
}

async function candlesHandler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawSymbol = req.query.symbol || req.query.symbols || req.query.q;
  if (!rawSymbol) {
    return res.status(400).json({ status: 'ERROR', error: 'Missing symbol parameter (e.g. ?symbol=INOXWIND)' });
  }

  const cleanSym = rawSymbol.trim().toUpperCase().replace(/\.(NS|BO)$/, '');
  const range = normalizeRange(req.query.range);
  const interval = normalizeInterval(req.query.interval);
  const cacheKey = `${cleanSym}_${range}_${interval}`;

  const cached = CANDLE_CACHE.get(cacheKey);
  const now = Date.now();
  if (cached && (now - cached.cachedAt) < CACHE_TTL_MS) {
    return res.status(200).json({
      status: 'SUCCESS',
      source: 'Cache',
      symbol: cleanSym,
      range,
      interval,
      candles: cached.data.candles,
      meta: cached.data.meta
    });
  }

  try {
    const yahooSym = resolveYahooSymbol(cleanSym);
    let chartResult = null;

    try {
      chartResult = await fetchFromYahoo(yahooSym, range, interval);
    } catch (yErr) {
      console.warn(`[Candles API] Yahoo failed for ${cleanSym}:`, yErr.message);
      chartResult = await fetchFromTwelveData(cleanSym, interval);
    }

    if (!chartResult || !chartResult.candles || chartResult.candles.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        error: `Historical candle data unavailable for ${cleanSym}`,
        symbol: cleanSym
      });
    }

    CANDLE_CACHE.set(cacheKey, { data: chartResult, cachedAt: now });

    return res.status(200).json({
      status: 'SUCCESS',
      source: 'Live',
      symbol: cleanSym,
      range,
      interval,
      candles: chartResult.candles,
      meta: chartResult.meta
    });

  } catch (err) {
    console.error('[Candles API Error]:', err);
    return res.status(500).json({ status: 'ERROR', error: err.message || 'Failed to fetch historical candle data' });
  }
}

module.exports = candlesHandler;
