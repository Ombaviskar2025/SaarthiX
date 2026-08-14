// ============================================================
//  api/portfolio.js — Institutional Portfolio Data & Analysis Service
// ============================================================
'use strict';

const https = require('https');
let technicalindicators;
try {
  technicalindicators = require('technicalindicators');
} catch (e) {
  technicalindicators = null;
}

// ── In-Memory Multi-Tier Cache ──────────────────────────────
const memoryCache = {
  indices: { data: null, timestamp: 0 },
  charts: new Map(),       // key: "SYMBOL:RANGE:INTERVAL" -> { data, timestamp }
  analysis: new Map(),     // key: "SYMBOL:RANGE" -> { data, timestamp }
  aiTheses: new Map(),     // key: "SYMBOL" -> { data, timestamp }
  lastKnownQuotes: new Map() // fallback storage for symbols to prevent dashes
};

const INDEX_CACHE_TTL_MS = 20 * 1000;       // 20s
const CHART_CACHE_TTL_MS = 60 * 1000;       // 60s
const ANALYSIS_CACHE_TTL_MS = 60 * 1000;    // 60s
const AI_CACHE_TTL_MS = 5 * 60 * 1000;      // 5 min

// ── Default User Holdings Database ──────────────────────────
const DEFAULT_HOLDINGS = [
  {
    ticker: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    exchange: 'NSE',
    sector: 'Energy',
    quantity: 120,
    avgBuyPrice: 1285.50,
    currency: 'INR'
  },
  {
    ticker: 'TCS',
    name: 'Tata Consultancy Services',
    exchange: 'NSE',
    sector: 'IT',
    quantity: 45,
    avgBuyPrice: 2310.00,
    currency: 'INR'
  },
  {
    ticker: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    exchange: 'NSE',
    sector: 'Banking',
    quantity: 80,
    avgBuyPrice: 835.20,
    currency: 'INR'
  },
  {
    ticker: 'INFY',
    name: 'Infosys Ltd.',
    exchange: 'NSE',
    sector: 'IT',
    quantity: 65,
    avgBuyPrice: 1040.00,
    currency: 'INR'
  }
];

const DEFAULT_CASH_BALANCE = 84500.00;

// ── Helpers ─────────────────────────────────────────────────
function fetchWithTimeout(url, options = {}, timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        ...(options.headers || {})
      },
      timeout: timeoutMs
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve({ ok: true, json: () => Promise.resolve(JSON.parse(data)) });
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          resolve({ ok: false, status: res.statusCode, json: () => Promise.resolve({}) });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    });

    req.on('error', (err) => reject(err));

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

function isNseMarketOpen() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + istOffset);
  const day = istDate.getDay(); // 0 = Sun, 6 = Sat
  if (day === 0 || day === 6) return false;

  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const currentTimeMinutes = hours * 60 + minutes;

  const marketOpen = 9 * 60 + 15;  // 09:15 IST
  const marketClose = 15 * 60 + 30; // 15:30 IST

  return currentTimeMinutes >= marketOpen && currentTimeMinutes <= marketClose;
}

// ── Yahoo Chart Fetcher with Multi-interval Mapping ─────────
async function fetchYahooOHLCV(symbol, range = '1y') {
  const cleanSym = (symbol || '').toUpperCase().trim();
  const isIndex = cleanSym.startsWith('^');
  let ySymbol = cleanSym;

  if (!isIndex && !cleanSym.endsWith('.NS') && !cleanSym.endsWith('.BO')) {
    ySymbol = `${cleanSym}.NS`;
  }

  let interval = '1d';
  let yRange = '1y';
  if (range === '1d') {
    yRange = '1d';
    interval = '5m';
  } else if (range === '1w') {
    yRange = '5d';
    interval = '15m';
  } else if (range === '1m') {
    yRange = '1mo';
    interval = '1d';
  } else if (range === '6m') {
    yRange = '6mo';
    interval = '1d';
  } else if (range === '1y') {
    yRange = '1y';
    interval = '1d';
  } else {
    range = '1y';
    yRange = '1y';
    interval = '1d';
  }

  const cacheKey = `${ySymbol}:${range}:${interval}`;
  const now = Date.now();
  const cached = memoryCache.charts.get(cacheKey);
  if (cached && (now - cached.timestamp) < CHART_CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ySymbol)}?range=${yRange}&interval=${interval}&includePrePost=false`;
    let res = await fetchWithTimeout(url, {}, 5000);
    
    // Fallback to .BO if NSE symbol failed and it's not an index
    if ((!res.ok || !res) && ySymbol.endsWith('.NS')) {
      const bseSym = `${cleanSym}.BO`;
      const bseUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(bseSym)}?range=${yRange}&interval=${interval}&includePrePost=false`;
      try {
        res = await fetchWithTimeout(bseUrl, {}, 5000);
      } catch (err) {
        // fallback handling below
      }
    }

    if (res && res.ok) {
      const json = await res.json();
      const result = json?.chart?.result?.[0];
      if (result && result.timestamp && result.timestamp.length > 0) {
        const timestamps = result.timestamp;
        const quotes = result.indicators?.quote?.[0] || {};
        const opens = quotes.open || [];
        const highs = quotes.high || [];
        const lows = quotes.low || [];
        const closes = quotes.close || [];
        const volumes = quotes.volume || [];
        const meta = result.meta || {};

        const dataPoints = [];
        for (let i = 0; i < timestamps.length; i++) {
          const c = closes[i];
          if (c !== null && c !== undefined && !isNaN(c)) {
            const o = opens[i] ?? c;
            const h = highs[i] ?? Math.max(o, c);
            const l = lows[i] ?? Math.min(o, c);
            const v = volumes[i] ?? 0;
            const t = timestamps[i];

            // For intraday (1d/1w) lightweight-charts accepts unix timestamp (seconds).
            // For daily (1m/6m/1y), string format 'YYYY-MM-DD' or timestamp.
            const timeVal = (range === '1d' || range === '1w')
              ? t
              : new Date(t * 1000).toISOString().split('T')[0];

            dataPoints.push({
              time: timeVal,
              timestamp: t,
              open: parseFloat(o.toFixed(2)),
              high: parseFloat(h.toFixed(2)),
              low: parseFloat(l.toFixed(2)),
              close: parseFloat(c.toFixed(2)),
              volume: Math.round(v)
            });
          }
        }

        if (dataPoints.length > 0) {
          const output = {
            symbol: cleanSym,
            range,
            interval,
            meta: {
              regularMarketPrice: meta.regularMarketPrice || dataPoints[dataPoints.length - 1].close,
              previousClose: meta.chartPreviousClose || meta.previousClose || dataPoints[0].open,
              fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
              fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
              currency: meta.currency || 'INR',
              exchangeName: meta.exchangeName || 'NSE'
            },
            dataPoints,
            isDelayed: !isNseMarketOpen()
          };

          memoryCache.charts.set(cacheKey, { data: output, timestamp: now });
          memoryCache.lastKnownQuotes.set(cleanSym, output);
          return output;
        }
      }
    }
  } catch (err) {
    console.warn(`[YahooChart] Error fetching ${ySymbol}: ${err.message}`);
  }

  // Resilient fallback from last known quote or synthetic base
  if (memoryCache.lastKnownQuotes.has(cleanSym)) {
    const fallback = memoryCache.lastKnownQuotes.get(cleanSym);
    return { ...fallback, isDelayed: true, isFallback: true };
  }

  return generateSyntheticOHLCV(cleanSym, range);
}

// ── Resilient Fallback Generator ────────────────────────────
function generateSyntheticOHLCV(symbol, range) {
  const basePrices = {
    'RELIANCE': 1328.80,
    'TCS': 2266.00,
    'HDFCBANK': 820.80,
    'INFY': 1094.20,
    '^NSEI': 24398.15,
    '^BSESN': 80423.72,
    '^NSEBANK': 52841.60
  };

  const ltp = basePrices[symbol] || 1250.00;
  const count = range === '1d' ? 75 : range === '1w' ? 100 : range === '1m' ? 22 : range === '6m' ? 130 : 250;
  const nowSec = Math.floor(Date.now() / 1000);
  const stepSec = range === '1d' ? 300 : range === '1w' ? 900 : 86400;

  const dataPoints = [];
  let curr = ltp * (1 - (count * 0.0008));

  for (let i = 0; i < count; i++) {
    const t = nowSec - ((count - 1 - i) * stepSec);
    const fluctuation = (Math.sin(i / 5) * 0.008) + ((Math.random() - 0.48) * 0.012);
    curr = curr * (1 + fluctuation);
    const o = curr * (1 - 0.003 + (Math.random() * 0.006));
    const h = Math.max(o, curr) * (1 + Math.random() * 0.005);
    const l = Math.min(o, curr) * (1 - Math.random() * 0.005);
    const v = Math.round(150000 + Math.random() * 600000);

    const timeVal = (range === '1d' || range === '1w')
      ? t
      : new Date(t * 1000).toISOString().split('T')[0];

    dataPoints.push({
      time: timeVal,
      timestamp: t,
      open: parseFloat(o.toFixed(2)),
      high: parseFloat(h.toFixed(2)),
      low: parseFloat(l.toFixed(2)),
      close: parseFloat(curr.toFixed(2)),
      volume: v
    });
  }

  // Ensure last point hits target LTP
  dataPoints[dataPoints.length - 1].close = ltp;

  return {
    symbol,
    range,
    interval: range === '1d' ? '5m' : '1d',
    meta: {
      regularMarketPrice: ltp,
      previousClose: ltp * 0.992,
      fiftyTwoWeekHigh: ltp * 1.28,
      fiftyTwoWeekLow: ltp * 0.82,
      currency: 'INR',
      exchangeName: 'NSE'
    },
    dataPoints,
    isDelayed: true,
    isFallback: true
  };
}

// ── Technical Analysis Engine ───────────────────────────────
function calculateSMA(values, period) {
  if (values.length < period) return null;
  const result = [];
  for (let i = period - 1; i < values.length; i++) {
    const slice = values.slice(i - period + 1, i + 1);
    const sum = slice.reduce((a, b) => a + b, 0);
    result.push({ index: i, value: parseFloat((sum / period).toFixed(2)) });
  }
  return result;
}

function calculateRSI(closes, period = 14) {
  if (closes.length < period + 1) return 50.0;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - diff) / period;
    }
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return parseFloat((100 - (100 / (1 + rs))).toFixed(2));
}

function calculateEMA(values, period) {
  const k = 2 / (period + 1);
  const emaValues = [values[0]];
  for (let i = 1; i < values.length; i++) {
    emaValues.push(values[i] * k + emaValues[i - 1] * (1 - k));
  }
  return emaValues;
}

function calculateMACD(closes) {
  if (closes.length < 26) {
    return { macd: 0, signal: 0, histogram: 0, status: 'Neutral' };
  }
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macdLine = [];
  for (let i = 0; i < closes.length; i++) {
    macdLine.push(ema12[i] - ema26[i]);
  }
  const signalLine = calculateEMA(macdLine.slice(26), 9);
  const latestMACD = macdLine[macdLine.length - 1];
  const latestSignal = signalLine[signalLine.length - 1];
  const histogram = latestMACD - latestSignal;

  let status = 'Neutral';
  if (histogram > 0 && latestMACD > 0) status = 'Bullish Expansion';
  else if (histogram > 0) status = 'Bullish Crossover';
  else if (histogram < 0 && latestMACD < 0) status = 'Bearish Pressure';
  else if (histogram < 0) status = 'Bearish Crossover';

  return {
    macd: parseFloat(latestMACD.toFixed(2)),
    signal: parseFloat(latestSignal.toFixed(2)),
    histogram: parseFloat(histogram.toFixed(2)),
    status
  };
}

function calculateATR(dataPoints, period = 14) {
  if (dataPoints.length < 2) return 0;
  const trs = [];
  for (let i = 1; i < dataPoints.length; i++) {
    const curr = dataPoints[i];
    const prev = dataPoints[i - 1];
    const tr = Math.max(
      curr.high - curr.low,
      Math.abs(curr.high - prev.close),
      Math.abs(curr.low - prev.close)
    );
    trs.push(tr);
  }
  if (trs.length < period) {
    return trs.reduce((a, b) => a + b, 0) / trs.length;
  }
  let atr = trs.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < trs.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period;
  }
  return parseFloat(atr.toFixed(2));
}

function calculateBollingerBands(closes, period = 20, multiplier = 2) {
  if (closes.length < period) {
    const last = closes[closes.length - 1] || 0;
    return { middle: last, upper: last * 1.05, lower: last * 0.95 };
  }
  const slice = closes.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  return {
    middle: parseFloat(mean.toFixed(2)),
    upper: parseFloat((mean + stdDev * multiplier).toFixed(2)),
    lower: parseFloat((mean - stdDev * multiplier).toFixed(2))
  };
}

// ── AI Thesis & Reasoning Generator ────────────────────────
async function generateAIThesis(symbol, technicals, quote) {
  const cacheKey = symbol;
  const now = Date.now();
  const cached = memoryCache.aiTheses.get(cacheKey);
  if (cached && (now - cached.timestamp) < AI_CACHE_TTL_MS) {
    return cached.data;
  }

  const ltp = quote.ltp;
  const dma50 = technicals.dma50;
  const dma200 = technicals.dma200;
  const rsi = technicals.rsi;
  const macd = technicals.macd;
  const atr = technicals.atr;
  const trend1M = technicals.trend1M;
  const volumeTrend = technicals.volumeTrend;

  // Derive signal and confidence quantitatively
  let signal = 'HOLD';
  let confidenceScore = 65;

  if (ltp > dma50 && ltp > dma200 && rsi >= 45 && rsi <= 65 && macd.histogram > 0) {
    signal = 'BUY';
    confidenceScore = 84;
  } else if (ltp < dma50 && ltp < dma200 && (rsi > 70 || macd.histogram < -10)) {
    signal = 'SELL';
    confidenceScore = 78;
  } else if (ltp >= dma50 && ltp <= dma200) {
    signal = 'HOLD';
    confidenceScore = 82;
  } else {
    signal = 'HOLD';
    confidenceScore = 75;
  }

  const confidenceLevel = confidenceScore >= 80 ? 'HIGH' : confidenceScore >= 60 ? 'MED' : 'LOW';

  // Rule-based institutional reasoning generator (deterministic & fast)
  let reasoning = `${symbol} is currently trading at ₹${ltp.toLocaleString('en-IN')}, `;
  if (ltp >= dma50 && ltp < dma200) {
    reasoning += `rebounding above its 50-day moving average (₹${dma50}) while testing resistance below the 200 DMA (₹${dma200}). `;
  } else if (ltp >= dma200) {
    reasoning += `displaying robust structural momentum well above both 50 DMA (₹${dma50}) and 200 DMA (₹${dma200}). `;
  } else {
    reasoning += `consolidating in a defined pullback band under the 50 DMA (₹${dma50}) and 200 DMA (₹${dma200}). `;
  }

  reasoning += `Momentum oscillator RSI(14) stands at ${rsi}, indicating ${rsi > 60 ? 'favorable buyer dominance without overbought exhaustion' : rsi < 40 ? 'oversold stabilization with emerging accumulation' : 'a balanced supply-demand equilibrium'}. `;
  reasoning += `MACD confirms ${macd.status.toLowerCase()} with histogram reading ${macd.histogram > 0 ? '+' : ''}${macd.histogram}. `;
  reasoning += `Volume activity is tracking ${volumeTrend.label.toLowerCase()} (${volumeTrend.ratioText}), supporting ${signal === 'HOLD' ? 'disciplined position holding and systematic dollar-cost averaging in the defined entry corridor' : signal === 'BUY' ? 'gradual long accumulation on shallow dips' : 'strategic profit trimming near upper resistance bounds'}.`;

  const tags = [];
  if (ltp < dma200) tags.push(`Trading below 200 DMA (₹${dma200})`);
  else tags.push(`Trading above 200 DMA (₹${dma200})`);

  if (ltp >= dma50) tags.push(`Holding above 50 DMA (₹${dma50})`);
  else tags.push(`Under 50 DMA (₹${dma50})`);

  tags.push(`RSI(14) ${rsi > 60 ? 'Bullish' : rsi < 40 ? 'Oversold' : 'Neutral'} at ${rsi}`);
  tags.push(`MACD: ${macd.status}`);
  tags.push(`Vol: ${volumeTrend.ratioText}`);

  // Optional Anthropic / Gemini refinement if API keys exist
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (geminiKey && !geminiKey.includes('dummy')) {
    try {
      const prompt = `As SaarthiX AI equity analyst, write a single concise institutional paragraph (max 70 words) analyzing ${symbol} based on these EXACT computed metrics: Price=₹${ltp}, 50DMA=₹${dma50}, 200DMA=₹${dma200}, RSI=${rsi}, MACD Histogram=${macd.histogram} (${macd.status}), 1M Trend=${trend1M.pct}%, Vol Trend=${volumeTrend.ratioText}. Do not make up numbers. Objective institutional tone.`;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }, 4000);
      if (res.ok) {
        const json = await res.json();
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 20) {
          reasoning = text.trim();
        }
      }
    } catch (e) {
      // Keep heuristic reasoning
    }
  }

  const result = {
    signal,
    confidenceLevel,
    confidenceScore,
    reasoning,
    tags
  };

  memoryCache.aiTheses.set(cacheKey, { data: result, timestamp: now });
  return result;
}

// ── GET /api/portfolio/indices ──────────────────────────────
async function handleIndices(req, res) {
  try {
    const now = Date.now();
    if (memoryCache.indices.data && (now - memoryCache.indices.timestamp) < INDEX_CACHE_TTL_MS) {
      return res.json({ status: 'SUCCESS', ...memoryCache.indices.data, cached: true });
    }

    const indexConfigs = [
      { key: 'nifty50', symbol: '^NSEI', name: 'NIFTY 50', fallbackPrice: 24398.15, fallbackChange: 89.30, fallbackPct: 0.37 },
      { key: 'sensex', symbol: '^BSESN', name: 'SENSEX', fallbackPrice: 80423.72, fallbackChange: 512.40, fallbackPct: 0.64 },
      { key: 'niftyBank', symbol: '^NSEBANK', name: 'NIFTY BANK', fallbackPrice: 52841.60, fallbackChange: 372.10, fallbackPct: 0.70 }
    ];

    const results = {};

    await Promise.all(indexConfigs.map(async (cfg) => {
      try {
        const chart = await fetchYahooOHLCV(cfg.symbol, '1d');
        const points = chart.dataPoints || [];
        const ltp = chart.meta.regularMarketPrice || (points.length > 0 ? points[points.length - 1].close : cfg.fallbackPrice);
        const prevClose = chart.meta.previousClose || (points.length > 0 ? points[0].open : cfg.fallbackPrice * 0.994);
        const change = parseFloat((ltp - prevClose).toFixed(2));
        const changePct = parseFloat(((change / prevClose) * 100).toFixed(2));

        // Sample 12 sparkline points
        const sparkline = points.length > 12 
          ? points.filter((_, idx) => idx % Math.floor(points.length / 12) === 0).map(p => p.close).slice(-12)
          : points.map(p => p.close);

        results[cfg.key] = {
          name: cfg.name,
          symbol: cfg.symbol,
          value: ltp,
          change,
          changePct,
          sparkline: sparkline.length > 0 ? sparkline : [cfg.fallbackPrice * 0.998, cfg.fallbackPrice, ltp],
          isPositive: change >= 0
        };
      } catch (err) {
        results[cfg.key] = {
          name: cfg.name,
          symbol: cfg.symbol,
          value: cfg.fallbackPrice,
          change: cfg.fallbackChange,
          changePct: cfg.fallbackPct,
          sparkline: [cfg.fallbackPrice * 0.995, cfg.fallbackPrice * 0.998, cfg.fallbackPrice],
          isPositive: cfg.fallbackChange >= 0
        };
      }
    }));

    const responseData = {
      isMarketOpen: isNseMarketOpen(),
      istTime: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      indices: results
    };

    memoryCache.indices = { data: responseData, timestamp: now };
    return res.json({ status: 'SUCCESS', ...responseData });
  } catch (error) {
    console.error('Portfolio Indices Error:', error);
    res.status(500).json({ status: 'FAILURE', error: error.message });
  }
}

// ── GET /api/portfolio/summary ──────────────────────────────
async function handleSummary(req, res) {
  try {
    const holdings = DEFAULT_HOLDINGS;
    let totalPortfolioValue = 0;
    let totalInvested = 0;
    let totalTodayPnl = 0;

    const resolvedHoldings = await Promise.all(holdings.map(async (h) => {
      const chart1Y = await fetchYahooOHLCV(h.ticker, '1y');
      const points = chart1Y.dataPoints || [];
      const ltp = chart1Y.meta.regularMarketPrice || (points.length > 0 ? points[points.length - 1].close : h.avgBuyPrice);
      const prevClose = chart1Y.meta.previousClose || ltp;
      const dayChange = parseFloat((ltp - prevClose).toFixed(2));
      const dayChangePct = parseFloat(((dayChange / prevClose) * 100).toFixed(2));

      const currentValue = parseFloat((ltp * h.quantity).toFixed(2));
      const investedValue = parseFloat((h.avgBuyPrice * h.quantity).toFixed(2));
      const totalPnl = parseFloat((currentValue - investedValue).toFixed(2));
      const totalPnlPct = parseFloat(((totalPnl / investedValue) * 100).toFixed(2));
      const todayPnl = parseFloat((dayChange * h.quantity).toFixed(2));

      totalPortfolioValue += currentValue;
      totalInvested += investedValue;
      totalTodayPnl += todayPnl;

      // Quick holding signal
      const closes = points.map(p => p.close);
      const dma50 = closes.length >= 50 ? closes.slice(-50).reduce((a, b) => a + b, 0) / 50 : ltp;
      const dma200 = closes.length >= 200 ? closes.slice(-200).reduce((a, b) => a + b, 0) / 200 : ltp;
      let signal = 'HOLD';
      if (ltp > dma50 && ltp > dma200) signal = 'BUY';
      else if (ltp < dma50 && ltp < dma200) signal = 'SELL';

      return {
        ticker: h.ticker,
        name: h.name,
        exchange: h.exchange,
        sector: h.sector,
        quantity: h.quantity,
        avgBuyPrice: h.avgBuyPrice,
        ltp,
        dayChange,
        dayChangePct,
        currentValue,
        investedValue,
        totalPnl,
        totalPnlPct,
        todayPnl,
        signal
      };
    }));

    const cashBalance = DEFAULT_CASH_BALANCE;
    const totalAssets = totalPortfolioValue + cashBalance;
    const totalUnrealizedPnl = totalPortfolioValue - totalInvested;
    const totalUnrealizedPnlPct = totalInvested > 0 ? (totalUnrealizedPnl / totalInvested) * 100 : 0;
    const totalDayGainPct = totalPortfolioValue > 0 ? (totalTodayPnl / (totalPortfolioValue - totalTodayPnl)) * 100 : 0;

    res.json({
      status: 'SUCCESS',
      summary: {
        totalPortfolioValue: parseFloat(totalPortfolioValue.toFixed(2)),
        totalAssets: parseFloat(totalAssets.toFixed(2)),
        todayPnl: parseFloat(totalTodayPnl.toFixed(2)),
        unrealizedPnl: parseFloat(totalUnrealizedPnl.toFixed(2)),
        unrealizedPnlPct: parseFloat(totalUnrealizedPnlPct.toFixed(2)),
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        cashBalance: parseFloat(cashBalance.toFixed(2)),
        dayGainPct: parseFloat(totalDayGainPct.toFixed(2)),
        isMarketOpen: isNseMarketOpen(),
        holdingsCount: resolvedHoldings.length,
        lastUpdated: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      },
      holdings: resolvedHoldings
    });
  } catch (error) {
    console.error('Portfolio Summary Error:', error);
    res.status(500).json({ status: 'FAILURE', error: error.message });
  }
}

// ── GET /api/portfolio/analysis ─────────────────────────────
async function handleAnalysis(req, res) {
  try {
    const symbol = (req.query.symbol || 'RELIANCE').toUpperCase().trim();
    const timeframe = (req.query.range || '1y').toLowerCase().trim();

    const cacheKey = `${symbol}:${timeframe}`;
    const now = Date.now();
    const cached = memoryCache.analysis.get(cacheKey);
    if (cached && (now - cached.timestamp) < ANALYSIS_CACHE_TTL_MS) {
      return res.json({ status: 'SUCCESS', ...cached.data, cached: true });
    }

    // 1. Fetch 1Y daily data for robust 50 & 200 DMA calculation
    const chart1Y = await fetchYahooOHLCV(symbol, '1y');
    const full1YPoints = chart1Y.dataPoints || [];
    const full1YCloses = full1YPoints.map(p => p.close);

    // 2. Fetch requested timeframe data for chart display
    const chartTimeframe = timeframe === '1y' ? chart1Y : await fetchYahooOHLCV(symbol, timeframe);
    const displayPoints = chartTimeframe.dataPoints || [];

    const ltp = chartTimeframe.meta.regularMarketPrice || (displayPoints.length > 0 ? displayPoints[displayPoints.length - 1].close : 1328.80);
    const prevClose = chartTimeframe.meta.previousClose || (displayPoints.length > 0 ? displayPoints[0].open : ltp);
    const change = parseFloat((ltp - prevClose).toFixed(2));
    const changePct = parseFloat(((change / prevClose) * 100).toFixed(2));

    // 3. Compute Technicals using 1Y baseline
    const dma50Val = full1YCloses.length >= 50
      ? parseFloat((full1YCloses.slice(-50).reduce((a, b) => a + b, 0) / 50).toFixed(2))
      : ltp;

    const dma200Val = full1YCloses.length >= 200
      ? parseFloat((full1YCloses.slice(-200).reduce((a, b) => a + b, 0) / 200).toFixed(2))
      : ltp;

    const rsiVal = calculateRSI(full1YCloses, 14);
    const macdVal = calculateMACD(full1YCloses);
    const atrVal = calculateATR(full1YPoints, 14);
    const bbVal = calculateBollingerBands(full1YCloses, 20, 2);

    // 1M trend (% return over last ~22 trading days)
    const last1MPoints = full1YPoints.slice(-22);
    const close1MAgo = last1MPoints.length > 0 ? last1MPoints[0].close : ltp;
    const trend1MPct = parseFloat((((ltp - close1MAgo) / close1MAgo) * 100).toFixed(2));
    const trend1MSparkline = last1MPoints.map(p => p.close);

    // Volume trend (last 5D avg vs last 30D avg)
    const last5D = full1YPoints.slice(-5);
    const last30D = full1YPoints.slice(-30);
    const avgVol5D = last5D.length > 0 ? last5D.reduce((a, b) => a + b.volume, 0) / last5D.length : 1000000;
    const avgVol30D = last30D.length > 0 ? last30D.reduce((a, b) => a + b.volume, 0) / last30D.length : 1000000;
    const volRatio = avgVol30D > 0 ? ((avgVol5D - avgVol30D) / avgVol30D) * 100 : 0;
    const volumeSparkline = last30D.filter((_, i) => i % 3 === 0).map(p => p.volume);

    // Align DMA series for chart overlay
    // For 1Y daily chart, calculate rolling 50 & 200 DMA for every bar
    const sma50Series = [];
    const sma200Series = [];

    if (timeframe === '1y' || timeframe === '6m') {
      for (let i = 0; i < displayPoints.length; i++) {
        // Find corresponding point in 1Y
        const targetTime = displayPoints[i].time;
        const idx1Y = full1YPoints.findIndex(p => p.time === targetTime);
        if (idx1Y >= 49) {
          const slice50 = full1YCloses.slice(idx1Y - 49, idx1Y + 1);
          const v50 = slice50.reduce((a, b) => a + b, 0) / 50;
          sma50Series.push({ time: targetTime, value: parseFloat(v50.toFixed(2)) });
        }
        if (idx1Y >= 199) {
          const slice200 = full1YCloses.slice(idx1Y - 199, idx1Y + 1);
          const v200 = slice200.reduce((a, b) => a + b, 0) / 200;
          sma200Series.push({ time: targetTime, value: parseFloat(v200.toFixed(2)) });
        }
      }
    } else {
      // For intraday/1W/1M, provide horizontal reference lines at current DMA levels
      if (displayPoints.length > 0) {
        sma50Series.push({ time: displayPoints[0].time, value: dma50Val });
        sma50Series.push({ time: displayPoints[displayPoints.length - 1].time, value: dma50Val });
        sma200Series.push({ time: displayPoints[0].time, value: dma200Val });
        sma200Series.push({ time: displayPoints[displayPoints.length - 1].time, value: dma200Val });
      }
    }

    // 4. Compute 3 Technical Level Cards
    // Buy More (DCA Zones)
    const recent20Days = full1YPoints.slice(-20);
    const swingLow20 = recent20Days.length > 0 ? Math.min(...recent20Days.map(p => p.low)) : ltp * 0.95;
    const atrPullback = parseFloat((ltp - (1.5 * atrVal)).toFixed(2));
    const buyDcaZone1 = dma50Val;
    const buyDcaZone2 = Math.min(atrPullback, swingLow20);
    const buyDcaZone3 = swingLow20;

    // Hold Range & Stop Loss
    const holdRangeLow = Math.min(dma50Val, dma200Val);
    const holdRangeHigh = Math.max(dma50Val, dma200Val);
    const structuralSupport = Math.min(dma50Val, swingLow20);
    const stopLossVal = parseFloat(Math.min(ltp - (2.0 * atrVal), structuralSupport * 0.97).toFixed(2));

    // Sell / Take-Profit
    const high52 = chart1Y.meta.fiftyTwoWeekHigh || Math.max(...full1YPoints.map(p => p.high));
    const upperBB = bbVal.upper;
    const sellTarget1 = parseFloat(Math.max(upperBB, ltp * 1.05).toFixed(2));
    const sellTarget2 = parseFloat(Math.max(high52, ltp * 1.12).toFixed(2));

    // 5. Build Technicals Object
    const technicals = {
      dma50: dma50Val,
      dma50Status: ltp >= dma50Val ? 'Above' : 'Below',
      dma50Sparkline: full1YCloses.slice(-15),
      dma200: dma200Val,
      dma200Status: ltp >= dma200Val ? 'Above' : 'Below',
      dma200Sparkline: full1YCloses.slice(-25).filter((_, i) => i % 2 === 0),
      rsi: rsiVal,
      rsiStatus: rsiVal > 60 ? 'Bullish' : rsiVal < 40 ? 'Oversold' : 'Neutral',
      rsiSparkline: full1YCloses.slice(-14),
      trend1M: {
        pct: trend1MPct,
        status: trend1MPct >= 0 ? 'Bullish' : 'Bearish',
        sparkline: trend1MSparkline
      },
      volumeTrend: {
        ratioPct: parseFloat(volRatio.toFixed(1)),
        ratioText: `${volRatio >= 0 ? '+' : ''}${volRatio.toFixed(1)}% vs 30D avg`,
        label: volRatio > 15 ? 'High Volume' : volRatio < -15 ? 'Low Volume' : 'Normal',
        sparkline: volumeSparkline
      },
      macd: macdVal,
      atr: atrVal,
      bollingerBands: bbVal,
      levels: {
        buyDCA: {
          title: 'Buy More (DCA Zones)',
          accent: 'green',
          badge: 'Accumulation',
          items: [
            { label: '50 DMA Support', value: `₹${dma50Val.toLocaleString('en-IN')}` },
            { label: 'ATR Pullback (-1.5x)', value: `₹${atrPullback.toLocaleString('en-IN')}` },
            { label: '20-Day Swing Low', value: `₹${swingLow20.toLocaleString('en-IN')}` }
          ]
        },
        holdStop: {
          title: 'Hold Range & Stop Loss',
          accent: 'yellow',
          badge: 'Protection',
          items: [
            { label: 'Core Hold Band', value: `₹${holdRangeLow.toLocaleString('en-IN')} – ₹${holdRangeHigh.toLocaleString('en-IN')}` },
            { label: 'Structural Baseline', value: `₹${structuralSupport.toLocaleString('en-IN')}` },
            { label: 'Strict Stop Loss (-2x ATR)', value: `₹${stopLossVal.toLocaleString('en-IN')}` }
          ]
        },
        sellTarget: {
          title: 'Sell / Take-Profit',
          accent: 'red',
          badge: 'Distribution',
          items: [
            { label: 'Upper Bollinger Band', value: `₹${sellTarget1.toLocaleString('en-IN')}` },
            { label: '52-Week High Resistance', value: `₹${sellTarget2.toLocaleString('en-IN')}` },
            { label: 'Trailing Target (12M)', value: `₹${(sellTarget2 * 1.06).toFixed(2).toLocaleString('en-IN')}` }
          ]
        }
      }
    };

    // 6. Generate AI Thesis
    const aiThesis = await generateAIThesis(symbol, technicals, { ltp, change, changePct });

    const responseData = {
      symbol,
      timeframe,
      quote: {
        ltp,
        change,
        changePct,
        isPositive: change >= 0,
        high52,
        low52: chart1Y.meta.fiftyTwoWeekLow || Math.min(...full1YPoints.map(p => p.low)),
        currency: 'INR',
        exchange: 'NSE',
        isDelayed: chartTimeframe.isDelayed
      },
      chart: {
        candlesticks: displayPoints,
        sma50: sma50Series,
        sma200: sma200Series
      },
      technicals,
      aiAnalysis: aiThesis,
      timestamp: new Date().toISOString()
    };

    memoryCache.analysis.set(cacheKey, { data: responseData, timestamp: now });
    res.json({ status: 'SUCCESS', ...responseData });
  } catch (error) {
    console.error('Portfolio Analysis Error:', error);
    res.status(500).json({ status: 'FAILURE', error: error.message });
  }
}

module.exports = {
  handleIndices,
  handleSummary,
  handleAnalysis
};
