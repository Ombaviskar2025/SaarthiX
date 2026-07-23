// ============================================================
//  lib/amfiNavService.js — AMFI Live Scheme Master & NAV Service
// ============================================================

const AMFI_MASTER_URL = 'https://www.amfiindia.com/spmiddleware/api/MFDataUploadDwl';

// Embedded master fallback database of popular Indian mutual fund schemes
const POPULAR_SCHEMES_DB = [
  { schemeCode: '119551', schemeName: 'Parag Parikh Flexi Cap Fund Direct-Growth', amc: 'PPFAS', category: 'Flexi Cap', nav: 76.20 },
  { schemeCode: '119598', schemeName: 'SBI Small Cap Fund Direct-Growth', amc: 'SBI MF', category: 'Small Cap', nav: 168.90 },
  { schemeCode: '119799', schemeName: 'HDFC Mid-Cap Opportunities Fund Direct-Growth', amc: 'HDFC MF', category: 'Mid Cap', nav: 142.30 },
  { schemeCode: '120716', schemeName: 'UTI Nifty 50 Index Fund Direct-Growth', amc: 'UTI MF', category: 'Index', nav: 154.60 },
  { schemeCode: '120503', schemeName: 'ICICI Prudential Bluechip Fund Direct-Growth', amc: 'ICICI Prudential', category: 'Large Cap', nav: 112.40 },
  { schemeCode: '118834', schemeName: 'Mirae Asset Large Cap Fund Direct-Growth', amc: 'Mirae Asset', category: 'Large Cap', nav: 104.80 },
  { schemeCode: '125354', schemeName: 'Nippon India Small Cap Fund Direct-Growth', amc: 'Nippon India', category: 'Small Cap', nav: 182.50 },
  { schemeCode: '120377', schemeName: 'Axis Bluechip Fund Direct-Growth', amc: 'Axis MF', category: 'Large Cap', nav: 62.10 },
  { schemeCode: '141014', schemeName: 'Quant Active Fund Direct-Growth', amc: 'Quant MF', category: 'Flexi Cap', nav: 685.20 },
  { schemeCode: '120492', schemeName: 'ICICI Prudential Corporate Bond Fund Direct-Growth', amc: 'ICICI Prudential', category: 'Debt', nav: 28.40 },
  { schemeCode: '119800', schemeName: 'HDFC Short Term Debt Fund Direct-Growth', amc: 'HDFC MF', category: 'Debt', nav: 31.20 },
  { schemeCode: '120465', schemeName: 'ICICI Prudential Equity & Debt Fund Direct-Growth', amc: 'ICICI Prudential', category: 'Hybrid', nav: 340.50 },
  { schemeCode: '119552', schemeName: 'Mirae Asset ELSS Tax Saver Fund Direct-Growth', amc: 'Mirae Asset', category: 'ELSS', nav: 45.80 },
  { schemeCode: '119600', schemeName: 'SBI Long Term Equity Fund Direct-Growth (ELSS)', amc: 'SBI MF', category: 'ELSS', nav: 385.40 },
  { schemeCode: '120594', schemeName: 'Kotak Emerging Equity Fund Direct-Growth', amc: 'Kotak MF', category: 'Mid Cap', nav: 125.60 },
  { schemeCode: '135781', schemeName: 'Navi Nifty 50 Index Fund Direct-Growth', amc: 'Navi MF', category: 'Index', nav: 14.80 },
  { schemeCode: '119560', schemeName: 'Nippon India Gold Savings Fund Direct-Growth', amc: 'Nippon India', category: 'Gold', nav: 26.50 }
];

let cachedSchemeMaster = null;
let lastFetchTime = 0;

/**
 * Search AMFI Schemes with debounced autocomplete
 */
async function searchAmfiSchemes(query) {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim().toLowerCase();

  // Try to load cached master or popular DB
  const master = await getOrFetchAmfiMaster();

  return master.filter(s =>
    s.schemeName.toLowerCase().includes(q) ||
    s.amc.toLowerCase().includes(q) ||
    s.category.toLowerCase().includes(q)
  ).slice(0, 10);
}

/**
 * Get or fetch scheme master list (cached 24h)
 */
async function getOrFetchAmfiMaster() {
  const now = Date.now();
  if (cachedSchemeMaster && (now - lastFetchTime < 24 * 60 * 60 * 1000)) {
    return cachedSchemeMaster;
  }

  // Try local session storage in browser
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const localData = sessionStorage.getItem('saarthix_amfi_master');
    const localTime = sessionStorage.getItem('saarthix_amfi_time');
    if (localData && localTime && (now - parseInt(localTime) < 24 * 60 * 60 * 1000)) {
      try {
        cachedSchemeMaster = JSON.parse(localData);
        lastFetchTime = parseInt(localTime);
        return cachedSchemeMaster;
      } catch (e) {}
    }
  }

  // Fetch from AMFI API or use popular fallback
  try {
    if (typeof fetch !== 'undefined') {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(AMFI_MASTER_URL, { signal: controller.signal });
      clearTimeout(id);

      if (res.ok) {
        const text = await res.text();
        const parsed = parseAmfiTxtFeed(text);
        if (parsed && parsed.length > 50) {
          cachedSchemeMaster = parsed;
          lastFetchTime = now;
          if (typeof window !== 'undefined' && window.sessionStorage) {
            sessionStorage.setItem('saarthix_amfi_master', JSON.stringify(parsed));
            sessionStorage.setItem('saarthix_amfi_time', now.toString());
          }
          return cachedSchemeMaster;
        }
      }
    }
  } catch (err) {
    console.warn('[AMFIService] Live feed unavailable, using cached fallback master:', err.message);
  }

  cachedSchemeMaster = POPULAR_SCHEMES_DB;
  lastFetchTime = now;
  return cachedSchemeMaster;
}

/**
 * Parse AMFI text format semicolon separated feed
 */
function parseAmfiTxtFeed(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const schemes = [];

  let currentCategory = 'Flexi Cap';

  lines.forEach(line => {
    const parts = line.split(';');
    if (parts.length < 2 && line.trim().length > 0) {
      if (line.includes('Equity')) currentCategory = 'Flexi Cap';
      else if (line.includes('Debt')) currentCategory = 'Debt';
      else if (line.includes('Hybrid')) currentCategory = 'Hybrid';
      else if (line.includes('Index')) currentCategory = 'Index';
    } else if (parts.length >= 5) {
      const schemeCode = parts[0].trim();
      const isin = parts[1].trim();
      const schemeName = parts[3].trim();
      const nav = parseFloat(parts[4]);

      if (schemeName && !isNaN(nav)) {
        let amc = 'AMC';
        if (schemeName.includes('Parag Parikh')) amc = 'PPFAS';
        else if (schemeName.includes('SBI')) amc = 'SBI MF';
        else if (schemeName.includes('HDFC')) amc = 'HDFC MF';
        else if (schemeName.includes('ICICI')) amc = 'ICICI Prudential';
        else if (schemeName.includes('UTI')) amc = 'UTI MF';
        else if (schemeName.includes('Nippon')) amc = 'Nippon India';
        else if (schemeName.includes('Axis')) amc = 'Axis MF';
        else if (schemeName.includes('Kotak')) amc = 'Kotak MF';
        else if (schemeName.includes('Mirae')) amc = 'Mirae Asset';

        schemes.push({
          schemeCode,
          isin,
          schemeName,
          amc,
          category: currentCategory,
          nav
        });
      }
    }
  });

  return schemes;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    searchAmfiSchemes,
    getOrFetchAmfiMaster,
    POPULAR_SCHEMES_DB
  };
}

if (typeof window !== 'undefined') {
  window.AmfiNavService = {
    searchAmfiSchemes,
    getOrFetchAmfiMaster,
    POPULAR_SCHEMES_DB
  };
}
