// ============================================================
//  lib/nseClient.js  —  Server-side NSE Data & Caching Manager
// ============================================================
const https = require('https');

// In-memory cache store
const cacheStore = {
  breadth: { data: null, timestamp: 0 },
  gainers: { data: null, timestamp: 0 },
  losers: { data: null, timestamp: 0 },
  sectors: { data: null, timestamp: 0 },
  news: { data: null, timestamp: 0 }
};

const PRICE_CACHE_TTL = 15 * 1000; // 15 seconds
const NEWS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Checks NSE Market status based on Asia/Kolkata (IST)
 */
function getMarketStatus() {
  const now = new Date();
  const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const istDate = new Date(istString);

  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  const dayOfWeek = istDate.getDay(); // 0 = Sun, 6 = Sat
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const HOLIDAYS_2026 = [
    "2026-01-26", "2026-02-15", "2026-03-03", "2026-03-20",
    "2026-04-03", "2026-04-14", "2026-05-01", "2026-07-06",
    "2026-08-15", "2026-09-14", "2026-10-02", "2026-10-20",
    "2026-11-09", "2026-11-24", "2026-12-25"
  ];

  const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
  const isHoliday = HOLIDAYS_2026.includes(dateStr);
  const isMarketHours = totalMinutes >= (9 * 60 + 15) && totalMinutes <= (15 * 60 + 30);
  const isOpen = !isWeekend && !isHoliday && isMarketHours;

  let reason = "Trading Hours (09:15 - 15:30 IST)";
  if (isWeekend) reason = "Weekend";
  else if (isHoliday) reason = "Market Holiday";
  else if (!isMarketHours) reason = totalMinutes < (9 * 60 + 15) ? "Pre-market" : "After hours";

  return {
    isOpen,
    statusText: isOpen ? "OPEN" : "Closed",
    reason,
    istTime: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  };
}

/**
 * Normalizes stock data list for breadth, gainers, losers, sectors
 */
function getNormalizedStocksList(starterStocks) {
  if (!starterStocks || !Array.isArray(starterStocks)) return [];
  return starterStocks.map(s => ({
    ticker: s.ticker || s.symbol,
    name: s.companyName || s.name || s.ticker,
    exchange: s.exchange || 'NSE',
    sector: s.sector || 'Other',
    price: parseFloat((s.price || 0).toFixed(2)),
    change: parseFloat((s.change || 0).toFixed(2)),
    changePct: parseFloat((s.changePct || s.pChange || 0).toFixed(2)),
    volume: s.volume || 0,
    high: s.high || s.price,
    low: s.low || s.price
  }));
}

/**
 * Calculates Market Breadth from stock array
 */
function computeBreadth(stocks) {
  const norm = getNormalizedStocksList(stocks);
  const advances = norm.filter(s => s.changePct > 0).length;
  const declines = norm.filter(s => s.changePct < 0).length;
  const unchanged = norm.length - advances - declines;
  const total = norm.length || 1;

  return {
    advances,
    declines,
    unchanged,
    total,
    advPct: parseFloat(((advances / total) * 100).toFixed(1)),
    decPct: parseFloat(((declines / total) * 100).toFixed(1)),
    unchPct: parseFloat(((unchanged / total) * 100).toFixed(1))
  };
}

/**
 * Gets Top Gainers
 */
function computeGainers(stocks, limit = 10) {
  const norm = getNormalizedStocksList(stocks);
  norm.sort((a, b) => b.changePct - a.changePct);
  return norm.slice(0, limit);
}

/**
 * Gets Top Losers
 */
function computeLosers(stocks, limit = 10) {
  const norm = getNormalizedStocksList(stocks);
  norm.sort((a, b) => a.changePct - b.changePct);
  return norm.slice(0, limit);
}

/**
 * Computes Sector Heatmap averages
 */
function computeSectorHeatmap(stocks) {
  const norm = getNormalizedStocksList(stocks);
  const map = {};

  norm.forEach(s => {
    const sec = s.sector || 'Other';
    if (!map[sec]) map[sec] = { sector: sec, totalChg: 0, count: 0 };
    map[sec].totalChg += s.changePct;
    map[sec].count++;
  });

  return Object.values(map).map(m => {
    const avgChangePct = parseFloat((m.totalChg / m.count).toFixed(2));
    let momentum = 'Flat';
    if (avgChangePct >= 1.5) momentum = 'Strong Up';
    else if (avgChangePct >= 0.5) momentum = 'Up';
    else if (avgChangePct <= -1.5) momentum = 'Strong Down';
    else if (avgChangePct <= -0.5) momentum = 'Down';

    return {
      sector: m.sector,
      avgChangePct,
      count: m.count,
      momentum
    };
  }).sort((a, b) => b.avgChangePct - a.avgChangePct);
}

/**
 * Fallback static market news feed
 */
function getFallbackNews() {
  return [
    { headline: "Nifty 50 trades in green led by Banking & IT stocks", source: "Economic Times", url: "#", publishedAt: "10m ago", category: "Markets", sentiment: "Bullish", relatedTicker: "NIFTY" },
    { headline: "Reliance Industries expands clean energy investments", source: "Livemint", url: "#", publishedAt: "25m ago", category: "Energy", sentiment: "Bullish", relatedTicker: "RELIANCE" },
    { headline: "TCS announces strategic AI partnership for enterprise automation", source: "Business Standard", url: "#", publishedAt: "45m ago", category: "IT", sentiment: "Bullish", relatedTicker: "TCS" },
    { headline: "HDFC Bank quarterly deposit growth surges 16% YoY", source: "Financial Express", url: "#", publishedAt: "1h ago", category: "Banking", sentiment: "Bullish", relatedTicker: "HDFCBANK" },
    { headline: "RBI MPC signals steady stance on policy repo rate", source: "CNBC TV18", url: "#", publishedAt: "2h ago", category: "Economy", sentiment: "Neutral", relatedTicker: null },
    { headline: "Tata Motors reports strong EV sales volume growth", source: "Economic Times", url: "#", publishedAt: "3h ago", category: "Auto", sentiment: "Bullish", relatedTicker: "TATAMOTORS" },
    { headline: "FII equity inflows hit multi-month high in Indian markets", source: "Moneycontrol", url: "#", publishedAt: "4h ago", category: "Markets", sentiment: "Bullish", relatedTicker: "SENSEX" },
    { headline: "L&T wins major infrastructure order valued over ₹2,500 Cr", source: "Hindu BusinessLine", url: "#", publishedAt: "5h ago", category: "Infrastructure", sentiment: "Bullish", relatedTicker: "LT" }
  ];
}

module.exports = {
  cacheStore,
  PRICE_CACHE_TTL,
  NEWS_CACHE_TTL,
  getMarketStatus,
  getNormalizedStocksList,
  computeBreadth,
  computeGainers,
  computeLosers,
  computeSectorHeatmap,
  getFallbackNews
};
