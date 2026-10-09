// ============================================================
//  test-indicators.js — Unit test suite for quant indicator engine
// ============================================================
'use strict';

const IndicatorEngine = require('./js/indicators.js');
const SignalEngine = require('./js/signal.js');
const PositionAdvisor = require('./js/position.js');
const BacktestEngine = require('./js/backtest.js');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
    passedTests++;
  }
}

console.log('=== Running SaarthiX Quant Engine Unit Tests ===\n');

// 1. Test SMA Calculation with known values
const sampleCloses = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const sma5 = IndicatorEngine.calculateSMA(sampleCloses, 5);
assert(sma5[4] === 12.00, `SMA(5) at index 4 should be 12.00 (got ${sma5[4]})`);
assert(sma5[9] === 17.00, `SMA(5) at index 9 should be 17.00 (got ${sma5[9]})`);

// 2. Test EMA Calculation with known values
const ema3 = IndicatorEngine.calculateEMA([10, 12, 14, 16, 18], 3);
// k = 2/(3+1) = 0.5.
// initial SMA(3) at index 2 = (10+12+14)/3 = 12.00
// index 3: (16 - 12)*0.5 + 12 = 14.00
// index 4: (18 - 14)*0.5 + 14 = 16.00
assert(ema3[2] === 12.00, `Initial EMA(3) at index 2 should be 12.00 (got ${ema3[2]})`);
assert(ema3[3] === 14.00, `EMA(3) at index 3 should be 14.00 (got ${ema3[3]})`);
assert(ema3[4] === 16.00, `EMA(3) at index 4 should be 16.00 (got ${ema3[4]})`);

// 3. Test RSI Calculation on synthetic monotonically increasing series
const uptrendCloses = [];
for (let i = 0; i < 30; i++) uptrendCloses.push(100 + i * 2);
const rsiUp = IndicatorEngine.calculateRSI(uptrendCloses, 14);
assert(rsiUp[14] === 100.00, `RSI on pure gains should be 100 (got ${rsiUp[14]})`);
assert(rsiUp[25] === 100.00, `RSI sustained on gains should stay 100 (got ${rsiUp[25]})`);

// Monotonically decreasing series
const downtrendCloses = [];
for (let i = 0; i < 30; i++) downtrendCloses.push(200 - i * 2);
const rsiDown = IndicatorEngine.calculateRSI(downtrendCloses, 14);
assert(rsiDown[14] === 0.00, `RSI on pure losses should be 0 (got ${rsiDown[14]})`);

// 4. Test MACD Calculation
const waveCloses = [];
for (let i = 0; i < 60; i++) {
  waveCloses.push(100 + Math.sin(i / 5) * 20 + i * 0.5);
}
const macdObj = IndicatorEngine.calculateMACD(waveCloses, 12, 26, 9);
assert(Array.isArray(macdObj.macd), 'MACD line should be an array');
assert(Array.isArray(macdObj.signal), 'Signal line should be an array');
assert(Array.isArray(macdObj.histogram), 'Histogram should be an array');
assert(macdObj.macd.length === 60, `MACD length should match candle length 60 (got ${macdObj.macd.length})`);
assert(macdObj.macd[59] !== null, 'MACD line at index 59 should have valid numeric value');

// 5. Test Full Indicator Engine & Signal Evaluation
const sampleCandles = [];
let base = 50.0;
for (let i = 0; i < 200; i++) {
  const o = base;
  const c = base + (Math.random() - 0.45) * 1.5;
  const h = Math.max(o, c) + Math.random() * 0.8;
  const l = Math.min(o, c) - Math.random() * 0.8;
  sampleCandles.push({
    time: `2024-01-${String((i % 28) + 1).padStart(2, '0')}`,
    open: parseFloat(o.toFixed(2)),
    high: parseFloat(h.toFixed(2)),
    low: parseFloat(l.toFixed(2)),
    close: parseFloat(c.toFixed(2)),
    volume: 1000000 + i * 5000
  });
  base = c;
}

const techSuite = IndicatorEngine.computeAllIndicators(sampleCandles);
assert(techSuite !== null, 'computeAllIndicators should return non-null object');
assert(techSuite.indicators.ema21.length === 200, 'EMA 21 length should be 200');
assert(techSuite.indicators.supertrend.supertrend.length === 200, 'Supertrend length should be 200');

// 6. Test Signal Engine
const signalResult = SignalEngine.evaluateSignal(sampleCandles, techSuite);
assert(typeof signalResult.score === 'number', 'Signal score should be a number');
assert(signalResult.score >= -100 && signalResult.score <= 100, `Signal score should be between -100 and +100 (got ${signalResult.score})`);
assert(['STRONG BUY', 'BUY', 'HOLD', 'SELL', 'STRONG SELL'].includes(signalResult.verdict), `Verdict should be a valid label (got ${signalResult.verdict})`);
assert(signalResult.topReasons.length === 5, `Should output exactly 5 reasons (got ${signalResult.topReasons.length})`);

// 7. Test Position Advisor with User's Inox Wind holding
const inoxHolding = {
  ticker: 'INOXWIND',
  qty: 10,
  price: 50.00,
  ltp: 66.65,
  exchange: 'NSE'
};
const advice = PositionAdvisor.computePositionAdvice(inoxHolding, signalResult, techSuite);
assert(advice.cost === 500.00, `Invested cost should be ₹500 (got ${advice.cost})`);
assert(advice.val === 666.50, `Current value should be ₹666.50 (got ${advice.val})`);
assert(advice.unrealisedPnl === 166.50, `Unrealised PnL should be ₹166.50 (got ${advice.unrealisedPnl})`);
assert(advice.pnlPct.toFixed(1) === '33.3', `Return should be +33.3% (got ${advice.pnlPct.toFixed(1)})`);
assert(advice.stopLoss > 0, `Stop-loss should be > 0 (got ${advice.stopLoss})`);
assert(advice.target1 > advice.ltp, `Target 1 should be > LTP (got ${advice.target1})`);

// 8. Test Averaging Calculator
const avgCalc = PositionAdvisor.calculateAveraging(10, 50.00, 66.65, 10);
// 10 @ 50 + 10 @ 66.65 = 500 + 666.5 = 1166.5 / 20 = 58.325
assert(avgCalc.newQty === 20, `New Qty should be 20 (got ${avgCalc.newQty})`);
assert(avgCalc.newAvgPrice === 58.33 || avgCalc.newAvgPrice === 58.32, `New Avg Price should be ~58.33 (got ${avgCalc.newAvgPrice})`);

// 9. Test Backtest Engine
const backtestResult = BacktestEngine.runStrategyBacktest(sampleCandles, techSuite);
assert(backtestResult.initialCapital === 100000, 'Initial capital should be 100000');
assert(typeof backtestResult.winRate === 'number', 'Win rate should be a number');
assert(Array.isArray(backtestResult.equityCurve), 'Equity curve should be an array');

console.log(`\n🎉 ALL ${passedTests}/${totalTests} TESTS PASSED CLEANLY!`);
