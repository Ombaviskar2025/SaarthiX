// ============================================================
//  api/indices.js — Live Market Indices (SENSEX, NIFTY 50, etc.)
// ============================================================
'use strict';

let INDICES_CACHE = null;
let LAST_CACHE_TIME = 0;
const CACHE_TTL_MS = 20 * 1000; // 20 seconds

const INDICES_CONFIG = [
  { id: 'sensex', symbol: '^BSESN', name: 'SENSEX', exchange: 'BSE' },
  { id: 'nifty50', symbol: '^NSEI', name: 'NIFTY 50', exchange: 'NSE' },
  { id: 'niftyBank', symbol: '^NSEBANK', name: 'BANK NIFTY', exchange: 'NSE' },
  { id: 'niftyIT', symbol: '^CNXIT', name: 'NIFTY IT', exchange: 'NSE' },
  { id: 'niftyMidcap', symbol: 'NIFTY_MIDCAP_100.NS', name: 'NIFTY MIDCAP', exchange: 'NSE' }
];

function isIndianMarketOpen() {
  const now = new Date();
  const istStr = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const ist = new Date(istStr);
  const day = ist.getDay(); // 0 = Sun, 6 = Sat
  if (day === 0 || day === 6) return false;

  const minutes = ist.getHours() * 60 + ist.getMinutes();
  // Trading hours: 09:15 to 15:30 IST (555 to 930 minutes)
  return minutes >= 555 && minutes <= 930;
}

async function fetchIndexQuote(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const value = meta.regularMarketPrice ?? meta.chartPreviousClose ?? 0;
    const prevClose = meta.chartPreviousClose ?? value;
    const change = parseFloat((value - prevClose).toFixed(2));
    const changePct = prevClose > 0 ? parseFloat(((change / prevClose) * 100).toFixed(2)) : 0;

    return {
      value: parseFloat(Number(value).toFixed(2)),
      change,
      changePct,
      prevClose: parseFloat(Number(prevClose).toFixed(2)),
      high: meta.regularMarketDayHigh ? parseFloat(Number(meta.regularMarketDayHigh).toFixed(2)) : value,
      low: meta.regularMarketDayLow ? parseFloat(Number(meta.regularMarketDayLow).toFixed(2)) : value,
      timestamp: meta.regularMarketTime ? meta.regularMarketTime * 1000 : Date.now()
    };
  } catch (err) {
    return null;
  }
}

async function indicesHandler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const now = Date.now();
  if (INDICES_CACHE && (now - LAST_CACHE_TIME) < CACHE_TTL_MS) {
    return res.status(200).json(INDICES_CACHE);
  }

  try {
    const fetchPromises = INDICES_CONFIG.map(async (cfg) => {
      const q = await fetchIndexQuote(cfg.symbol);
      if (q) {
        return {
          id: cfg.id,
          name: cfg.name,
          symbol: cfg.symbol,
          exchange: cfg.exchange,
          ...q
        };
      }
      // If live index fails, keep previous cached value or return null
      const prev = INDICES_CACHE?.indices?.[cfg.id];
      if (prev) return prev;
      return null;
    });

    const results = await Promise.all(fetchPromises);
    const indicesObj = {};
    results.forEach((item) => {
      if (item && item.id) {
        indicesObj[item.id] = item;
      }
    });

    const marketOpen = isIndianMarketOpen();
    const istTimeStr = new Date().toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const responseData = {
      status: 'SUCCESS',
      indices: indicesObj,
      marketStatus: {
        isOpen: marketOpen,
        state: marketOpen ? 'OPEN' : 'CLOSED',
        reason: marketOpen ? 'NSE/BSE Trading Hours' : 'Outside 09:15-15:30 IST / Weekend',
        timezone: 'IST',
        currentTimeIST: istTimeStr
      },
      timestamp: now
    };

    INDICES_CACHE = responseData;
    LAST_CACHE_TIME = now;

    return res.status(200).json(responseData);

  } catch (err) {
    console.error('[Indices API Error]:', err);
    if (INDICES_CACHE) {
      return res.status(200).json(INDICES_CACHE);
    }
    return res.status(500).json({ status: 'ERROR', error: 'Failed to fetch indices data' });
  }
}

module.exports = indicesHandler;
