// ============================================================
//  lib/useMutualFundPortfolio.js — Single Source of Truth
//  Lifts raw holding entries into derived portfolio metrics
// ============================================================

if (typeof require !== 'undefined') {
  var MFMath = require('./mutualFundMath.js');
}

function useMutualFundPortfolio(rawHoldings, slabRatePct = 30, goals = []) {
  if (!rawHoldings || !Array.isArray(rawHoldings) || rawHoldings.length === 0) {
    return {
      holdings: [],
      summary: {
        totalInvested: 0,
        totalCurrentValue: 0,
        totalPnL: 0,
        absReturnPct: 0,
        todaysGainEst: 0,
        portfolioXIRR: 0,
        weightedExpenseRatio: 0,
        healthScore: 0
      },
      health: MFMath.calcHealthScore([]),
      diversification: [],
      sectorAllocation: [],
      riskMeter: { label: 'Low', score: '1.0', pct: 0 },
      overlap: [],
      sipOptimizer: { currentSipEst: 0, suggestedIncrease: 1000, recommendations: [] },
      taxEstimator: MFMath.calcTaxEstimator([], slabRatePct),
      betterAlternatives: [],
      projections: MFMath.calcFutureProjection(0, 12, 10),

      // Phase 2 Returns
      amcGrouped: [],
      elssTaxSuggestions: MFMath.calcElssTaxSavings([]),
      goalPlans: []
    };
  }

  // Enforce data normalization
  const holdings = rawHoldings.map((h, i) => {
    const units = parseFloat(h.units) || 0;
    const avgNav = parseFloat(h.avgNav) || 0;
    const currentNav = parseFloat(h.currentNav) || avgNav;
    const investedVal = MFMath.calcInvestedValue(units, avgNav);
    const currentVal = MFMath.calcCurrentValue(units, currentNav);
    const pnl = MFMath.calcPnL(currentVal, investedVal);
    const absReturnPct = MFMath.calcAbsReturn(currentVal, investedVal);
    const expenseRatio = parseFloat(h.expenseRatio) || (MFMath.CATEGORY_EXPENSE_BENCHMARKS[h.category] || 1.0);

    const normHolding = {
      id: h.id || i + 1,
      schemeName: h.schemeName || 'Unnamed Mutual Fund',
      amc: h.amc || 'Asset Management Company',
      category: h.category || 'Flexi Cap',
      units,
      avgNav,
      currentNav,
      investType: h.investType || 'SIP',
      startDate: h.startDate || null,
      purchaseDate: h.purchaseDate || null,
      expenseRatio,
      investedVal,
      currentVal,
      pnl,
      absReturnPct
    };

    // Phase 2 per-fund computed properties
    normHolding.rating = MFMath.computeFundRating(normHolding);
    normHolding.categoryRank = MFMath.computeCategoryRank(normHolding);

    return normHolding;
  });

  const totalInvested = holdings.reduce((s, h) => s + h.investedVal, 0);
  const totalCurrentValue = holdings.reduce((s, h) => s + h.currentVal, 0);
  const totalPnL = totalCurrentValue - totalInvested;
  const absReturnPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  let combinedCashFlows = [];
  holdings.forEach(h => {
    const fundFlows = MFMath.buildFundCashFlows(h);
    combinedCashFlows = combinedCashFlows.concat(fundFlows);
  });

  const portfolioXIRR = MFMath.calcXIRR(combinedCashFlows);
  const todaysGainEst = totalCurrentValue * 0.0045;

  let weightedExpenseRatio = 0;
  if (totalCurrentValue > 0) {
    holdings.forEach(h => {
      weightedExpenseRatio += h.expenseRatio * (h.currentVal / totalCurrentValue);
    });
  }

  const health = MFMath.calcHealthScore(holdings);
  const diversification = MFMath.calcDiversification(holdings);
  const sectorAllocation = MFMath.calcSectorAllocation(holdings);
  const riskMeter = MFMath.calcRiskMeter(holdings);
  const overlap = MFMath.calcOverlapDetector(holdings);
  const sipOptimizer = MFMath.calcSipOptimizer(holdings);
  const taxEstimator = MFMath.calcTaxEstimator(holdings, slabRatePct);
  const betterAlternatives = MFMath.getBetterAlternatives(holdings);
  const projections = MFMath.calcFutureProjection(totalCurrentValue, 12, 10);

  // Phase 2
  const amcGrouped = MFMath.groupByAmc(holdings);
  const elssTaxSuggestions = MFMath.calcElssTaxSavings(holdings);
  const goalPlans = MFMath.computeGoalPlan(goals, portfolioXIRR, totalCurrentValue);

  return {
    holdings,
    summary: {
      totalInvested: Math.round(totalInvested),
      totalCurrentValue: Math.round(totalCurrentValue),
      totalPnL: Math.round(totalPnL),
      absReturnPct: parseFloat(absReturnPct.toFixed(2)),
      todaysGainEst: Math.round(todaysGainEst),
      portfolioXIRR: parseFloat(portfolioXIRR.toFixed(2)),
      weightedExpenseRatio: parseFloat(weightedExpenseRatio.toFixed(2)),
      healthScore: health.score
    },
    health,
    diversification,
    sectorAllocation,
    riskMeter,
    overlap,
    sipOptimizer,
    taxEstimator,
    betterAlternatives,
    projections,

    // Phase 2
    amcGrouped,
    elssTaxSuggestions,
    goalPlans
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { useMutualFundPortfolio };
}

if (typeof window !== 'undefined') {
  window.useMutualFundPortfolio = useMutualFundPortfolio;
}
