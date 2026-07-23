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
console.log(' Running Unit Tests for SaarthiX Mutual Fund Engine');
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
    purchaseDate: '2023-01-15', // held > 12m -> LTCG
    expenseRatio: 0.58
  }
];
const taxResult = MFMath.calcTaxEstimator(sampleHoldings, 30, today);
console.log(`  Equity LTCG Gain: ₹${taxResult.totalEquityLtcgGain}`);
console.log(`  Exemption Limit: ₹${taxResult.exemptionLimit}`);
console.log(`  Taxable Equity LTCG: ₹${taxResult.taxableEquityLtcg}`);
console.log(`  Equity LTCG Tax @12.5%: ₹${taxResult.equityLtcgTax}`);
assert(taxResult.totalEquityLtcgGain === 200000, 'Total Equity LTCG gain = ₹2,00,000');
assert(taxResult.taxableEquityLtcg === 75000, 'Taxable Equity LTCG = ₹2,00,000 - ₹1,25,000 = ₹75,000');
assert(taxResult.equityLtcgTax === 9375, 'LTCG Tax @ 12.5% on ₹75,000 = ₹9,375');

// Test 4: Debt Fund Taxation (post-April 2023 slab rate)
console.log('\n[Test 4] Post-April 2023 Debt Fund Tax (Income Slab Rate)');
const debtHoldings = [
  {
    schemeName: 'ICICI Prudential Corporate Bond',
    amc: 'ICICI Prudential',
    category: 'Debt',
    units: 1000,
    avgNav: 10,
    currentNav: 12, // gain 2000
    investType: 'Lumpsum',
    purchaseDate: '2024-05-10', // post 1-Apr-2023
    expenseRatio: 0.28
  }
];
const debtTax = MFMath.calcTaxEstimator(debtHoldings, 30, today);
console.log(`  Debt Gain: ₹${debtTax.totalDebtSlabGain}, Tax @ 30% Slab: ₹${debtTax.debtSlabTax}`);
assert(debtTax.totalDebtSlabGain === 2000, 'Debt gain = ₹2,000');
assert(debtTax.debtSlabTax === 600, 'Debt Tax @ 30% slab rate = ₹600');

// Test 5: Health Score Model
console.log('\n[Test 5] Composite Portfolio Health Score');
const portfolioResult = useMutualFundPortfolio([
  { schemeName: 'SBI Small Cap', amc: 'SBI MF', category: 'Small Cap', units: 100, avgNav: 100, currentNav: 140, investType: 'SIP', expenseRatio: 0.69 },
  { schemeName: 'UTI Nifty 50 Index', amc: 'UTI MF', category: 'Index', units: 200, avgNav: 100, currentNav: 120, investType: 'SIP', expenseRatio: 0.18 }
]);
console.log(`  Composite Health Score: ${portfolioResult.health.score} (${portfolioResult.health.band})`);
assert(portfolioResult.health.score >= 50 && portfolioResult.health.score <= 100, 'Health score is within 50-100 range for balanced portfolio');

console.log('\n============================================================');
console.log(` TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log('============================================================\n');

if (failCount > 0) process.exit(1);
