// ============================================================
//  api/quote.js — Real-Time Indian Market Quote Proxy (NSE/BSE)
//  Primary: Yahoo Finance Chart Meta | Fallback: Twelve Data / Internal
// ============================================================
'use strict';

const QUOTE_CACHE = new Map();
const CACHE_TTL_MS = 20 * 1000; // 20 seconds cache

const YAHOO_INDEX_MAP = {
  'SENSEX': '^BSESN',
  'NIFTY50': '^NSEI',
  'NIFTY': '^NSEI',
  'BANKNIFTY': '^NSEBANK',
  'NIFTYIT': '^CNXIT',
  'NIFTYMIDCAP': 'NIFTY_MIDCAP_100.NS'
};

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
  if (YAHOO_INDEX_MAP[clean]) return YAHOO_INDEX_MAP[clean];
  if (SYMBOL_OVERRIDES[clean]) return SYMBOL_OVERRIDES[clean];
  if (clean.endsWith('.NS') || clean.endsWith('.BO') || clean.startsWith('^')) {
    return clean;
  }
  return `${clean}.NS`;
}

async function fetchYahooQuote(yahooSymbol) {
  const hosts = [
    'https://query1.finance.yahoo.com',
    'https://query2.finance.yahoo.com'
  ];

  let lastErr = null;
  for (const host of hosts) {
    try {
      const url = `${host}/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=1d&interval=1d`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        }
      });

      if (!res.ok) {
        lastErr = new Error(`HTTP ${res.status} from ${host}`);
        continue;
      }

      const json = await res.json();
      const meta = json?.chart?.result?.[0]?.meta;
      if (!meta) {
        lastErr = new Error(`No meta in chart response`);
        continue;
      }

      const price = meta.regularMarketPrice ?? meta.chartPreviousClose ?? 0;
      const prevClose = meta.chartPreviousClose ?? price;
      const change = parseFloat((price - prevClose).toFixed(2));
      const changePct = prevClose > 0 ? parseFloat(((change / prevClose) * 100).toFixed(2)) : 0;

      return {
        symbol: meta.symbol || yahooSymbol,
        name: meta.longName || meta.shortName || yahooSymbol.replace(/\.(NS|BO)$/, ''),
        exchange: meta.symbol?.endsWith('.BO') || meta.exchangeName === 'BSE' ? 'BSE' : 'NSE',
        price: parseFloat(Number(price).toFixed(2)),
        ltp: parseFloat(Number(price).toFixed(2)),
        change,
        changePct,
        prevClose: parseFloat(Number(prevClose).toFixed(2)),
        dayHigh: meta.regularMarketDayHigh ? parseFloat(Number(meta.regularMarketDayHigh).toFixed(2)) : price,
        dayLow: meta.regularMarketDayLow ? parseFloat(Number(meta.regularMarketDayLow).toFixed(2)) : price,
        volume: meta.regularMarketVolume || 0,
        fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ? parseFloat(Number(meta.fiftyTwoWeekHigh).toFixed(2)) : null,
        fiftyTwoWeekLow: meta.fiftyTwoWeekLow ? parseFloat(Number(meta.fiftyTwoWeekLow).toFixed(2)) : null,
        currency: meta.currency || 'INR',
        marketState: meta.currentTradingPeriod?.regular ? 'REGULAR' : 'CLOSED',
        timestamp: meta.regularMarketTime ? meta.regularMarketTime * 1000 : Date.now(),
        source: 'Yahoo Finance'
      };
    } catch (err) {
      lastErr = err;
    }
  }

  // If .NS failed and wasn't explicit, try .BO
  if (yahooSymbol.endsWith('.NS')) {
    const bseSym = yahooSymbol.replace(/\.NS$/, '.BO');
    try {
      return await fetchYahooQuote(bseSym);
    } catch (e) {
      // ignore, fall through to error
    }
  }

  throw (lastErr || new Error(`Failed to fetch quote for ${yahooSymbol}`));
}

// Optional secondary provider: TwelveData API
async function fetchTwelveDataQuote(cleanSym) {
  const apiKey = process.env.TWELVEDATA_API_KEY;
  if (!apiKey) return null;
  try {
    const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(cleanSym)}&exchange=NSE&apikey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const d = await res.json();
    if (!d || d.code || !d.close) return null;

    const price = parseFloat(d.close);
    const prevClose = parseFloat(d.previous_close || price);
    const change = parseFloat(d.change || (price - prevClose));
    const changePct = parseFloat(d.percent_change || 0);

    return {
      symbol: cleanSym,
      name: d.name || cleanSym,
      exchange: 'NSE',
      price,
      ltp: price,
      change,
      changePct,
      prevClose,
      dayHigh: parseFloat(d.high || price),
      dayLow: parseFloat(d.low || price),
      volume: parseInt(d.volume, 10) || 0,
      fiftyTwoWeekHigh: d.fifty_two_week?.high ? parseFloat(d.fifty_two_week.high) : null,
      fiftyTwoWeekLow: d.fifty_two_week?.low ? parseFloat(d.fifty_two_week.low) : null,
      currency: 'INR',
      marketState: d.is_market_open ? 'REGULAR' : 'CLOSED',
      timestamp: Date.now(),
      source: 'Twelve Data'
    };
  } catch (err) {
    return null;
  }
}

async function getSingleQuote(rawSymbol) {
  const cleanTicker = rawSymbol.trim().toUpperCase().replace(/\.(NS|BO)$/, '');
  const now = Date.now();
  const cached = QUOTE_CACHE.get(cleanTicker);
  if (cached && (now - cached.cachedAt) < CACHE_TTL_MS) {
    return cached.data;
  }

  const yahooSymbol = resolveYahooSymbol(cleanTicker);
  let quote = null;

  try {
    quote = await fetchYahooQuote(yahooSymbol);
  } catch (yErr) {
    console.warn(`[Quote API] Yahoo failed for ${rawSymbol}:`, yErr.message);
    quote = await fetchTwelveDataQuote(cleanTicker);
  }

  if (!quote) {
    throw new Error(`Market quote unavailable for ${rawSymbol}`);
  }

  quote.cleanTicker = cleanTicker;
  QUOTE_CACHE.set(cleanTicker, { data: quote, cachedAt: now });
  return quote;
}

async function quoteHandler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const queryParam = req.query.symbols || req.query.symbol || req.query.q || '';
    if (!queryParam) {
      return res.status(400).json({ status: 'ERROR', error: 'Missing symbols query parameter (e.g. ?symbols=INOXWIND,RELIANCE)' });
    }

    const symbols = queryParam.split(',').map(s => s.trim()).filter(Boolean);
    const results = await Promise.allSettled(symbols.map(s => getSingleQuote(s)));

    const quotes = {};
    const errors = {};

    results.forEach((r, idx) => {
      const sym = symbols[idx].toUpperCase().replace(/\.(NS|BO)$/, '');
      if (r.status === 'fulfilled') {
        quotes[sym] = r.value;
      } else {
        errors[sym] = r.reason?.message || 'Data unavailable';
      }
    });

    const isSingle = symbols.length === 1 && !req.query.symbols?.includes(',');
    if (isSingle) {
      const sym = symbols[0].toUpperCase().replace(/\.(NS|BO)$/, '');
      if (quotes[sym]) {
        return res.status(200).json({ status: 'SUCCESS', quote: quotes[sym] });
      } else {
        return res.status(404).json({ status: 'ERROR', error: errors[sym] || 'Quote unavailable', symbol: sym });
      }
    }

    return res.status(200).json({
      status: 'SUCCESS',
      count: Object.keys(quotes).length,
      quotes,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      timestamp: Date.now()
    });

  } catch (err) {
    console.error('[Quote API Error]:', err);
    return res.status(500).json({ status: 'ERROR', error: err.message || 'Internal quote server error' });
  }
}

module.exports = quoteHandler;
