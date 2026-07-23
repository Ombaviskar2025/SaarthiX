// ============================================================
//  lib/fundHoldingsData.js — Top Holdings per Mutual Fund
// ============================================================

const FUND_HOLDINGS_DB = {
  'Parag Parikh Flexi Cap Fund Direct-Growth': {
    disclosedDate: '2026-06-30',
    topHoldings: [
      { name: 'HDFC Bank Ltd.', ticker: 'HDFCBANK', weight: 8.2 },
      { name: 'Alphabet Inc.', ticker: 'GOOGL', weight: 7.1 },
      { name: 'Bajaj Holdings & Investment', ticker: 'BAJAJHLDNG', weight: 6.8 },
      { name: 'ITC Ltd.', ticker: 'ITC', weight: 5.9 },
      { name: 'ICICI Bank Ltd.', ticker: 'ICICIBANK', weight: 5.4 },
      { name: 'Microsoft Corporation', ticker: 'MSFT', weight: 4.8 },
      { name: 'Coal India Ltd.', ticker: 'COALINDIA', weight: 4.2 },
      { name: 'Power Grid Corp. of India', ticker: 'POWERGRID', weight: 3.9 }
    ]
  },
  'SBI Small Cap Fund Direct-Growth': {
    disclosedDate: '2026-06-30',
    topHoldings: [
      { name: 'Blue Star Ltd.', ticker: 'BLUESTARCO', weight: 4.8 },
      { name: 'Carborundum Universal Ltd.', ticker: 'CARBORUNIV', weight: 4.1 },
      { name: 'Kalpataru Projects International', ticker: 'KALPATPOWR', weight: 3.8 },
      { name: 'Lemon Tree Hotels Ltd.', ticker: 'LEMONTREE', weight: 3.5 },
      { name: 'Hawkins Cookers Ltd.', ticker: 'HAWKINCOOK', weight: 3.2 },
      { name: 'V-Guard Industries Ltd.', ticker: 'VGUARD', weight: 3.0 },
      { name: 'Narayana Hrudayalaya Ltd.', ticker: 'NH', weight: 2.9 }
    ]
  },
  'HDFC Mid-Cap Opportunities Fund Direct-Growth': {
    disclosedDate: '2026-06-30',
    topHoldings: [
      { name: 'Indian Hotels Company Ltd.', ticker: 'INDHOTEL', weight: 4.5 },
      { name: 'Max Healthcare Institute Ltd.', ticker: 'MAXHEALTH', weight: 4.1 },
      { name: 'Bharat Electronics Ltd.', ticker: 'BEL', weight: 3.9 },
      { name: 'Persistent Systems Ltd.', ticker: 'PERSISTENT', weight: 3.6 },
      { name: 'Coforge Ltd.', ticker: 'COFORGE', weight: 3.4 },
      { name: 'Federal Bank Ltd.', ticker: 'FEDERALBNK', weight: 3.2 },
      { name: 'Apollo Tyres Ltd.', ticker: 'APOLLOTYRE', weight: 2.8 }
    ]
  },
  'UTI Nifty 50 Index Fund Direct-Growth': {
    disclosedDate: '2026-06-30',
    topHoldings: [
      { name: 'HDFC Bank Ltd.', ticker: 'HDFCBANK', weight: 11.5 },
      { name: 'Reliance Industries Ltd.', ticker: 'RELIANCE', weight: 9.8 },
      { name: 'ICICI Bank Ltd.', ticker: 'ICICIBANK', weight: 7.9 },
      { name: 'Infosys Ltd.', ticker: 'INFY', weight: 5.8 },
      { name: 'Tata Consultancy Services', ticker: 'TCS', weight: 4.2 },
      { name: 'ITC Ltd.', ticker: 'ITC', weight: 4.1 },
      { name: 'Larsen & Toubro Ltd.', ticker: 'LT', weight: 3.9 },
      { name: 'Axis Bank Ltd.', ticker: 'AXISBANK', weight: 3.2 }
    ]
  },
  'ICICI Prudential Bluechip Fund Direct-Growth': {
    disclosedDate: '2026-06-30',
    topHoldings: [
      { name: 'ICICI Bank Ltd.', ticker: 'ICICIBANK', weight: 9.4 },
      { name: 'Reliance Industries Ltd.', ticker: 'RELIANCE', weight: 8.8 },
      { name: 'HDFC Bank Ltd.', ticker: 'HDFCBANK', weight: 8.1 },
      { name: 'Larsen & Toubro Ltd.', ticker: 'LT', weight: 5.2 },
      { name: 'Infosys Ltd.', ticker: 'INFY', weight: 4.9 },
      { name: 'Bharti Airtel Ltd.', ticker: 'BHARTIARTL', weight: 4.1 },
      { name: 'State Bank of India', ticker: 'SBIN', weight: 3.8 }
    ]
  },
  'Nippon India Small Cap Fund Direct-Growth': {
    disclosedDate: '2026-06-30',
    topHoldings: [
      { name: 'Tube Investments of India', ticker: 'TIINDIA', weight: 3.8 },
      { name: 'HDFC Bank Ltd.', ticker: 'HDFCBANK', weight: 3.2 },
      { name: 'KPIT Technologies Ltd.', ticker: 'KPITTECH', weight: 2.9 },
      { name: 'Multi Commodity Exchange of India', ticker: 'MCX', weight: 2.8 },
      { name: 'Poonawalla Fincorp Ltd.', ticker: 'POONAWALLA', weight: 2.5 }
    ]
  }
};

function getFundTopHoldings(schemeName) {
  if (!schemeName) return null;
  // Try exact match or partial scheme name match
  if (FUND_HOLDINGS_DB[schemeName]) return FUND_HOLDINGS_DB[schemeName];

  const matchedKey = Object.keys(FUND_HOLDINGS_DB).find(k => schemeName.toLowerCase().includes(k.toLowerCase().split(' ')[0]));
  if (matchedKey) return FUND_HOLDINGS_DB[matchedKey];

  return null;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FUND_HOLDINGS_DB, getFundTopHoldings };
}

if (typeof window !== 'undefined') {
  window.FundHoldingsData = { FUND_HOLDINGS_DB, getFundTopHoldings };
}
