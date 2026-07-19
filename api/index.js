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

// ── Groww API Helpers & Authentication ────────────────────────
let cachedGrowwToken = null;
let cachedGrowwTokenExpiry = 0;

function base32ToBuffer(b32) {
  const cleanB32 = b32.toUpperCase().replace(/=+$/, '').replace(/[^A-Z2-7]/g, '');
  const len = cleanB32.length;
  const bufLen = Math.floor(len * 5 / 8);
  const buf = Buffer.alloc(bufLen);
  
  let bits = 0;
  let val = 0;
  let idx = 0;
  
  for (let i = 0; i < len; i++) {
    const char = cleanB32.charAt(i);
    let cval = 0;
    if (char >= 'A' && char <= 'Z') {
      cval = char.charCodeAt(0) - 65;
    } else if (char >= '2' && char <= '7') {
      cval = char.charCodeAt(0) - 50 + 26;
    }
    
    val = (val << 5) | cval;
    bits += 5;
    
    if (bits >= 8) {
      bits -= 8;
      if (idx < bufLen) {
        buf[idx++] = (val >>> bits) & 0xFF;
      }
    }
  }
  return buf;
}

function generateTOTP(secretB32) {
  const secretBuf = base32ToBuffer(secretB32);
  const counter = Math.floor(Date.now() / 1000 / 30);
  
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter), 0);
  
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha1', secretBuf);
  hmac.update(buffer);
  const digest = hmac.digest();
  
  const offset = digest[digest.length - 1] & 0x0F;
  const binary = (
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)
  ) % 1000000;
  
  return binary.toString().padStart(6, '0');
}

async function refreshGrowwToken() {
  const api_key = process.env.GROWW_API_KEY;
  const api_secret = process.env.GROWW_API_SECRET;

  if (!api_key || !api_secret) {
    throw new Error('GROWW_API_KEY and GROWW_API_SECRET must be configured in environment variables.');
  }

  const totpCode = generateTOTP(api_secret);
  const postData = JSON.stringify({
    key_type: 'totp',
    totp: totpCode
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.groww.in',
      port: 443,
      path: '/v1/token/api/access',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300 && json.access_token) {
            cachedGrowwToken = json.access_token;
            const expiresSec = json.expires_in || (12 * 3600);
            cachedGrowwTokenExpiry = Date.now() + (expiresSec * 1000);
            resolve(cachedGrowwToken);
          } else {
            reject(new Error(json.message || `Groww Auth failed with status ${res.statusCode}: ${data}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse Groww auth response: ${e.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

async function getGrowwToken() {
  if (cachedGrowwToken && Date.now() < cachedGrowwTokenExpiry) {
    return cachedGrowwToken;
  }
  return refreshGrowwToken();
}

async function callGrowwApi(apiPath, queryParams, retryCount = 0) {
  const token = await getGrowwToken();
  const queryString = Object.entries(queryParams)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
    
  const urlPath = `/v1${apiPath}${queryString ? '?' + queryString : ''}`;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.groww.in',
      port: 443,
      path: urlPath,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'X-API-VERSION': '1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', async () => {
        if (res.statusCode === 401 && retryCount < 1) {
          cachedGrowwToken = null;
          cachedGrowwTokenExpiry = 0;
          try {
            const retried = await callGrowwApi(apiPath, queryParams, retryCount + 1);
            return resolve(retried);
          } catch (err) {
            return reject(err);
          }
        }

        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(new Error(`Failed to parse Groww response: ${e.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

// ── Groww Token Generation Endpoint ─────────────────────────
app.get('/api/groww-token', async (req, res) => {
  try {
    const token = await getGrowwToken();
    res.json({
      status: 'SUCCESS',
      token: token,
      expiresAt: new Date(cachedGrowwTokenExpiry).toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'FAILURE',
      error: error.message || 'Failed to fetch Groww access token'
    });
  }
});

// ── Groww Market Data Proxy Endpoint ────────────────────────
app.get('/api/market-data', async (req, res) => {
  try {
    const { type, symbol, symbols } = req.query;
    
    // Check if credentials exist; if not, return simulated data as failsafe fallback
    const isGrowwConfigured = !!(process.env.GROWW_API_KEY && process.env.GROWW_API_SECRET);
    if (!isGrowwConfigured) {
      return getSimulatedMarketData(type, symbol, symbols, res);
    }
    
    if (type === 'quote') {
      if (!symbol) {
        return res.status(400).json({ error: 'Missing required query parameter: symbol' });
      }
      const data = await callGrowwApi('/live-data/quote', {
        exchange: req.query.exchange || 'NSE',
        segment: req.query.segment || 'CASH',
        trading_symbol: symbol
      });
      return res.json(data);
    }
    
    if (type === 'ltp') {
      if (!symbols) {
        return res.status(400).json({ error: 'Missing required query parameter: symbols' });
      }
      const data = await callGrowwApi('/live-data/ltp', {
        segment: req.query.segment || 'CASH',
        exchange_symbols: symbols
      });
      return res.json(data);
    }
    
    if (type === 'ohlc') {
      if (!symbols) {
        return res.status(400).json({ error: 'Missing required query parameter: symbols' });
      }
      const data = await callGrowwApi('/live-data/ohlc', {
        segment: req.query.segment || 'CASH',
        exchange_symbols: symbols
      });
      return res.json(data);
    }
    
    return res.status(400).json({ error: 'Invalid or missing query parameter: type. Must be "quote", "ltp", or "ohlc".' });
  } catch (error) {
    console.error('Market Data Proxy Error:', error);
    res.status(500).json({
      status: 'FAILURE',
      error: {
        code: 'PROXY_ERROR',
        message: error.message || 'Internal Proxy Server Error'
      }
    });
  }
});

// ── Failsafe Simulated Market Data Fallback Generator ────────
function getSimulatedMarketData(type, symbol, symbols, res) {
  if (type === 'quote') {
    const baseValue = symbol === 'NIFTY' ? 24398.15 : 80423.72;
    const drift = (Math.random() * 0.004 - 0.002);
    const dayChangePct = drift * 100;
    const value = baseValue * (1 + drift);
    
    return res.json({
      status: 'SUCCESS',
      payload: {
        last_price: parseFloat(value.toFixed(2)),
        day_change: parseFloat((value - baseValue).toFixed(2)),
        day_change_perc: parseFloat(dayChangePct.toFixed(2)),
        ohlc: {
          open: parseFloat((baseValue * 0.998).toFixed(2)),
          high: parseFloat((baseValue * 1.005).toFixed(2)),
          low: parseFloat((baseValue * 0.995).toFixed(2)),
          close: baseValue
        },
        volume: 1245678,
        '52w_high': parseFloat((baseValue * 1.15).toFixed(2)),
        '52w_low': parseFloat((baseValue * 0.85).toFixed(2))
      }
    });
  }
  
  if (type === 'ltp' || type === 'ohlc') {
    const symbolList = (symbols || '').split(',');
    const payload = {};
    
    symbolList.forEach(sym => {
      const ticker = sym.replace('NSE_', '').replace('BSE_', '');
      const mapping = DHAN_SYMBOL_MAP[ticker];
      const basePrice = mapping ? mapping.basePrice : 1000;
      
      const drift = (Math.random() * 0.008 - 0.004);
      const livePrice = basePrice * (1 + drift);
      const change = livePrice - basePrice;
      const changePct = drift * 100;
      
      if (type === 'ltp') {
        payload[sym] = {
          last_price: parseFloat(livePrice.toFixed(2)),
          day_change: parseFloat(change.toFixed(2)),
          day_change_perc: parseFloat(changePct.toFixed(2)),
          volume: Math.floor(Math.random() * 2000000) + 100000
        };
      } else {
        payload[sym] = {
          last_price: parseFloat(livePrice.toFixed(2)),
          day_change: parseFloat(change.toFixed(2)),
          day_change_perc: parseFloat(changePct.toFixed(2)),
          ohlc: {
            open: parseFloat((basePrice * 0.998).toFixed(2)),
            high: parseFloat((basePrice * 1.004).toFixed(2)),
            low: parseFloat((basePrice * 0.996).toFixed(2)),
            close: basePrice
          },
          '52w_high': parseFloat((basePrice * 1.2).toFixed(2)),
          '52w_low': parseFloat((basePrice * 0.8).toFixed(2))
        };
      }
    });
    
    return res.json({
      status: 'SUCCESS',
      payload: payload
    });
  }
  
  return res.status(400).json({ error: 'Invalid simulated request parameters' });
}

// ── Share Market News API (India) Integration ───────────────
app.get('/api/market-news', async (req, res) => {
  return new Promise((resolve) => {
    const apiKey = process.env.RAPIDAPI_KEY || 'aa89d7d7f6msh2e9abe9fc3322a4p14affdjsn6b92ee764733';
    const options = {
      hostname: 'share-market-news-api-india.p.rapidapi.com',
      port: 443,
      path: '/marketNews',
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'share-market-news-api-india.p.rapidapi.com',
        'Accept': 'application/json'
      }
    };

    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        try {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            const rawArray = JSON.parse(data);
            if (Array.isArray(rawArray)) {
              // Map the raw items to our frontend's expected properties
              const mapped = rawArray.map((item, index) => {
                const title = item.Title || '';
                const source = item.Source || 'Market News';
                
                // 1. Detect Ticker
                let ticker = null;
                const upperTitle = title.toUpperCase();
                if (upperTitle.includes('RELIANCE') || upperTitle.includes(' RIL')) ticker = 'RELIANCE';
                else if (upperTitle.includes('INFOSYS') || upperTitle.includes('INFY')) ticker = 'INFY';
                else if (upperTitle.includes('HDFC')) ticker = 'HDFCBANK';
                else if (upperTitle.includes('TCS')) ticker = 'TCS';
                else if (upperTitle.includes('SBI ')) ticker = 'SBIN';
                else if (upperTitle.includes('WIPRO')) ticker = 'WIPRO';
                else if (upperTitle.includes('BHARTIARTL') || upperTitle.includes('AIRTEL')) ticker = 'BHARTIARTL';
                else if (upperTitle.includes('TATA MOTORS') || upperTitle.includes('TATAMOTORS')) ticker = 'TATAMOTORS';
                else if (upperTitle.includes('KOTAK')) ticker = 'KOTAKBANK';
                else if (upperTitle.includes('ICICI')) ticker = 'ICICIBANK';
                else if (upperTitle.includes('ITC ')) ticker = 'ITC';
                
                // 2. Detect Sentiment
                let sentiment = 'neutral';
                const bullishWords = ['SURGE', 'SURGES', 'RISE', 'RISES', 'BUY', 'GROWTH', 'ACQUIRE', 'ACQUIRES', 'UP', 'BULLISH', 'RECOVERY', 'GAIN', 'GAINS', 'ALLOTMENT'];
                const bearishWords = ['DIP', 'DIPS', 'PRESSURE', 'SELLING', 'SELL', 'DOWN', 'BEARISH', 'SLUGGISH', 'WEAKENS', 'REDUCE', 'PARES'];
                
                const hasBull = bullishWords.some(word => upperTitle.includes(word));
                const hasBear = bearishWords.some(word => upperTitle.includes(word));
                if (hasBull && !hasBear) sentiment = 'bullish';
                else if (hasBear && !hasBull) sentiment = 'bearish';

                // 3. Detect Tags
                let tag = 'Macro';
                if (upperTitle.includes('IPO')) tag = 'IPO';
                else if (upperTitle.includes('BOND') || upperTitle.includes('RBI') || upperTitle.includes('DEBT') || upperTitle.includes('ECONOMY')) tag = 'Economy';
                else if (ticker) {
                  if (ticker === 'INFY' || ticker === 'TCS' || ticker === 'WIPRO') tag = 'IT';
                  else if (ticker === 'HDFCBANK' || ticker === 'SBIN' || ticker === 'ICICIBANK' || ticker === 'KOTAKBANK') tag = 'Banking';
                  else if (ticker === 'TATAMOTORS' || ticker === 'MARUTI') tag = 'Auto';
                  else if (ticker === 'SUNPHARMA') tag = 'Pharma';
                  else if (ticker === 'ITC') tag = 'FMCG';
                  else tag = 'Equity';
                }
                
                // 4. Generate Time
                const hour = Math.floor(index / 2) + 1;
                const timeStr = hour === 1 ? '1h ago' : `${hour}h ago`;

                // 5. Category Map
                let category = 'Economy';
                if (ticker) {
                  category = 'NSE';
                } else if (source.includes('Control')) {
                  category = 'BSE';
                }

                return {
                  id: index + 1,
                  headline: title,
                  summary: `Latest financial coverage from ${source}. Read the complete analysis at the official source link.`,
                  category: category,
                  sentiment: sentiment,
                  time: timeStr,
                  ticker: ticker,
                  tag: tag,
                  url: item.URL || '#'
                };
              });
              return resolve(res.json({ status: 'SUCCESS', payload: mapped }));
            }
          }
          return resolve(res.json({ status: 'SUCCESS', payload: getMockNews() }));
        } catch (e) {
          console.error('Failed to parse news API response:', e);
          return resolve(res.json({ status: 'SUCCESS', payload: getMockNews() }));
        }
      });
    });

    request.on('error', (err) => {
      console.error('News API request error:', err);
      return resolve(res.json({ status: 'SUCCESS', payload: getMockNews() }));
    });

    request.end();
  });
});

function getMockNews() {
  return [
    { id: 1, headline: 'Sensex surges 312 pts; RELIANCE & BHARTIARTL lead broad-based rally', summary: 'Strong FII buying and positive global cues drove markets higher.', category: 'BSE', sentiment: 'bullish', time: '2h ago', ticker: 'RELIANCE', tag: 'Large Cap' },
    { id: 2, headline: 'RBI keeps repo rate unchanged at 6.5%; signals accommodative stance', summary: 'The RBI MPC unanimously held repo rate steady.', category: 'Economy', sentiment: 'neutral', time: '4h ago', ticker: null, tag: 'Macro' },
    { id: 3, headline: 'INFY Q1 results beat estimates; revenue guidance raised to 4.5%–7%', summary: 'Infosys reported 12% jump in net profit for Q1FY26, beating estimates.', category: 'NSE', sentiment: 'bullish', time: '5h ago', ticker: 'INFY', tag: 'IT' }
  ];
}

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
    FINNHUB_API_KEY: mask(process.env.FINNHUB_API_KEY),
    GROWW_API_KEY: mask(process.env.GROWW_API_KEY),
    GROWW_API_SECRET: mask(process.env.GROWW_API_SECRET),
    RAPIDAPI_KEY: mask(process.env.RAPIDAPI_KEY)
  });
});

// Fallback to serve login page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login.html'));
});

module.exports = app;
