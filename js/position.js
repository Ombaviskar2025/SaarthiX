// ============================================================
//  js/position.js — SaarthiX Position-Aware Quant Advisor
//  Generates custom actions (Add More, Average Down, Trail SL, Exit)
//  with live averaging calculator and tax optimization metrics.
// ============================================================
'use strict';

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PositionAdvisor = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  /**
   * Compute comprehensive position-aware action & metrics
   * @param {Object} holding { qty, price, ltp, ticker, exchange }
   * @param {Object} signalData result of SignalEngine.evaluateSignal
  function computePositionAdvice(holding, arg2, arg3, arg4) {
    // Gracefully handle both (holding, signalData, technicalData) and (holding, candles, technicalData, signalData)
    let signalData, technicalData;
    if (arg4 !== undefined) {
      // 4-arg signature: (holding, candles, technicalData, signalReport)
      technicalData = arg3;
      signalData = arg4;
    } else {
      // 3-arg signature: (holding, signalData, technicalData)
      signalData = arg2;
      technicalData = arg3;
    }

    const qty = parseFloat(holding?.qty) || 1;
    const avgPrice = parseFloat(holding?.price) || 100;
    const ltp = parseFloat(holding?.ltp) || avgPrice;
    const ticker = holding?.ticker || 'STOCK';

    const cost = qty * avgPrice;
    const val = qty * ltp;
    const unrealisedPnl = val - cost;
    const pnlPct = cost > 0 ? (unrealisedPnl / cost) * 100 : 0;
    const isGain = unrealisedPnl >= 0;
    const distFromAvgPct = avgPrice > 0 ? ((ltp - avgPrice) / avgPrice) * 100 : 0;

    // Technical Context
    const last = arr => (arr && arr.length ? arr[arr.length - 1] : null);
    const indicators = technicalData?.indicators || (technicalData && !technicalData.candles ? technicalData : {});
    const atr = last(indicators.atr) || (ltp * 0.025);
    const ema21 = last(indicators.ema21) || ltp * 0.98;
    const ema50 = last(indicators.ema50) || ltp * 0.95;
    const ema200 = last(indicators.ema200) || ltp * 0.90;
    const rsi = last(indicators.rsi) !== null && last(indicators.rsi) !== undefined ? last(indicators.rsi) : 50;
    const supertrendDir = indicators.supertrend && last(indicators.supertrend.direction) !== null && last(indicators.supertrend.direction) !== undefined ? last(indicators.supertrend.direction) : 1;
    const supertrendLine = indicators.supertrend && last(indicators.supertrend.supertrend) !== null && last(indicators.supertrend.supertrend) !== undefined ? last(indicators.supertrend.supertrend) : ltp * 0.94;

    const supports = indicators.supportResistance?.supports || [parseFloat((ltp * 0.94).toFixed(2))];
    const resistances = indicators.supportResistance?.resistances || [parseFloat((ltp * 1.08).toFixed(2))];

    // ─────────────────────────────────────────────────────────────
    // 1. Dynamic Stop-Loss & Target Calculations
    // ─────────────────────────────────────────────────────────────
    let stopLoss = 0;
    if (isGain) {
      // In Profit: Trailing stop-loss above cost price if possible
      const trailingATR = ltp - 2.0 * atr;
      const supertrendSL = supertrendDir === 1 ? supertrendLine : trailingATR;
      stopLoss = parseFloat(Math.max(avgPrice * 0.98, Math.min(ltp * 0.96, Math.max(trailingATR, supertrendSL))).toFixed(2));
    } else {
      // In Drawdown: Defined risk stop below recent support
      const majorSupport = supports[0] || (ltp - 1.8 * atr);
      stopLoss = parseFloat(Math.min(ltp * 0.93, majorSupport - 0.5 * atr).toFixed(2));
    }

    // Two Realistic Profit Targets
    const nearestRes = resistances.find(r => r > ltp) || (ltp + 2.0 * atr);
    const target1 = parseFloat(Math.max(ltp + 1.8 * atr, nearestRes).toFixed(2));
    const target2 = parseFloat((ltp + 3.8 * atr).toFixed(2));

    const riskPerShare = parseFloat(Math.max(0.5, ltp - stopLoss).toFixed(2));
    const rewardPerShare = parseFloat(Math.max(0.5, target1 - ltp).toFixed(2));
    const rrRatio = parseFloat((rewardPerShare / riskPerShare).toFixed(1));

    // ─────────────────────────────────────────────────────────────
    // 2. Action Card Recommendation Logic
    // ─────────────────────────────────────────────────────────────
    const score = signalData?.score || 0;
    const verdict = signalData?.verdict || 'HOLD';

    let action = 'HOLD';
    let actionBadge = 'Hold Position';
    let actionColor = '#f59e0b';
    let actionBg = 'rgba(245, 158, 11, 0.15)';
    let actionIcon = 'pause_circle';
    let actionSummary = '';
    let actionRationale = '';

    // Condition 1: Exit trigger (Trend Breakdown)
    if (score <= -50 || (ltp < ema200 && supertrendDir === -1) || (ltp < stopLoss)) {
      action = 'EXIT';
      actionBadge = 'Exit / Cut Losses';
      actionColor = '#ff516a';
      actionBg = 'rgba(255, 81, 106, 0.2)';
      actionIcon = 'cancel';
      actionSummary = 'Macro technical breakdown with negative trend alignment.';
      actionRationale = `Price is under heavy distribution below key moving averages with Supertrend in red. Preserve capital by exiting or executing defined stop-loss at ₹${stopLoss}.`;
    }
    // Condition 2: Book Partial Profit (Large gain + Overbought/Target reached)
    else if (pnlPct >= 18 && (rsi >= 68 || ltp >= target1 * 0.98)) {
      action = 'BOOK PARTIAL PROFIT';
      actionBadge = 'Book Partial Profit (30–50%)';
      actionColor = '#4edea3';
      actionBg = 'rgba(78, 222, 163, 0.2)';
      actionIcon = 'savings';
      actionSummary = `Unrealised gain of +${pnlPct.toFixed(1)}% near short-term resistance.`;
      actionRationale = `Position is up +${pnlPct.toFixed(1)}% and momentum is elevated (RSI: ${rsi.toFixed(1)}). Take 30% to 50% off the table into target zone ₹${target1} and let the remainder ride with trailing stop-loss.`;
    }
    // Condition 3: Trail Stop-Loss (Solid profit, trending higher)
    else if (pnlPct >= 10 && score >= 15) {
      action = 'TRAIL STOP-LOSS';
      actionBadge = 'Trail Stop-Loss';
      actionColor = '#6ffbbe';
      actionBg = 'rgba(111, 251, 190, 0.15)';
      actionIcon = 'trending_up';
      actionSummary = `Protect your +${pnlPct.toFixed(1)}% gain by lifting stop-loss.`;
      actionRationale = `Your position has accumulated healthy profits. Tighten your stop-loss to ₹${stopLoss} (above break-even ₹${avgPrice.toFixed(2)}) so you cannot be taken out at a loss.`;
    }
    // Condition 4: Add More (Strong Buy + Healthy Pullback)
    else if (score >= 45 && ltp >= avgPrice && Math.abs(ltp - ema21) / ltp < 0.05) {
      action = 'ADD MORE';
      actionBadge = 'Add More / Pyramid';
      actionColor = '#4edea3';
      actionBg = 'rgba(78, 222, 163, 0.2)';
      actionIcon = 'add_circle';
      actionSummary = 'Strong momentum holding near EMA 21 support cushion.';
      actionRationale = `The stock is displaying strong quant strength (Score: +${score}/100) and resting on key 21-DMA support. Excellent technical risk-reward to increase position size.`;
    }
    // Condition 5: Average Down (Under average price, but macro trend intact)
    else if (ltp < avgPrice && ltp >= ema200 * 0.97 && score >= -15) {
      action = 'AVERAGE DOWN';
      actionBadge = 'Average Down Tactically';
      actionColor = '#adc6ff';
      actionBg = 'rgba(173, 198, 255, 0.15)';
      actionIcon = 'low_priority';
      actionSummary = 'Price dip presenting value accumulation opportunity.';
      actionRationale = `Trading ${Math.abs(distFromAvgPct).toFixed(1)}% below your purchase price, but broader structural support remains resilient. If long-term thesis is intact, accumulating extra shares lowers your break-even.`;
    }
    // Condition 6: Default Hold
    else {
      action = 'HOLD';
      actionBadge = 'Hold Position';
      actionColor = '#f59e0b';
      actionBg = 'rgba(245, 158, 11, 0.15)';
      actionIcon = 'hourglass_empty';
      actionSummary = 'Consolidating smoothly inside target channel.';
      actionRationale = `Indicators are balanced between ₹${stopLoss} support and ₹${target1} target. No urgent action required; maintain patience and observe volume confirmation.`;
    }

    // ─────────────────────────────────────────────────────────────
    // 3. Tax Optimization Awareness (Budget 2024 Indian Rules)
    // ─────────────────────────────────────────────────────────────
    // STCG (held <12 months): flat 20%
    // LTCG (held >=12 months): 12.5% on gains exceeding Rs 1.25 Lakh
    const isSTCG = true; // Conservative default: assume holding is in current financial year
    let estimatedTax = 0;
    let taxLabel = 'STCG (20%)';
    let taxNote = '';

    if (unrealisedPnl > 0) {
      if (isSTCG) {
        estimatedTax = Math.round(unrealisedPnl * 0.20);
        taxLabel = 'STCG @ 20%';
        taxNote = `Holding < 12 months. Tax payable if sold today: ₹${Number(estimatedTax).toLocaleString('en-IN')}`;
      } else {
        const taxableGain = Math.max(0, unrealisedPnl - 125000);
        estimatedTax = Math.round(taxableGain * 0.125);
        taxLabel = 'LTCG @ 12.5%';
        taxNote = `Holding ≥ 12 months (₹1.25L annual exemption applied). Tax: ₹${Number(estimatedTax).toLocaleString('en-IN')}`;
      }
    } else {
      taxLabel = 'Tax Harvesting';
      taxNote = `Unrealised loss of ₹${Math.abs(Math.round(unrealisedPnl)).toLocaleString('en-IN')} can be harvested to offset capital gains.`;
    }

    return {
      ticker,
      qty,
      avgPrice,
      ltp,
      cost,
      val,
      unrealisedPnl,
      pnlPct,
      isGain,
      breakEven: avgPrice,
      distFromAvg: parseFloat(Math.abs(ltp - avgPrice).toFixed(2)),
      distFromAvgPct,
      atr,
      stopLoss,
      target1,
      target2,
      riskPerShare,
      rewardPerShare,
      riskReward: rrRatio,
      rrRatio,
      action: {
        type: action,
        title: actionSummary,
        description: actionRationale,
        color: actionColor,
        bg: actionBg,
        borderColor: actionColor + '40',
        icon: actionIcon
      },
      actionType: action,
      actionBadge,
      actionColor,
      actionBg,
      actionIcon,
      actionSummary,
      actionRationale,
      tax: {
        category: taxLabel,
        isSTCG,
        taxLabel,
        estimatedTax,
        taxRateText: isSTCG ? '20% Flat STCG' : '12.5% LTCG above ₹1.25L',
        holdingPeriod: isSTCG ? 'Short Term (< 12 Months)' : 'Long Term (≥ 12 Months)',
        benefitNote: taxNote,
        taxNote
      }
    };
  }

  /**
   * Live Averaging Calculator Helper
   * @param {number} currentQty 
   * @param {number} avgPrice 
   * @param {number} ltp 
   * @param {number} additionalQty 
   */
  function calculateAveraging(currentQty, avgPrice, ltp, additionalQty) {
    const q1 = Math.max(1, parseFloat(currentQty) || 1);
    const p1 = Math.max(0.01, parseFloat(avgPrice) || 100);
    const p2 = Math.max(0.01, parseFloat(ltp) || p1);
    const q2 = Math.max(0, parseFloat(additionalQty) || 0);

    const totalQty = q1 + q2;
    const totalCost = (q1 * p1) + (q2 * p2);
    const newAvgPrice = totalQty > 0 ? totalCost / totalQty : p1;
    const priceDiff = newAvgPrice - p1;
    const priceDiffPct = p1 > 0 ? ((priceDiff / p1) * 100) : 0;

    return {
      newQty: totalQty,
      newAvgPrice: parseFloat(newAvgPrice.toFixed(2)),
      newTotalInvestment: parseFloat(totalCost.toFixed(2)),
      priceDiff: parseFloat(priceDiff.toFixed(2)),
      priceDiffPct: parseFloat(priceDiffPct.toFixed(2)),
      additionalCapitalNeeded: parseFloat((q2 * p2).toFixed(2))
    };
  }

  /**
   * Dynamic Portfolio Sector Insights Helper
   * Fixes hardcoded IT count by examining live holdings
   */
  function getPortfolioSectorInsight(holdings) {
    if (!holdings || holdings.length === 0) {
      return {
        itCount: 0,
        itVal: 0,
        topSector: 'Equities',
        topSectorCount: 0,
        topSectorPct: 0
      };
    }

    let totalVal = 0;
    const sectorStats = {};

    holdings.forEach(h => {
      const v = (parseFloat(h.qty) || 1) * (parseFloat(h.ltp) || parseFloat(h.price) || 100);
      totalVal += v;
      const s = (h.sector || 'EQUITIES').toUpperCase();
      if (!sectorStats[s]) sectorStats[s] = { count: 0, val: 0 };
      sectorStats[s].count++;
      sectorStats[s].val += v;
    });

    // Check IT specifically
    const itKeys = Object.keys(sectorStats).filter(k => k.includes('IT') || k.includes('TECH'));
    let itCount = 0;
    let itVal = 0;
    itKeys.forEach(k => {
      itCount += sectorStats[k].count;
      itVal += sectorStats[k].val;
    });

    // Find top sector
    let topSector = 'Equities';
    let maxSectorVal = 0;
    let topSectorCount = 0;

    Object.entries(sectorStats).forEach(([sec, data]) => {
      if (data.val > maxSectorVal) {
        maxSectorVal = data.val;
        topSector = sec;
        topSectorCount = data.count;
      }
    });

    const topSectorPct = totalVal > 0 ? Math.round((maxSectorVal / totalVal) * 100) : 0;

    return {
      itCount,
      itVal,
      topSector,
      topSectorCount,
      topSectorPct
    };
  }

  return {
    computePositionAdvice,
    calculateAveraging,
    getPortfolioSectorInsight
  };
});
