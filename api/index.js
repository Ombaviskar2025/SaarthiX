// ============================================================
//  api/index.js  —  SaarthiX Express API Proxy (Vercel Serverless Entry)
// ============================================================
const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
require('dotenv').config();

const app = express();

// Enable CORS and serve static files from parent folder (when running locally)
app.use(cors());
app.use(express.static(path.join(__dirname, '..')));

// ── Auth Token Isolation Function ──────────────────────────
function getAccessToken() {
  return process.env.GROWW_ACCESS_TOKEN ? process.env.GROWW_ACCESS_TOKEN.trim() : '';
}

// Helper to make HTTPS requests
function fetchFromGroww(url) {
  return new Promise((resolve, reject) => {
    const token = getAccessToken();
    if (!token) {
      return reject({ status: 401, message: 'GROWW_ACCESS_TOKEN is missing in server configuration.' });
    }

    const options = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'X-API-VERSION': '1.0'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400 || (parsed && parsed.status === 'FAILURE')) {
            reject({
              status: res.statusCode || 500,
              message: parsed?.error?.message || parsed?.message || `Groww API error (HTTP ${res.statusCode})`
            });
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject({ status: 500, message: 'Failed to parse response JSON from Groww server.' });
        }
      });
    }).on('error', (err) => {
      reject({ status: 502, message: `Failed to connect to Groww server: ${err.message}` });
    });
  });
}

// ── Batch Last Traded Price (LTP) Proxy Route ───────────────
app.get('/api/ltp', async (req, res) => {
  try {
    const rawSymbols = req.query.symbols;
    if (!rawSymbols) {
      return res.status(400).json({ error: 'Missing required query parameter: symbols' });
    }

    const tickers = rawSymbols.split(',').map(s => s.trim().toUpperCase());
    
    // Support symbols pre-tagged with exchange prefix, default to NSE otherwise
    const exchangeSymbols = tickers.map(t => {
      if (t.startsWith('NSE_') || t.startsWith('BSE_')) {
        return t;
      }
      return `NSE_${t}`;
    }).join(',');
    const url = `https://api.groww.in/v1/live-data/ltp?segment=CASH&exchange_symbols=${exchangeSymbols}`;

    const data = await fetchFromGroww(url);

    // Map Groww's LTP response format back to frontend friendly structure
    const prices = {};
    if (data && Array.isArray(data)) {
      data.forEach(item => {
        const ticker = item.exchange_symbol ? item.exchange_symbol.replace(/^(NSE_|BSE_)/, '') : '';
        if (ticker) {
          prices[ticker] = {
            price: item.last_price || 0,
            change: item.day_change || 0,
            changePct: item.day_change_perc || 0
          };
        }
      });
    } else if (data && typeof data === 'object') {
      Object.entries(data).forEach(([key, val]) => {
        const ticker = key.replace(/^(NSE_|BSE_)/, '');
        prices[ticker] = {
          price: val.last_price || 0,
          change: val.day_change || 0,
          changePct: val.day_change_perc || 0
        };
      });
    }

    res.json({
      status: 'SUCCESS',
      prices,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('LTP API Proxy Error:', error);
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
    const symbol = req.query.symbol;
    if (!symbol) {
      return res.status(400).json({ error: 'Missing required query parameter: symbol' });
    }

    const exch = (req.query.exchange || 'NSE').toUpperCase();
    const url = `https://api.groww.in/v1/live-data/quote?segment=CASH&exchange=${exch}&trading_symbol=${symbol.toUpperCase()}`;

    const data = await fetchFromGroww(url);

    if (data && data.payload) {
      const p = data.payload;
      
      let formattedTime = '—';
      if (p.last_trade_time) {
        const date = new Date(p.last_trade_time);
        formattedTime = date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
      }

      res.json({
        status: 'SUCCESS',
        symbol: symbol.toUpperCase(),
        price: p.last_price || 0,
        change: p.day_change || 0,
        changePct: p.day_change_perc || 0,
        lastTradeTime: formattedTime,
        timestamp: new Date().toISOString()
      });
    } else {
      throw { status: 502, message: 'Invalid payload structure received from Groww quote API.' };
    }

  } catch (error) {
    console.error('Quote API Proxy Error:', error);
    res.status(error.status || 500).json({
      status: 'FAILURE',
      error: {
        code: error.status === 401 ? 'UNAUTHORIZED' : 'PROXY_ERROR',
        message: error.message || 'Internal Proxy Server Error'
      }
    });
  }
});

// Fallback to serve login page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login.html'));
});

module.exports = app;
