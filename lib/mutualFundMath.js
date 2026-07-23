// ============================================================
//  lib/mutualFundMath.js — Pure Financial Logic for SaarthiX
//  Indian Mutual Fund Analysis & Calculations (FY 2026-27 Tax)
// ============================================================

/**
 * Category Expense Ratio Benchmarks (% per annum)
 */
const CATEGORY_EXPENSE_BENCHMARKS = {
  'Large Cap': 0.95,
  'Mid Cap': 1.05,
  'Small Cap': 1.15,
  'Flexi Cap': 1.00,
  'ELSS': 0.90,
  'Index': 0.25,
  'Debt': 0.45,
  'Hybrid': 0.90,
  'Gold': 0.40
};

/**
 * Category Risk Weightings (1=Low, 5=High)
 */
const CATEGORY_RISK_WEIGHTS = {
  'Debt': 1,
  'Gold': 2,
  'Index': 2,
  'Hybrid': 2,
  'Large Cap': 3,
  'ELSS': 3,
  'Flexi Cap': 4,
  'Mid Cap': 4,
  'Small Cap': 5
};

/**
 * Category to Sector Weightings Approximation (%)
 */
const CATEGORY_SECTOR_LOOKUP = {
  'Large Cap': { Financials: 32, Tech: 15, Energy: 12, Consumer: 14, Healthcare: 8, Auto: 7, Industrials: 6, Others: 6 },
  'Mid Cap': { Financials: 22, Industrials: 18, Tech: 14, Healthcare: 12, Auto: 10, Consumer: 12, Chemicals: 7, Others: 5 },
  'Small Cap': { Industrials: 24, Financials: 18, Healthcare: 14, Chemicals: 12, Tech: 10, Consumer: 12, Metals: 6, Others: 4 },
  'Flexi Cap': { Financials: 28, Tech: 16, Consumer: 14, Healthcare: 10, Energy: 10, Industrials: 8, Auto: 8, Others: 6 },
  'ELSS': { Financials: 30, Tech: 18, Consumer: 12, Healthcare: 10, Energy: 10, Auto: 10, Others: 10 },
  'Debt': { 'Govt Securities': 45, 'Corporate Bonds': 40, 'Cash / Money Mkt': 15 },
  'Hybrid': { Financials: 22, 'Debt / Cash': 30, Tech: 12, Energy: 10, Consumer: 10, Healthcare: 8, Others: 8 },
  'Index': { Financials: 34, Tech: 14, Energy: 12, Consumer: 10, Auto: 8, Healthcare: 6, Others: 16 },
  'Gold': { 'Gold / Precious Metals': 100 }
};

/**
 * Curated Better Alternatives JSON lookup
 */
const BETTER_ALTERNATIVES_DB = {
  'Large Cap': [
    { name: 'UTI Nifty 50 Index Fund Direct-Growth', expenseRatio: 0.18, threeYrReturn: '14.2%', reason: 'Low-cost index alternative tracking top 50 bluechips without active fund manager risk.' },
    { name: 'ICICI Prudential Bluechip Fund Direct-Growth', expenseRatio: 0.88, threeYrReturn: '16.5%', reason: 'Consistently beats large cap benchmark with disciplined risk management.' }
  ],
  'Mid Cap': [
    { name: 'HDFC Mid-Cap Opportunities Fund Direct-Growth', expenseRatio: 0.78, threeYrReturn: '24.1%', reason: 'High alpha generation with broad mid-cap diversification.' },
    { name: 'Motilal Oswal Midcap Fund Direct-Growth', expenseRatio: 0.65, threeYrReturn: '26.8%', reason: 'Focused portfolio strategy targeting high-growth market leaders.' }
  ],
  'Small Cap': [
    { name: 'Nippon India Small Cap Fund Direct-Growth', expenseRatio: 0.68, threeYrReturn: '28.4%', reason: 'Proven track record across market cycles with disciplined liquidity controls.' },
    { name: 'SBI Small Cap Fund Direct-Growth', expenseRatio: 0.69, threeYrReturn: '22.6%', reason: 'Conservative small-cap approach focusing on strong balance sheet companies.' }
  ],
  'Flexi Cap': [
    { name: 'Parag Parikh Flexi Cap Fund Direct-Growth', expenseRatio: 0.58, threeYrReturn: '19.8%', reason: 'Global equity diversification + value-oriented domestic allocation.' },
    { name: 'JM Flexicap Fund Direct-Growth', expenseRatio: 0.47, threeYrReturn: '23.5%', reason: 'Dynamic sector rotation with very competitive expense ratio.' }
  ],
  'ELSS': [
    { name: 'Mirae Asset ELSS Tax Saver Direct-Growth', expenseRatio: 0.59, threeYrReturn: '17.6%', reason: 'Tax saving under Sec 80C with balanced growth portfolio.' },
    { name: 'DSP ELSS Tax Saver Direct-Growth', expenseRatio: 0.71, threeYrReturn: '18.9%', reason: 'Consistent long-term performer with disciplined quality focus.' }
  ],
  'Debt': [
    { name: 'ICICI Prudential Corporate Bond Direct-Growth', expenseRatio: 0.28, threeYrReturn: '7.4%', reason: 'High credit quality (AAA rated papers) with low duration risk.' },
    { name: 'HDFC Short Term Debt Fund Direct-Growth', expenseRatio: 0.35, threeYrReturn: '7.1%', reason: 'Ideal for 1-3 year horizon with high liquidity and stability.' }
  ],
  'Hybrid': [
    { name: 'ICICI Prudential Equity & Debt Fund Direct-Growth', expenseRatio: 1.08, threeYrReturn: '21.2%', reason: 'Aggressive hybrid strategy with strong downside cushion.' }
  ],
  'Index': [
    { name: 'Navi Nifty 50 Index Fund Direct-Growth', expenseRatio: 0.06, threeYrReturn: '14.3%', reason: 'Ultra-low tracking error and lowest expense ratio in market.' }
  ],
  'Gold': [
    { name: 'Nippon India Gold Savings Fund Direct-Growth', expenseRatio: 0.12, threeYrReturn: '13.8%', reason: 'Efficient physical gold proxy without locker or storage costs.' }
  ]
};

/**
 * 1. Basic Investment Calculations
 */
function calcInvestedValue(units, avgNav) {
  const u = parseFloat(units) || 0;
  const nav = parseFloat(avgNav) || 0;
  return u * nav;
}

function calcCurrentValue(units, currentNav) {
  const u = parseFloat(units) || 0;
  const nav = parseFloat(currentNav) || 0;
  return u * nav;
}

function calcPnL(currentVal, investedVal) {
  return currentVal - investedVal;
}

function calcAbsReturn(currentVal, investedVal) {
  if (!investedVal || investedVal === 0) return 0;
  return ((currentVal - investedVal) / investedVal) * 100;
}

/**
 * 2. XIRR Newton-Raphson Solver with Bisection Fallback
 * CashFlows: Array of { amount: number (negative for investments, positive for current value), date: Date }
 */
function calcXIRR(cashFlows, guess = 0.12) {
  if (!cashFlows || cashFlows.length < 2) return 0;

  // Ensure cash flows are sorted by date
  const sorted = [...cashFlows].sort((a, b) => a.date.getTime() - b.date.getTime());
  const d0 = sorted[0].date;

  // Helper functions for f(r) and f'(r)
  function xirrVal(r) {
    let sum = 0;
    for (let i = 0; i < sorted.length; i++) {
      const days = (sorted[i].date.getTime() - d0.getTime()) / (1000 * 60 * 60 * 24);
      sum += sorted[i].amount / Math.pow(1 + r, days / 365);
    }
    return sum;
  }

  function xirrDeriv(r) {
    let sum = 0;
    for (let i = 0; i < sorted.length; i++) {
      const days = (sorted[i].date.getTime() - d0.getTime()) / (1000 * 60 * 60 * 24);
      sum -= (days / 365) * sorted[i].amount / Math.pow(1 + r, (days / 365) + 1);
    }
    return sum;
  }

  let rate = guess;
  const maxIter = 100;
  const tol = 1e-6;

  // Newton-Raphson loop
  for (let i = 0; i < maxIter; i++) {
    const fVal = xirrVal(rate);
    const fDeriv = xirrDeriv(rate);

    if (Math.abs(fVal) < tol) {
      return rate * 100; // return percentage
    }

    if (Math.abs(fDeriv) < 1e-10 || isNaN(fDeriv)) {
      break; // Fallback to bisection
    }

    const nextRate = rate - fVal / fDeriv;
    if (isNaN(nextRate) || nextRate <= -0.99) {
      break; // Fallback to bisection
    }

    if (Math.abs(nextRate - rate) < tol) {
      return nextRate * 100;
    }

    rate = nextRate;
  }

  // Bisection Fallback
  let low = -0.99;
  let high = 5.0; // 500% max
  let fLow = xirrVal(low);
  let fHigh = xirrVal(high);

  if (fLow * fHigh > 0) {
    // Return approximate CAGR if XIRR solver bounds fail
    const totalInvested = sorted.filter(c => c.amount < 0).reduce((s, c) => s - c.amount, 0);
    const finalVal = sorted[sorted.length - 1].amount;
    const years = (sorted[sorted.length - 1].date.getTime() - d0.getTime()) / (1000 * 60 * 60 * 24 * 365) || 1;
    if (totalInvested > 0 && finalVal > 0) {
      return (Math.pow(finalVal / totalInvested, 1 / years) - 1) * 100;
    }
    return 0;
  }

  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2;
    const fMid = xirrVal(mid);

    if (Math.abs(fMid) < tol || (high - low) / 2 < tol) {
      return mid * 100;
    }

    if (fLow * fMid < 0) {
      high = mid;
      fHigh = fMid;
    } else {
      low = mid;
      fLow = fMid;
    }
  }

  return ((low + high) / 2) * 100;
}

/**
 * 3. Build Cash Flow Stream for a Fund (SIP vs Lumpsum)
 */
function buildFundCashFlows(holding, today = new Date()) {
  const investedVal = calcInvestedValue(holding.units, holding.avgNav);
  const currentVal = calcCurrentValue(holding.units, holding.currentNav);
  const flows = [];

  if (holding.investType === 'SIP') {
    const startDate = holding.startDate ? new Date(holding.startDate) : new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    // Calculate number of monthly installments from start date up to today
    let months = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth()) + 1;
    months = Math.max(1, months);
    const monthlyAmt = investedVal / months;

    for (let m = 0; m < months; m++) {
      const installmentDate = new Date(startDate.getFullYear(), startDate.getMonth() + m, startDate.getDate());
      if (installmentDate <= today) {
        flows.push({ amount: -monthlyAmt, date: installmentDate });
      }
    }
  } else {
    // Lumpsum
    const purchaseDate = holding.purchaseDate ? new Date(holding.purchaseDate) : new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    flows.push({ amount: -investedVal, date: purchaseDate });
  }

  flows.push({ amount: currentVal, date: today });
  return flows;
}

/**
 * 4. Portfolio Health Score (0-100) with Transparent Weight Breakdown
 */
function calcHealthScore(holdings) {
  if (!holdings || holdings.length === 0) {
    return {
      score: 0,
      band: 'Poor',
      stars: 1,
      breakdown: { diversification: 0, overlap: 0, costEfficiency: 0, performance: 0, riskAlignment: 0 }
    };
  }

  const totalCurrentValue = holdings.reduce((s, h) => s + calcCurrentValue(h.units, h.currentNav), 0);

  // 1. Diversification Score (25%) - Penalize high concentration in one category or AMC
  const categoryMap = {};
  const amcMap = {};

  holdings.forEach(h => {
    const val = calcCurrentValue(h.units, h.currentNav);
    categoryMap[h.category] = (categoryMap[h.category] || 0) + val;
    amcMap[h.amc] = (amcMap[h.amc] || 0) + val;
  });

  let maxCatPct = 0;
  Object.values(categoryMap).forEach(v => {
    const pct = (v / totalCurrentValue) * 100;
    if (pct > maxCatPct) maxCatPct = pct;
  });

  // Ideal max concentration is <= 35%
  let divScore = 100;
  if (maxCatPct > 35) divScore -= (maxCatPct - 35) * 1.3;
  if (Object.keys(categoryMap).length === 1 && holdings.length > 1) divScore -= 20;
  if (holdings.length === 1) divScore -= 30;
  divScore = Math.max(10, Math.min(100, divScore));

  // 2. Overlap Score (20%) - Penalize multiple funds in the same equity category
  let overlapScore = 100;
  const equityCategories = ['Large Cap', 'Mid Cap', 'Small Cap', 'Flexi Cap', 'ELSS', 'Index'];
  const catCounts = {};
  holdings.forEach(h => {
    if (equityCategories.includes(h.category)) {
      catCounts[h.category] = (catCounts[h.category] || 0) + 1;
    }
  });
  Object.values(catCounts).forEach(cnt => {
    if (cnt > 1) overlapScore -= (cnt - 1) * 25;
  });
  overlapScore = Math.max(20, Math.min(100, overlapScore));

  // 3. Cost Efficiency (15%) - Compare expense ratios to benchmarks
  let weightedExpense = 0;
  let weightedBenchmark = 0;
  holdings.forEach(h => {
    const val = calcCurrentValue(h.units, h.currentNav);
    const weight = val / totalCurrentValue;
    const er = parseFloat(h.expenseRatio) || (CATEGORY_EXPENSE_BENCHMARKS[h.category] || 1.0);
    const bm = CATEGORY_EXPENSE_BENCHMARKS[h.category] || 1.0;
    weightedExpense += er * weight;
    weightedBenchmark += bm * weight;
  });

  let costScore = 100;
  if (weightedExpense > weightedBenchmark) {
    costScore -= (weightedExpense - weightedBenchmark) * 50;
  } else {
    costScore += (weightedBenchmark - weightedExpense) * 25;
  }
  costScore = Math.max(10, Math.min(100, costScore));

  // 4. Performance / Consistency (25%) - Portfolio return / XIRR
  const totalInvested = holdings.reduce((s, h) => s + calcInvestedValue(h.units, h.avgNav), 0);
  const totalPnL = totalCurrentValue - totalInvested;
  const absReturnPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  let perfScore = 60;
  if (absReturnPct >= 20) perfScore = 95;
  else if (absReturnPct >= 12) perfScore = 85;
  else if (absReturnPct >= 5) perfScore = 72;
  else if (absReturnPct >= 0) perfScore = 60;
  else perfScore = Math.max(10, 50 + absReturnPct * 2);

  // 5. Risk Alignment (15%)
  let weightedRisk = 0;
  holdings.forEach(h => {
    const val = calcCurrentValue(h.units, h.currentNav);
    const w = val / totalCurrentValue;
    weightedRisk += (CATEGORY_RISK_WEIGHTS[h.category] || 3) * w;
  });

  // Optimal risk score band is 2.5 to 3.8
  let riskScore = 85;
  if (weightedRisk > 4.2) riskScore = 60; // extremely aggressive
  else if (weightedRisk < 1.8) riskScore = 70; // extremely conservative

  // Composite Weighted Score
  const finalScore = Math.round(
    (divScore * 0.25) +
    (overlapScore * 0.20) +
    (costScore * 0.15) +
    (perfScore * 0.25) +
    (riskScore * 0.15)
  );

  let band = 'Needs Attention';
  let stars = 3;
  if (finalScore >= 80) { band = 'Excellent'; stars = 5; }
  else if (finalScore >= 65) { band = 'Good'; stars = 4; }
  else if (finalScore >= 45) { band = 'Needs Attention'; stars = 3; }
  else { band = 'Poor'; stars = 2; }

  return {
    score: finalScore,
    band,
    stars,
    breakdown: {
      diversification: Math.round(divScore),
      overlap: Math.round(overlapScore),
      costEfficiency: Math.round(costScore),
      performance: Math.round(perfScore),
      riskAlignment: Math.round(riskScore)
    },
    weightedExpense: weightedExpense.toFixed(2),
    weightedBenchmark: weightedBenchmark.toFixed(2),
    weightedRisk: weightedRisk.toFixed(1)
  };
}

/**
 * 5. Category Diversification Breakdown (%)
 */
function calcDiversification(holdings) {
  const totalVal = holdings.reduce((s, h) => s + calcCurrentValue(h.units, h.currentNav), 0);
  if (!totalVal) return [];

  const catMap = {};
  holdings.forEach(h => {
    const val = calcCurrentValue(h.units, h.currentNav);
    catMap[h.category] = (catMap[h.category] || 0) + val;
  });

  const COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#6366F1'];
  return Object.keys(catMap).map((cat, idx) => ({
    category: cat,
    value: catMap[cat],
    percentage: parseFloat(((catMap[cat] / totalVal) * 100).toFixed(1)),
    color: COLORS[idx % COLORS.length]
  })).sort((a, b) => b.value - a.value);
}

/**
 * 6. Sector Allocation Approximation (%)
 */
function calcSectorAllocation(holdings) {
  const totalVal = holdings.reduce((s, h) => s + calcCurrentValue(h.units, h.currentNav), 0);
  if (!totalVal) return [];

  const sectorMap = {};
  holdings.forEach(h => {
    const fundVal = calcCurrentValue(h.units, h.currentNav);
    const sectors = CATEGORY_SECTOR_LOOKUP[h.category] || { Others: 100 };
    Object.keys(sectors).forEach(sec => {
      const secVal = fundVal * (sectors[sec] / 100);
      sectorMap[sec] = (sectorMap[sec] || 0) + secVal;
    });
  });

  return Object.keys(sectorMap).map(sec => ({
    sector: sec,
    value: sectorMap[sec],
    percentage: parseFloat(((sectorMap[sec] / totalVal) * 100).toFixed(1))
  })).sort((a, b) => b.percentage - a.percentage);
}

/**
 * 7. Risk Meter Score & Label
 */
function calcRiskMeter(holdings) {
  const totalVal = holdings.reduce((s, h) => s + calcCurrentValue(h.units, h.currentNav), 0);
  if (!totalVal) return { label: 'Medium', score: '3.0', pct: 50 };

  let weightedRisk = 0;
  holdings.forEach(h => {
    const val = calcCurrentValue(h.units, h.currentNav);
    const w = val / totalVal;
    weightedRisk += (CATEGORY_RISK_WEIGHTS[h.category] || 3) * w;
  });

  let label = 'Medium';
  if (weightedRisk <= 1.8) label = 'Low';
  else if (weightedRisk <= 2.6) label = 'Medium-Low';
  else if (weightedRisk <= 3.4) label = 'Medium';
  else if (weightedRisk <= 4.2) label = 'Medium-High';
  else label = 'High';

  const pct = Math.min(100, Math.max(10, ((weightedRisk - 1) / 4) * 100));
  return { label, score: weightedRisk.toFixed(1), pct: Math.round(pct) };
}

/**
 * 8. Overlap Detector
 */
function calcOverlapDetector(holdings) {
  const pairs = [];
  for (let i = 0; i < holdings.length; i++) {
    for (let j = i + 1; j < holdings.length; j++) {
      const f1 = holdings[i];
      const f2 = holdings[j];

      if (f1.category === f2.category) {
        let overlapEst = 55;
        if (f1.category === 'Index') overlapEst = 92;
        else if (f1.amc === f2.amc) overlapEst = 68;

        pairs.push({
          fund1: f1.schemeName || 'Fund A',
          fund2: f2.schemeName || 'Fund B',
          category: f1.category,
          estimatedOverlapPct: overlapEst,
          risk: overlapEst > 70 ? 'High' : 'Moderate'
        });
      }
    }
  }
  return pairs;
}

/**
 * 9. SIP Optimizer Recommendation
 */
function calcSipOptimizer(holdings) {
  const currentSipTotal = holdings
    .filter(h => h.investType === 'SIP')
    .reduce((s, h) => s + (calcInvestedValue(h.units, h.avgNav) / 12), 0);

  const suggestedIncrease = Math.max(1000, Math.round(currentSipTotal * 0.10));

  // Allocate increase across top funds
  const sortedByPerf = [...holdings].sort((a, b) => {
    const rA = calcAbsReturn(calcCurrentValue(a.units, a.currentNav), calcInvestedValue(a.units, a.avgNav));
    const rB = calcAbsReturn(calcCurrentValue(b.units, b.currentNav), calcInvestedValue(b.units, b.avgNav));
    return rB - rA;
  });

  const top1 = sortedByPerf[0] ? sortedByPerf[0].schemeName : 'Top Rated Equity Fund';
  const top2 = sortedByPerf[1] ? sortedByPerf[1].schemeName : null;

  return {
    currentSipEst: Math.round(currentSipTotal),
    suggestedIncrease,
    recommendations: top2 ? [
      { fund: top1, increase: Math.round(suggestedIncrease * 0.60), reason: 'Highest absolute return performer in portfolio.' },
      { fund: top2, increase: Math.round(suggestedIncrease * 0.40), reason: 'Strong secondary compounding asset.' }
    ] : [
      { fund: top1, increase: suggestedIncrease, reason: 'Primary equity growth vehicle.' }
    ]
  };
}

/**
 * 10. Tax Estimator (FY 2026-27 Rules with SIP FIFO Lot Tracking)
 */
function calcTaxEstimator(holdings, slabRatePct = 30, today = new Date()) {
  let totalEquityLtcgGain = 0;
  let totalEquityStcgGain = 0;
  let totalDebtSlabGain = 0;
  let totalDebtLtcgGain = 0;

  const equityCategories = ['Large Cap', 'Mid Cap', 'Small Cap', 'Flexi Cap', 'ELSS', 'Index', 'Hybrid'];

  holdings.forEach(h => {
    const investedVal = calcInvestedValue(h.units, h.avgNav);
    const currentVal = calcCurrentValue(h.units, h.currentNav);
    const totalGain = currentVal - investedVal;

    if (totalGain <= 0) return; // No taxable gains on loss-making funds

    const isEquity = equityCategories.includes(h.category);

    if (h.investType === 'SIP') {
      // FIFO Lot Tracking per monthly installment
      const startDate = h.startDate ? new Date(h.startDate) : new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      let months = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth()) + 1;
      months = Math.max(1, months);

      const unitsPerLot = parseFloat(h.units) / months;
      const navDiff = parseFloat(h.currentNav) - parseFloat(h.avgNav);

      for (let m = 0; m < months; m++) {
        const lotDate = new Date(startDate.getFullYear(), startDate.getMonth() + m, startDate.getDate());
        const daysHeld = (today.getTime() - lotDate.getTime()) / (1000 * 60 * 60 * 24);
        const lotGain = unitsPerLot * navDiff;

        if (lotGain <= 0) continue;

        if (isEquity) {
          if (daysHeld > 365) {
            totalEquityLtcgGain += lotGain;
          } else {
            totalEquityStcgGain += lotGain;
          }
        } else {
          // Debt Fund
          const postApril2023 = lotDate >= new Date('2023-04-01');
          if (postApril2023) {
            totalDebtSlabGain += lotGain;
          } else {
            if (daysHeld > 730) {
              totalDebtLtcgGain += lotGain;
            } else {
              totalDebtSlabGain += lotGain;
            }
          }
        }
      }
    } else {
      // Lumpsum
      const purchaseDate = h.purchaseDate ? new Date(h.purchaseDate) : new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      const daysHeld = (today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24);

      if (isEquity) {
        if (daysHeld > 365) {
          totalEquityLtcgGain += totalGain;
        } else {
          totalEquityStcgGain += totalGain;
        }
      } else {
        const postApril2023 = purchaseDate >= new Date('2023-04-01');
        if (postApril2023) {
          totalDebtSlabGain += totalGain;
        } else {
          if (daysHeld > 730) {
            totalDebtLtcgGain += totalGain;
          } else {
            totalDebtSlabGain += totalGain;
          }
        }
      }
    }
  });

  // Apply Section 112A ₹1,25,000 combined exemption on Equity LTCG
  const EXEMPTION_LIMIT = 125000;
  const taxableEquityLtcg = Math.max(0, totalEquityLtcgGain - EXEMPTION_LIMIT);

  const equityLtcgTax = taxableEquityLtcg * 0.125; // 12.5%
  const equityStcgTax = totalEquityStcgGain * 0.20;  // 20.0%
  const debtSlabTax = totalDebtSlabGain * (slabRatePct / 100);
  const debtLtcgTax = totalDebtLtcgGain * 0.125;

  const totalEstTax = equityLtcgTax + equityStcgTax + debtSlabTax + debtLtcgTax;

  return {
    totalEquityLtcgGain: Math.round(totalEquityLtcgGain),
    exemptionLimit: EXEMPTION_LIMIT,
    taxableEquityLtcg: Math.round(taxableEquityLtcg),
    equityLtcgTax: Math.round(equityLtcgTax),

    totalEquityStcgGain: Math.round(totalEquityStcgGain),
    equityStcgTax: Math.round(equityStcgTax),

    totalDebtSlabGain: Math.round(totalDebtSlabGain),
    slabRatePct,
    debtSlabTax: Math.round(debtSlabTax),

    totalDebtLtcgGain: Math.round(totalDebtLtcgGain),
    debtLtcgTax: Math.round(debtLtcgTax),

    totalEstTax: Math.round(totalEstTax),
    disclaimer: 'Estimate only — excludes surcharge and 4% health & education cess. Confirm with a tax advisor before filing.'
  };
}

/**
 * 11. Better Alternatives Lookup
 */
function getBetterAlternatives(holdings) {
  const list = [];
  holdings.forEach(h => {
    const alts = BETTER_ALTERNATIVES_DB[h.category];
    if (alts && alts.length > 0) {
      alts.forEach(alt => {
        list.push({
          currentFund: h.schemeName || `${h.category} Fund`,
          currentCategory: h.category,
          currentExpenseRatio: h.expenseRatio || CATEGORY_EXPENSE_BENCHMARKS[h.category],
          suggestedFund: alt.name,
          suggestedExpenseRatio: alt.expenseRatio,
          threeYrReturn: alt.threeYrReturn,
          reason: alt.reason
        });
      });
    }
  });
  return list.slice(0, 5); // top 5
}

/**
 * 12. Future Projection (Compound Growth)
 */
function calcFutureProjection(currentValue, cagrPct = 12, years = 10) {
  const points = [];
  const rate = cagrPct / 100;
  for (let y = 0; y <= years; y++) {
    const val = currentValue * Math.pow(1 + rate, y);
    points.push({
      year: y === 0 ? 'Today' : `+${y}Y`,
      value: Math.round(val)
    });
  }
  return points;
}

/**
 * 13. Isolated Mockable Current NAV Fetcher
 */
function getCurrentNav(schemeCode) {
  // Stub for future AMFI live NAV API call
  return Promise.resolve(null);
}

// Module export (works in Node environment and browser window)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CATEGORY_EXPENSE_BENCHMARKS,
    CATEGORY_RISK_WEIGHTS,
    CATEGORY_SECTOR_LOOKUP,
    BETTER_ALTERNATIVES_DB,
    calcInvestedValue,
    calcCurrentValue,
    calcPnL,
    calcAbsReturn,
    calcXIRR,
    buildFundCashFlows,
    calcHealthScore,
    calcDiversification,
    calcSectorAllocation,
    calcRiskMeter,
    calcOverlapDetector,
    calcSipOptimizer,
    calcTaxEstimator,
    getBetterAlternatives,
    calcFutureProjection,
    getCurrentNav
  };
}

if (typeof window !== 'undefined') {
  window.MFMath = {
    CATEGORY_EXPENSE_BENCHMARKS,
    CATEGORY_RISK_WEIGHTS,
    CATEGORY_SECTOR_LOOKUP,
    BETTER_ALTERNATIVES_DB,
    calcInvestedValue,
    calcCurrentValue,
    calcPnL,
    calcAbsReturn,
    calcXIRR,
    buildFundCashFlows,
    calcHealthScore,
    calcDiversification,
    calcSectorAllocation,
    calcRiskMeter,
    calcOverlapDetector,
    calcSipOptimizer,
    calcTaxEstimator,
    getBetterAlternatives,
    calcFutureProjection,
    getCurrentNav
  };
}
