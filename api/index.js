// ============================================================
//  api/index.js  —  SaarthiX Express API Proxy (Vercel Serverless Entry)
// ============================================================
const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, '..')));

// ── Dhan Symbol Security ID & Baseline Price Mapping ─────────
const DHAN_SYMBOL_MAP = {
  "BAJFINANCE": { "securityId": "317", "exchangeSegment": "NSE_EQ", "basePrice": 6892.30 },
  "CIPLA": { "securityId": "694", "exchangeSegment": "NSE_EQ", "basePrice": 1612.30 },
  "SBIN": { "securityId": "3045", "exchangeSegment": "NSE_EQ", "basePrice": 824.35 },
  "DRREDDY": { "securityId": "881", "exchangeSegment": "NSE_EQ", "basePrice": 6824.35 },
  "HDFCBANK": { "securityId": "1333", "exchangeSegment": "NSE_EQ", "basePrice": 1783.25 },
  "HEROMOTOCO": { "securityId": "1348", "exchangeSegment": "NSE_EQ", "basePrice": 4812.30 },
  "INFY": { "securityId": "1594", "exchangeSegment": "NSE_EQ", "basePrice": 1624.55 },
  "JSWSTEEL": { "securityId": "11723", "exchangeSegment": "NSE_EQ", "basePrice": 924.30 },
  "KOTAKBANK": { "securityId": "1922", "exchangeSegment": "NSE_EQ", "basePrice": 1892.15 },
  "GRASIM": { "securityId": "1232", "exchangeSegment": "NSE_EQ", "basePrice": 2812.65 },
  "ONGC": { "securityId": "2475", "exchangeSegment": "NSE_EQ", "basePrice": 284.30 },
  "RELIANCE": { "securityId": "2885", "exchangeSegment": "NSE_EQ", "basePrice": 2847.65 },
  "HINDALCO": { "securityId": "1363", "exchangeSegment": "NSE_EQ", "basePrice": 712.45 },
  "TATASTEEL": { "securityId": "3499", "exchangeSegment": "NSE_EQ", "basePrice": 162.45 },
  "LT": { "securityId": "11483", "exchangeSegment": "NSE_EQ", "basePrice": 3412.65 },
  "M&M": { "securityId": "2031", "exchangeSegment": "NSE_EQ", "basePrice": 2812.40 },
  "BPCL": { "securityId": "526", "exchangeSegment": "NSE_EQ", "basePrice": 312.45 },
  "HINDUNILVR": { "securityId": "1394", "exchangeSegment": "NSE_EQ", "basePrice": 2456.80 },
  "NESTLEIND": { "securityId": "17963", "exchangeSegment": "NSE_EQ", "basePrice": 2312.65 },
  "TATACONSUM": { "securityId": "3432", "exchangeSegment": "NSE_EQ", "basePrice": 1212.45 },
  "BRITANNIA": { "securityId": "547", "exchangeSegment": "NSE_EQ", "basePrice": 5412.30 },
  "ITC": { "securityId": "1660", "exchangeSegment": "NSE_EQ", "basePrice": 468.25 },
  "EICHERMOT": { "securityId": "910", "exchangeSegment": "NSE_EQ", "basePrice": 5412.65 },
  "WIPRO": { "securityId": "3787", "exchangeSegment": "NSE_EQ", "basePrice": 538.20 },
  "APOLLOHOSP": { "securityId": "157", "exchangeSegment": "NSE_EQ", "basePrice": 7212.45 },
  "ADANIENT": { "securityId": "25", "exchangeSegment": "NSE_EQ", "basePrice": 2912.45 },
  "SUNPHARMA": { "securityId": "3351", "exchangeSegment": "NSE_EQ", "basePrice": 1892.45 },
  "ICICIBANK": { "securityId": "4963", "exchangeSegment": "NSE_EQ", "basePrice": 1238.60 },
  "INDUSINDBK": { "securityId": "5258", "exchangeSegment": "NSE_EQ", "basePrice": 1012.45 },
  "AXISBANK": { "securityId": "5900", "exchangeSegment": "NSE_EQ", "basePrice": 1156.40 },
  "HCLTECH": { "securityId": "7229", "exchangeSegment": "NSE_EQ", "basePrice": 1724.30 },
  "BHARTIARTL": { "securityId": "10604", "exchangeSegment": "NSE_EQ", "basePrice": 1634.25 },
  "DIVISLAB": { "securityId": "10940", "exchangeSegment": "NSE_EQ", "basePrice": 4812.65 },
  "MARUTI": { "securityId": "10999", "exchangeSegment": "NSE_EQ", "basePrice": 11245.60 },
  "ULTRACEMCO": { "securityId": "11532", "exchangeSegment": "NSE_EQ", "basePrice": 11824.35 },
  "TCS": { "securityId": "11536", "exchangeSegment": "NSE_EQ", "basePrice": 3921.40 },
  "NTPC": { "securityId": "11630", "exchangeSegment": "NSE_EQ", "basePrice": 412.30 },
  "TECHM": { "securityId": "13538", "exchangeSegment": "NSE_EQ", "basePrice": 1524.65 },
  "POWERGRID": { "securityId": "14977", "exchangeSegment": "NSE_EQ", "basePrice": 342.45 },
  "ADANIPORTS": { "securityId": "15083", "exchangeSegment": "NSE_EQ", "basePrice": 1412.65 },
  "BAJAJ-AUTO": { "securityId": "16669", "exchangeSegment": "NSE_EQ", "basePrice": 8924.30 },
  "BAJAJFINSV": { "securityId": "16675", "exchangeSegment": "NSE_EQ", "basePrice": 1712.40 },
  "COALINDIA": { "securityId": "20374", "exchangeSegment": "NSE_EQ", "basePrice": 524.30 },
  "TATAMOTORS": { "securityId": "3456", "exchangeSegment": "NSE_EQ", "basePrice": 812.45 },
  "NIFTY 50": { "securityId": "13", "exchangeSegment": "NSE_IDX", "basePrice": 24398.15 },
  "SENSEX": { "securityId": "1", "exchangeSegment": "BSE_IDX", "basePrice": 80423.72 },
  "BANK NIFTY": { "securityId": "25", "exchangeSegment": "NSE_IDX", "basePrice": 52841.60 },
  "NIFTY IT": { "securityId": "15", "exchangeSegment": "NSE_IDX", "basePrice": 38924.30 },
  "NIFTY MIDCAP": { "securityId": "21", "exchangeSegment": "NSE_IDX", "basePrice": 56234.80 }
};

// ── Auth Token Verification ───────────────────────────
function isDhanConfigured() {
  return !!process.env.DHAN_ACCESS_TOKEN;
}

// ── Dhan API POST Requester ───────────────────────────
function postToDhan(path, body) {
  return new Promise((resolve, reject) => {
    const token = process.env.DHAN_ACCESS_TOKEN ? process.env.DHAN_ACCESS_TOKEN.trim() : '';
    const clientId = process.env.DHAN_CLIENT_ID ? process.env.DHAN_CLIENT_ID.trim() : (process.env.DHAN_API_KEY ? process.env.DHAN_API_KEY.trim() : '');
    
    if (!token) {
      return reject({ status: 401, message: 'DHAN_ACCESS_TOKEN is missing in server environment variables.' });
    }

    const payload = JSON.stringify(body);
    const options = {
      hostname: 'api.dhan.co',
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'access-token': token,
        'client-id': clientId,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400 || parsed.status === 'failure') {
            reject({
              status: res.statusCode || 500,
              message: parsed.remarks || parsed.message || `Dhan API error (HTTP ${res.statusCode})`
            });
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject({ status: 500, message: 'Failed to parse response JSON from Dhan server.' });
        }
      });
    });

    req.on('error', (err) => {
      reject({ status: 502, message: `Failed to connect to Dhan server: ${err.message}` });
    });

    req.write(payload);
    req.end();
  });
}

// ── Batch Last Traded Price (LTP) Proxy Route ───────────────
app.get('/api/ltp', async (req, res) => {
  try {
    if (!isDhanConfigured()) {
      return res.json({
        status: 'SIMULATED',
        message: 'DHAN_ACCESS_TOKEN is missing in server environment variables. Operating in demo mode.'
      });
    }

    const rawSymbols = req.query.symbols;
    if (!rawSymbols) {
      return res.status(400).json({ error: 'Missing required query parameter: symbols' });
    }

    const tickers = rawSymbols.split(',').map(s => s.trim().toUpperCase());
    
    // Group security IDs by exchangeSegment for Dhan payload
    const body = {};
    const symbolLookups = {}; // Keep a reverse lookup to find symbols by segment+secId later
    
    tickers.forEach(ticker => {
      const mapping = DHAN_SYMBOL_MAP[ticker];
      if (mapping) {
        if (!body[mapping.exchangeSegment]) {
          body[mapping.exchangeSegment] = [];
        }
        const numericId = parseInt(mapping.securityId);
        if (!body[mapping.exchangeSegment].includes(numericId)) {
          body[mapping.exchangeSegment].push(numericId);
        }
        symbolLookups[`${mapping.exchangeSegment}_${mapping.securityId}`] = ticker;
      }
    });

    if (Object.keys(body).length === 0) {
      return res.json({ status: 'SUCCESS', prices: {}, timestamp: new Date().toISOString() });
    }

    // Call Dhan API
    const responseData = await postToDhan('/v2/marketfeed/ltp', body);
    
    // Parse Dhan response back to standard format
    const prices = {};
    if (responseData && responseData.data) {
      Object.entries(responseData.data).forEach(([segment, securityMap]) => {
        Object.entries(securityMap).forEach(([secId, details]) => {
          const symbol = symbolLookups[`${segment}_${secId}`];
          if (symbol) {
            const lastPrice = details.lastPrice || details.last_price || 0;
            const mapping = DHAN_SYMBOL_MAP[symbol];
            const basePrice = mapping.basePrice;
            const change = lastPrice - basePrice;
            const changePct = basePrice > 0 ? (change / basePrice) * 100 : 0;

            prices[symbol] = {
              price: lastPrice,
              change: parseFloat(change.toFixed(2)),
              changePct: parseFloat(changePct.toFixed(2))
            };
          }
        });
      });
    }

    res.json({
      status: 'SUCCESS',
      prices,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dhan LTP API Proxy Error:', error);
    res.status(error.status || 500).json({
      status: 'FAILURE',
      error: {
        code: error.status === 401 ? 'UNAUTHORIZED' : 'PROXY_ERROR',
        message: error.message || 'Internal Proxy Server Error'
      }
    });
  }
});

// ── Single Stock Quote Proxy Route ──────────────────────────
app.get('/api/quote', async (req, res) => {
  try {
    if (!isDhanConfigured()) {
      return res.json({
        status: 'SIMULATED',
        message: 'DHAN_ACCESS_TOKEN is missing in server environment variables. Operating in demo mode.'
      });
    }

    const symbol = req.query.symbol;
    if (!symbol) {
      return res.status(400).json({ error: 'Missing required query parameter: symbol' });
    }

    const symKey = symbol.toUpperCase();
    const mapping = DHAN_SYMBOL_MAP[symKey];
    
    if (!mapping) {
      return res.status(404).json({ error: `Symbol ${symbol} is not supported in the current watchlists.` });
    }

    const body = {
      [mapping.exchangeSegment]: [parseInt(mapping.securityId)]
    };

    const responseData = await postToDhan('/v2/marketfeed/ltp', body);
    const details = responseData?.data?.[mapping.exchangeSegment]?.[mapping.securityId];
    
    if (details) {
      const lastPrice = details.lastPrice || details.last_price || 0;
      const basePrice = mapping.basePrice;
      const change = lastPrice - basePrice;
      const changePct = basePrice > 0 ? (change / basePrice) * 100 : 0;
      
      res.json({
        status: 'SUCCESS',
        symbol: symKey,
        price: lastPrice,
        change: parseFloat(change.toFixed(2)),
        changePct: parseFloat(changePct.toFixed(2)),
        lastTradeTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }),
        timestamp: new Date().toISOString()
      });
    } else {
      throw { status: 502, message: 'Invalid payload structure received from Dhan quote API.' };
    }

  } catch (error) {
    console.error('Dhan Quote API Proxy Error:', error);
    res.status(error.status || 500).json({
      status: 'FAILURE',
      error: {
        code: error.status === 401 ? 'UNAUTHORIZED' : 'PROXY_ERROR',
        message: error.message || 'Internal Proxy Server Error'
      }
    });
  }
});

// ── Debug environment variables securely (only show lengths and partial values) ──
app.get('/api/debug-env', (req, res) => {
  const mask = (val) => {
    if (!val) return 'not defined / empty';
    const trimmed = val.trim();
    if (trimmed.length <= 8) return `defined (len: ${trimmed.length}, value: "${trimmed}")`;
    return `defined (len: ${trimmed.length}, start: "${trimmed.substring(0, 4)}...", end: "...${trimmed.substring(trimmed.length - 4)}")`;
  };

  res.json({
    DHAN_ACCESS_TOKEN: mask(process.env.DHAN_ACCESS_TOKEN),
    DHAN_CLIENT_ID: mask(process.env.DHAN_CLIENT_ID),
    DHAN_API_KEY: mask(process.env.DHAN_API_KEY),
    DHAN_API_SECRET: mask(process.env.DHAN_API_SECRET)
  });
});

// Fallback to serve login page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login.html'));
});

module.exports = app;
