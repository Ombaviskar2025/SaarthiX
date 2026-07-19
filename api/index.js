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
  "BAJFINANCE": {
    "securityId": "317",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 1055.3
  },
  "CIPLA": {
    "securityId": "694",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 1419.5
  },
  "SBIN": {
    "securityId": "3045",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 1043.2
  },
  "DRREDDY": {
    "securityId": "881",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 1210.3
  },
  "HDFCBANK": {
    "securityId": "1333",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 820.8
  },
  "HEROMOTOCO": {
    "securityId": "1348",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 4906
  },
  "INFY": {
    "securityId": "1594",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 1094.2
  },
  "JSWSTEEL": {
    "securityId": "11723",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 1235
  },
  "KOTAKBANK": {
    "securityId": "1922",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 390.7
  },
  "GRASIM": {
    "securityId": "1232",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 3111.5
  },
  "ONGC": {
    "securityId": "2475",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 247.27
  },
  "RELIANCE": {
    "securityId": "2885",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 1328.8
  },
  "HINDALCO": {
    "securityId": "1363",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 945.05
  },
  "TATASTEEL": {
    "securityId": "3499",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 185.75
  },
  "LT": {
    "securityId": "11483",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 3817.9
  },
  "M&M": {
    "securityId": "2031",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 3178.9
  },
  "BPCL": {
    "securityId": "526",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 315
  },
  "HINDUNILVR": {
    "securityId": "1394",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 2140
  },
  "NESTLEIND": {
    "securityId": "17963",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 1427.8
  },
  "TATACONSUM": {
    "securityId": "3432",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 1088.8
  },
  "BRITANNIA": {
    "securityId": "547",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 5415
  },
  "ITC": {
    "securityId": "1660",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 280.5
  },
  "EICHERMOT": {
    "securityId": "910",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 7556
  },
  "WIPRO": {
    "securityId": "3787",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 175.9
  },
  "APOLLOHOSP": {
    "securityId": "157",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 8820
  },
  "ADANIENT": {
    "securityId": "25",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 3155
  },
  "SUNPHARMA": {
    "securityId": "3351",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 1934
  },
  "ICICIBANK": {
    "securityId": "4963",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 1454
  },
  "INDUSINDBK": {
    "securityId": "5258",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 1026.1
  },
  "AXISBANK": {
    "securityId": "5900",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 1329.4
  },
  "HCLTECH": {
    "securityId": "7229",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 1203.9
  },
  "BHARTIARTL": {
    "securityId": "10604",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 1908
  },
  "DIVISLAB": {
    "securityId": "10940",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 7247.5
  },
  "MARUTI": {
    "securityId": "10999",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 13824
  },
  "ULTRACEMCO": {
    "securityId": "11532",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 11685
  },
  "TCS": {
    "securityId": "11536",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 2266
  },
  "NTPC": {
    "securityId": "11630",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 341.9
  },
  "TECHM": {
    "securityId": "13538",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 1572.9
  },
  "POWERGRID": {
    "securityId": "14977",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 283.2
  },
  "ADANIPORTS": {
    "securityId": "15083",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 1836.5
  },
  "BAJAJ-AUTO": {
    "securityId": "16669",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 10439.5
  },
  "BAJAJFINSV": {
    "securityId": "16675",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 1854
  },
  "COALINDIA": {
    "securityId": "20374",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 427.6
  },
  "TATAMOTORS": {
    "securityId": "3456",
    "exchangeSegment": "NSE_EQ",
    "basePrice": 912.45
  },
  "NIFTY 50": {
    "securityId": "13",
    "exchangeSegment": "NSE_IDX",
    "basePrice": 24398.15
  },
  "SENSEX": {
    "securityId": "1",
    "exchangeSegment": "BSE_IDX",
    "basePrice": 80423.72
  },
  "BANK NIFTY": {
    "securityId": "25",
    "exchangeSegment": "NSE_IDX",
    "basePrice": 52841.6
  },
  "NIFTY IT": {
    "securityId": "15",
    "exchangeSegment": "NSE_IDX",
    "basePrice": 38924.3
  },
  "NIFTY MIDCAP": {
    "securityId": "21",
    "exchangeSegment": "NSE_IDX",
    "basePrice": 56234.8
  }
}

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
          if (res.statusCode >= 400 || parsed.status === 'failure' || parsed.status === 'failed') {
            let errorMsg = parsed.remarks || parsed.message;
            if (!errorMsg && parsed.data && typeof parsed.data === 'object') {
              const values = Object.values(parsed.data);
              if (values.length > 0) errorMsg = values[0];
            }
            reject({
              status: res.statusCode || 500,
              message: errorMsg || `Dhan API error (HTTP ${res.statusCode})`
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

// ── Google Finance Symbols & Caching ─────────────────────────
const GOOGLE_FINANCE_SYMBOL_MAP = {
  "NIFTY 50": "NIFTY_50:INDEXNSE",
  "SENSEX": "SENSEX:INDEXBOM",
  "BANK NIFTY": "NIFTY_BANK:INDEXNSE",
  "NIFTY IT": "NIFTY_IT:INDEXNSE",
  "NIFTY MIDCAP": "NIFTY_MIDCAP_50:INDEXNSE"
};

const GOOGLE_PRICE_CACHE = {};
const CACHE_TTL_MS = 15000; // Cache price for 15 seconds

function fetchLivePriceFromGoogle(ticker, exchange) {
  return new Promise((resolve) => {
    let quoteSymbol = GOOGLE_FINANCE_SYMBOL_MAP[ticker];
    if (!quoteSymbol) {
      let ex = 'NSE';
      if (exchange === 'BSE') ex = 'BOM';
      else if (exchange === 'NASDAQ') ex = 'NASDAQ';
      else if (exchange === 'NYSE') ex = 'NYSE';
      quoteSymbol = `${ticker}:${ex}`;
    }

    function performRequest(urlStr) {
      try {
        const url = new URL(urlStr);
        const options = {
          hostname: url.hostname,
          port: 443,
          path: url.pathname + url.search,
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+981'
          }
        };

        const req = https.request(options, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            const redirectUrl = new URL(res.headers.location, urlStr).toString();
            return performRequest(redirectUrl);
          }

          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            try {
              let specificMatch = null;

              // Try matching N6SYTe container which surrounds the main price
              const mainQuoteRegex = /class="[A-Za-z0-9\s]*N6SYTe"[^>]*>.*?<span[^>]*jsname="Pdsbrc"[^>]*>(?:<span[^>]*>)?([^<]+)/s;
              const mainMatch = data.match(mainQuoteRegex);
              if (mainMatch) {
                specificMatch = mainMatch[1];
              }

              const finalPriceStr = specificMatch;
              if (finalPriceStr) {
                let priceStr = finalPriceStr.replace(/[^\d\.]/g, '');
                const price = parseFloat(priceStr);
                if (!isNaN(price) && price > 0) {
                  return resolve(price);
                }
              }
              resolve(null);
            } catch (e) {
              resolve(null);
            }
          });
        });

        req.on('error', () => {
          resolve(null);
        });

        req.end();
      } catch (err) {
        resolve(null);
      }
    }

    performRequest(`https://www.google.com/finance/quote/${quoteSymbol}`);
  });
}

async function getLivePriceWithCache(ticker, exchange) {
  const cacheKey = `${ticker}_${exchange}`;
  const cached = GOOGLE_PRICE_CACHE[cacheKey];
  const now = Date.now();

  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.price;
  }

  const freshPrice = await fetchLivePriceFromGoogle(ticker, exchange);
  if (freshPrice !== null) {
    GOOGLE_PRICE_CACHE[cacheKey] = {
      price: freshPrice,
      timestamp: now
    };
    return freshPrice;
  }

  return cached ? cached.price : null;
}

// ── Batch Last Traded Price (LTP) Proxy Route ───────────────
app.get('/api/ltp', async (req, res) => {
  try {
    const rawSymbols = req.query.symbols;
    if (!rawSymbols) {
      return res.status(400).json({ error: 'Missing required query parameter: symbols' });
    }

    const tickers = rawSymbols.split(',').map(s => s.trim().toUpperCase());
    const prices = {};

    // 1. Try fetching from Dhan API if configured
    let dhanSuccess = false;
    if (isDhanConfigured()) {
      try {
        const body = {};
        const symbolLookups = {};
        
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

        if (Object.keys(body).length > 0) {
          const responseData = await postToDhan('/v2/marketfeed/ltp', body);
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
            dhanSuccess = true;
          }
        }
      } catch (err) {
        console.warn('Dhan API failed or unauthorized, falling back to Google Finance:', err.message);
      }
    }

    // 2. If Dhan is not configured, or Dhan fetch failed, fall back to Google Finance
    if (!dhanSuccess) {
      const googlePromises = tickers.map(async (ticker) => {
        const mapping = DHAN_SYMBOL_MAP[ticker];
        if (mapping) {
          const exchange = mapping.exchangeSegment.includes('BSE') ? 'BSE' : 'NSE';
          const livePrice = await getLivePriceWithCache(ticker, exchange);
          
          if (livePrice !== null) {
            const basePrice = mapping.basePrice;
            const change = livePrice - basePrice;
            const changePct = basePrice > 0 ? (change / basePrice) * 100 : 0;
            
            prices[ticker] = {
              price: livePrice,
              change: parseFloat(change.toFixed(2)),
              changePct: parseFloat(changePct.toFixed(2))
            };
            return;
          }
        }
        
        // 3. Layer 3 Fallback: Simulated random walk on the server if Google Finance also fails
        const mappingFallback = DHAN_SYMBOL_MAP[ticker];
        if (mappingFallback) {
          const drift = (Math.random() * 0.004 - 0.002); // Small random walk (-0.2% to +0.2%)
          const simulatedPrice = mappingFallback.basePrice * (1 + drift);
          const change = simulatedPrice - mappingFallback.basePrice;
          const changePct = drift * 100;
          prices[ticker] = {
            price: parseFloat(simulatedPrice.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePct: parseFloat(changePct.toFixed(2))
          };
        }
      });
      await Promise.all(googlePromises);
    }

    res.json({
      status: 'SUCCESS',
      prices,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('LTP Proxy Error:', error);
    res.status(500).json({
      status: 'FAILURE',
      error: {
        code: 'PROXY_ERROR',
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

    const symKey = symbol.toUpperCase();
    const mapping = DHAN_SYMBOL_MAP[symKey];
    
    if (!mapping) {
      return res.status(404).json({ error: `Symbol ${symbol} is not supported in the current watchlists.` });
    }

    let quotePrice = null;
    let quoteSuccess = false;

    // 1. Try Dhan
    if (isDhanConfigured()) {
      try {
        const body = {
          [mapping.exchangeSegment]: [parseInt(mapping.securityId)]
        };
        const responseData = await postToDhan('/v2/marketfeed/ltp', body);
        const details = responseData?.data?.[mapping.exchangeSegment]?.[mapping.securityId];
        if (details) {
          quotePrice = details.lastPrice || details.last_price || 0;
          quoteSuccess = true;
        }
      } catch (err) {
        console.warn('Dhan API failed on quote request, trying Google Finance...');
      }
    }

    // 2. Try Google Finance
    if (!quoteSuccess) {
      const exchange = mapping.exchangeSegment.includes('BSE') ? 'BSE' : 'NSE';
      const livePrice = await getLivePriceWithCache(symKey, exchange);
      if (livePrice !== null) {
        quotePrice = livePrice;
        quoteSuccess = true;
      }
    }

    // 3. Fallback to basePrice if both fail
    if (quotePrice === null) {
      quotePrice = mapping.basePrice;
    }

    const basePrice = mapping.basePrice;
    const change = quotePrice - basePrice;
    const changePct = basePrice > 0 ? (change / basePrice) * 100 : 0;

    res.json({
      status: 'SUCCESS',
      symbol: symKey,
      price: quotePrice,
      change: parseFloat(change.toFixed(2)),
      changePct: parseFloat(changePct.toFixed(2)),
      lastTradeTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Quote Proxy Error:', error);
    res.status(500).json({
      status: 'FAILURE',
      error: {
        code: 'PROXY_ERROR',
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
    DHAN_API_SECRET: mask(process.env.DHAN_API_SECRET),
    FINNHUB_API_KEY: mask(process.env.FINNHUB_API_KEY)
  });
});

// Fallback to serve login page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login.html'));
});

module.exports = app;
