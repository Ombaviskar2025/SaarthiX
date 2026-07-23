// ============================================================
//  lib/fundManagerData.js — Fund Manager Information & Signals
// ============================================================

const FUND_MANAGERS_DB = {
  'Parag Parikh Flexi Cap Fund Direct-Growth': {
    name: 'Rajeev Thakkar',
    tenureFundYears: 11,
    tenureIndustryYears: 24,
    managedSince: '2013',
    otherFunds: ['PPFAS Tax Saver Fund', 'PPFAS Liquid Fund'],
    signal: 'High Trust · Longest tenured flexi-cap manager in India'
  },
  'SBI Small Cap Fund Direct-Growth': {
    name: 'R. Srinivasan',
    tenureFundYears: 13,
    tenureIndustryYears: 28,
    managedSince: '2013',
    otherFunds: ['SBI Focused Equity Fund', 'SBI Magnum Equity'],
    signal: 'High Trust · Pioneer small-cap specialist'
  },
  'HDFC Mid-Cap Opportunities Fund Direct-Growth': {
    name: 'Chirag Setalvad',
    tenureFundYears: 16,
    tenureIndustryYears: 26,
    managedSince: '2007',
    otherFunds: ['HDFC Small Cap Fund', 'HDFC Hybrid Equity'],
    signal: 'High Trust · 16+ years tenure on same mid-cap fund'
  },
  'UTI Nifty 50 Index Fund Direct-Growth': {
    name: 'Sharwan Kumar Goyal',
    tenureFundYears: 6,
    tenureIndustryYears: 18,
    managedSince: '2018',
    otherFunds: ['UTI Nifty Next 50 Index', 'UTI S&P BSE Sensex Index'],
    signal: 'Passive Specialist · Low tracking error record'
  },
  'ICICI Prudential Bluechip Fund Direct-Growth': {
    name: 'Anish Tawakley',
    tenureFundYears: 7,
    tenureIndustryYears: 22,
    managedSince: '2018',
    otherFunds: ['ICICI Prudential Business Cycle Fund'],
    signal: 'Institutional Veteran · Macro-economic asset allocator'
  },
  'Nippon India Small Cap Fund Direct-Growth': {
    name: 'Samir Rachh',
    tenureFundYears: 7,
    tenureIndustryYears: 20,
    managedSince: '2017',
    otherFunds: ['Nippon India Multi Cap Fund'],
    signal: 'High Growth · Specialized liquidity management'
  }
};

function getFundManagerInfo(schemeName) {
  if (!schemeName) return null;
  if (FUND_MANAGERS_DB[schemeName]) return FUND_MANAGERS_DB[schemeName];

  const matchedKey = Object.keys(FUND_MANAGERS_DB).find(k => schemeName.toLowerCase().includes(k.toLowerCase().split(' ')[0]));
  if (matchedKey) return FUND_MANAGERS_DB[matchedKey];

  return {
    name: 'Experienced Fund Manager',
    tenureFundYears: 5,
    tenureIndustryYears: 15,
    managedSince: '2019',
    otherFunds: ['Flagship Equity Schemes'],
    signal: 'Standard Institutional Management'
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FUND_MANAGERS_DB, getFundManagerInfo };
}

if (typeof window !== 'undefined') {
  window.FundManagerData = { FUND_MANAGERS_DB, getFundManagerInfo };
}
