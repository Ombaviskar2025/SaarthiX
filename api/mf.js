// ============================================================
//  api/mf.js — Indian Mutual Funds Search & Real NAV Proxy (AMFI / mfapi.in)
// ============================================================
'use strict';

const MF_CACHE = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache

async function searchSchemes(query) {
  if (!query || query.length < 2) return [];
  const url = `https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];

  return data.slice(0, 15).map(item => ({
    schemeCode: item.schemeCode,
    schemeName: item.schemeName
  }));
}

async function getSchemeNav(code) {
  const cacheKey = `nav_${code}`;
  const now = Date.now();
  const cached = MF_CACHE.get(cacheKey);
  if (cached && (now - cached.cachedAt) < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = `https://api.mfapi.in/mf/${encodeURIComponent(code)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} from mfapi`);
  const json = await res.json();

  const meta = json.meta || {};
  const data = json.data || [];
  if (data.length === 0) throw new Error('No historical NAV data found');

  const latest = data[0];
  const currentNav = parseFloat(latest.nav);
  const latestDate = latest.date;

  // Helper to find NAV roughly N years ago
  function getReturn(years) {
    if (data.length < 2) return null;
    const targetDays = years * 365;
    const nowTs = new Date().getTime();

    let pastNav = null;
    let pastDaysDiff = 0;
    for (let i = 1; i < data.length; i++) {
      const parts = data[i].date.split('-');
      if (parts.length === 3) {
        const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        const diffDays = (nowTs - d.getTime()) / (1000 * 3600 * 24);
        if (diffDays >= targetDays) {
          pastNav = parseFloat(data[i].nav);
          pastDaysDiff = diffDays;
          break;
        }
      }
    }

    if (!pastNav || pastNav <= 0) return null;
    const actualYears = pastDaysDiff / 365.25;
    const cagr = (Math.pow(currentNav / pastNav, 1 / actualYears) - 1) * 100;
    return parseFloat(cagr.toFixed(2));
  }

  const ret1y = getReturn(1);
  const ret3y = getReturn(3);
  const ret5y = getReturn(5);

  const result = {
    schemeCode: meta.scheme_code || code,
    schemeName: meta.scheme_name || 'Mutual Fund',
    fundHouse: meta.fund_house || 'Asset Management Co.',
    category: meta.scheme_category || 'Equity',
    currentNav,
    navDate: latestDate,
    returns: {
      cagr1Y: ret1y,
      cagr3Y: ret3y,
      cagr5Y: ret5y
    },
    historyPreview: data.slice(0, 30).map(d => ({ date: d.date, nav: parseFloat(d.nav) }))
  };

  MF_CACHE.set(cacheKey, { data: result, cachedAt: now });
  return result;
}

async function mfHandler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action || (req.path.includes('/search') ? 'search' : 'nav');
  const query = req.query.q || req.query.query;
  const code = req.query.code || req.query.schemeCode;

  try {
    if (action === 'search' || (query && !code)) {
      if (!query) {
        return res.status(400).json({ status: 'ERROR', error: 'Missing search query (?q=Parag)' });
      }
      const schemes = await searchSchemes(query);
      return res.status(200).json({ status: 'SUCCESS', count: schemes.length, schemes });
    }

    if (!code) {
      return res.status(400).json({ status: 'ERROR', error: 'Missing fund scheme code (?code=122639)' });
    }

    const navData = await getSchemeNav(code);
    return res.status(200).json({ status: 'SUCCESS', data: navData });

  } catch (err) {
    console.error('[MF API Error]:', err);
    return res.status(500).json({ status: 'ERROR', error: err.message || 'Failed to fetch mutual fund data' });
  }
}

mfHandler.search = mfHandler;
mfHandler.nav = mfHandler;

module.exports = mfHandler;
