// ============================================================
//  test-mf-math.js — Unit Tests for Mutual Fund Math & Tax Logic
// ============================================================

const MFMath = require('./lib/mutualFundMath.js');
const { useMutualFundPortfolio } = require('./lib/useMutualFundPortfolio.js');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ✕ FAIL: ${message}`);
    failCount++;
  }
}

console.log('============================================================');
console.log(' Running Unit Tests for SaarthiX Mutual Fund Engine (Phase 1 & 2)');
console.log('============================================================\n');

// Test 1: Basic Calculations
console.log('[Test 1] Basic Financial Formulas');
const invested = MFMath.calcInvestedValue(100, 50); // 5000
const current = MFMath.calcCurrentValue(100, 75);  // 7500
const pnl = MFMath.calcPnL(current, invested);     // 2500
const absRet = MFMath.calcAbsReturn(current, invested); // 50%
assert(invested === 5000, 'Invested value calculation (100 * 50 = 5000)');
assert(current === 7500, 'Current value calculation (100 * 75 = 7500)');
assert(pnl === 2500, 'P&L calculation (7500 - 5000 = 2500)');
assert(absRet === 50, 'Absolute Return % calculation (2500 / 5000 * 100 = 50%)');

// Test 2: XIRR Solver
console.log('\n[Test 2] Newton-Raphson XIRR Solver');
const today = new Date();
const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
const sampleCashFlows = [
  { amount: -100000, date: oneYearAgo },
  { amount: 115000, date: today }
];
const xirr = MFMath.calcXIRR(sampleCashFlows);
console.log(`  Calculated XIRR: ${xirr.toFixed(2)}% (Expected ~15.0%)`);
assert(xirr >= 14.5 && xirr <= 15.5, 'XIRR solver returns accurate return (~15%) for 1-year holding');

// Test 3: FY 2026-27 Tax Estimator (Equity LTCG > 1.25L Exemption)
console.log('\n[Test 3] FY 2026-27 Tax Estimator (Section 112A Exemption)');
const sampleHoldings = [
  {
    schemeName: 'Parag Parikh Flexi Cap Fund',
    amc: 'PPFAS',
    category: 'Flexi Cap',
    units: 1000,
    avgNav: 50,
    currentNav: 250, // invested 50k, current 2.5L, gain 2L
    investType: 'Lumpsum',
    purchaseDate: '2023-01-15',
    expenseRatio: 0.58
  }
];
const taxResult = MFMath.calcTaxEstimator(sampleHoldings, 30, today);
assert(taxResult.totalEquityLtcgGain === 200000, 'Total Equity LTCG gain = ₹2,00,000');
assert(taxResult.taxableEquityLtcg === 75000, 'Taxable Equity LTCG = ₹2,00,000 - ₹1,25,000 = ₹75,000');
assert(taxResult.equityLtcgTax === 9375, 'LTCG Tax @ 12.5% on ₹75,000 = ₹9,375');

// Test 4: Debt Fund Taxation
console.log('\n[Test 4] Post-April 2023 Debt Fund Tax (Income Slab Rate)');
const debtHoldings = [
  {
    schemeName: 'ICICI Prudential Corporate Bond',
    amc: 'ICICI Prudential',
    category: 'Debt',
    units: 1000,
    avgNav: 10,
    currentNav: 12,
    investType: 'Lumpsum',
    purchaseDate: '2024-05-10',
    expenseRatio: 0.28
  }
];
const debtTax = MFMath.calcTaxEstimator(debtHoldings, 30, today);
assert(debtTax.totalDebtSlabGain === 2000, 'Debt gain = ₹2,000');
assert(debtTax.debtSlabTax === 600, 'Debt Tax @ 30% slab rate = ₹600');

// Test 5: Fund Rating & Category Rank (Phase 2)
console.log('\n[Test 5] Phase 2: Fund Rating & Category Rank');
const rating = MFMath.computeFundRating({ units: 100, avgNav: 50, currentNav: 75, expenseRatio: 0.58, category: 'Flexi Cap' });
const rank = MFMath.computeCategoryRank({ category: 'Flexi Cap', units: 100, avgNav: 50, currentNav: 75, expenseRatio: 0.58 });
console.log(`  Computed Rating: ${rating.score}/5 (${rating.stars} Stars)`);
console.log(`  Category Rank: ${rank.rankString}`);
assert(rating.stars >= 1 && rating.stars <= 5, 'Fund rating produces 1-5 star score');
assert(rank.rank >= 1 && rank.rank <= 42, 'Category rank produces valid rank within category total');

// Test 6: Jaccard Stock-Level Overlap (Phase 2)
console.log('\n[Test 6] Phase 2: Stock-Level Jaccard Overlap');
const fund1Stocks = [{ ticker: 'HDFCBANK' }, { ticker: 'RELIANCE' }, { ticker: 'INFY' }, { ticker: 'TCS' }];
const fund2Stocks = [{ ticker: 'HDFCBANK' }, { ticker: 'ICICIBANK' }, { ticker: 'INFY' }, { ticker: 'LT' }];
const jaccard = MFMath.calcJaccardOverlap(fund1Stocks, fund2Stocks);
console.log(`  Jaccard Similarity: ${jaccard.jaccardPct}% (Common: ${jaccard.commonStocks.join(', ')})`);
assert(jaccard.commonCount === 2, 'Identifies 2 common stocks (HDFCBANK, INFY)');
assert(jaccard.jaccardPct === 33, 'Jaccard similarity = 2 / 6 = 33%');

// Test 7: Goal-Based Planner Annuity Math (Phase 2)
console.log('\n[Test 7] Phase 2: Goal-Based Investment Planner');
const goals = [
  { id: 'g1', name: 'Dream House', targetAmount: 5000000, targetDate: '2031-12-31' }
];
const goalResult = MFMath.computeGoalPlan(goals, 12, 500000, today);
console.log(`  Goal: ${goalResult[0].name} | Target: ₹${goalResult[0].targetAmount} | Required SIP: ₹${goalResult[0].requiredSip}/mo`);
assert(goalResult[0].requiredSip > 0, 'Computes positive monthly required SIP');
assert(typeof goalResult[0].isOnTrack === 'boolean', 'Computes boolean on-track status indicator');

// Test 8: AMC Grouping Selector (Phase 2)
console.log('\n[Test 8] Phase 2: AMC Grouping Selector');
const amcList = MFMath.groupByAmc([
  { amc: 'PPFAS', units: 100, avgNav: 50, currentNav: 75, expenseRatio: 0.58 },
  { amc: 'PPFAS', units: 200, avgNav: 10, currentNav: 15, expenseRatio: 0.60 },
  { amc: 'SBI MF', units: 50, avgNav: 100, currentNav: 150, expenseRatio: 0.69 }
]);
assert(amcList.length === 2, 'Groups 3 holdings into 2 distinct AMCs');
assert(amcList[0].amc === 'PPFAS', 'Sorts largest AMC by portfolio value first');

// Test 9: ELSS 80C Tax-Saving Suggestions (Phase 2)
console.log('\n[Test 9] Phase 2: ELSS 80C Tax Savings');
const elssSuggest = MFMath.calcElssTaxSavings([
  { category: 'ELSS', units: 500, avgNav: 100, currentNav: 120 } // invested 50,000
]);
console.log(`  ELSS Invested: ₹${elssSuggest.elssInvested} | Unused 80C Headroom: ₹${elssSuggest.unused80C}`);
assert(elssSuggest.elssInvested === 50000, 'Calculates ₹50,000 ELSS investment');
assert(elssSuggest.unused80C === 100000, 'Calculates ₹1,00,000 unused 80C headroom');

console.log('\n============================================================');
console.log(` TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log('============================================================\n');

if (failCount > 0) process.exit(1);
