// ============================================================
//  js/backtest.js — SaarthiX 2-Year Strategy Backtest Engine
//  Tests EMA 21/50 + RSI Filter + Supertrend Strategy vs Buy & Hold
// ============================================================
'use strict';

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BacktestEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  /**
   * Run 2-Year Quantitative Backtest
   * @param {Array<{time:string, open:number, high:number, low:number, close:number, volume:number}>} candles 
   * @param {Object} technicalData 
   * @returns {Object} Backtest Results Package
   */
  function runStrategyBacktest(candles, technicalData) {
    if (!candles || candles.length < 50 || !technicalData) {
      return getEmptyBacktest();
    }

    const indicators = (technicalData && technicalData.indicators) ? technicalData.indicators : technicalData;
    if (!indicators || !indicators.ema21 || !indicators.ema50) {
      return getEmptyBacktest();
    }
    const n = candles.length;
    const initialCapital = 100000;
    let capital = initialCapital;

    let inPosition = false;
    let entryPrice = 0;
    let entryDate = '';
    let entryIndex = 0;
    let shares = 0;

    const trades = [];
    const equityCurve = [{ time: candles[0].time, value: initialCapital }];

    let peakCapital = initialCapital;
    let maxDrawdown = 0;

    const ema21 = indicators.ema21;
    const ema50 = indicators.ema50;
    const rsi = indicators.rsi;
    const supertrend = indicators.supertrend;

    // Start evaluation from candle 50
    for (let i = 50; i < n; i++) {
      const c = candles[i];
      const prevC = candles[i - 1];

      const e21Current = ema21[i];
      const e21Prev = ema21[i - 1];
      const e50Current = ema50[i];
      const e50Prev = ema50[i - 1];
      const rsiVal = rsi[i];
      const stDir = supertrend?.direction ? supertrend.direction[i] : 1;
      const stLine = supertrend?.supertrend ? supertrend.supertrend[i] : c.close * 0.95;

      // Current portfolio mark-to-market
      const currentEquity = inPosition ? shares * c.close : capital;
      if (currentEquity > peakCapital) peakCapital = currentEquity;
      const dd = peakCapital > 0 ? ((peakCapital - currentEquity) / peakCapital) * 100 : 0;
      if (dd > maxDrawdown) maxDrawdown = dd;

      equityCurve.push({ time: c.time, value: parseFloat(currentEquity.toFixed(2)) });

      // ── Entry Conditions ──────────────────────────────────────
      // 1. EMA 21 crosses above EMA 50 (or is sustained above)
      // 2. RSI filter: between 42 and 66 (not overbought)
      // 3. Supertrend is Bullish (1)
      const emaBullCross = e21Prev <= e50Prev && e21Current > e50Current;
      const trendAligned = e21Current > e50Current && c.close > e21Current;
      const rsiAllowed = rsiVal !== null && rsiVal >= 42 && rsiVal <= 67;
      const stBullish = stDir === 1;

      if (!inPosition && (emaBullCross || (trendAligned && rsiVal >= 48)) && rsiAllowed && stBullish) {
        entryPrice = c.close;
        entryDate = c.time;
        entryIndex = i;
        shares = Math.floor(capital / entryPrice);
        if (shares > 0) {
          capital -= (shares * entryPrice);
          inPosition = true;
        }
      }

      // ── Exit Conditions ───────────────────────────────────────
      // 1. Supertrend flips to Bearish (-1)
      // 2. OR EMA 21 crosses below EMA 50
      // 3. OR Trailing Stop Loss hit (below Supertrend line or 6% loss)
      else if (inPosition) {
        const emaBearCross = e21Prev >= e50Prev && e21Current < e50Current;
        const stFlippedBear = stDir === -1;
        const stopHit = c.close < stLine || c.close < (entryPrice * 0.93);

        if (stFlippedBear || emaBearCross || stopHit || i === n - 1) {
          const exitPrice = c.close;
          const exitVal = shares * exitPrice;
          const tradePnl = exitVal - (shares * entryPrice);
          const tradePnlPct = ((exitPrice - entryPrice) / entryPrice) * 100;

          capital += exitVal;
          inPosition = false;

          trades.push({
            entryDate,
            exitDate: c.time,
            entryPrice,
            exitPrice,
            shares,
            pnl: parseFloat(tradePnl.toFixed(2)),
            pnlPct: parseFloat(tradePnlPct.toFixed(2)),
            holdingDays: i - entryIndex,
            isWin: tradePnl > 0
          });

          shares = 0;
        }
      }
    }

    // Final mark-to-market if still holding
    const finalCapital = inPosition ? capital + (shares * candles[n - 1].close) : capital;
    const strategyReturn = parseFloat((((finalCapital - initialCapital) / initialCapital) * 100).toFixed(2));

    // Benchmark: Buy & Hold
    const startPrice = candles[50].close;
    const endPrice = candles[n - 1].close;
    const buyHoldReturn = parseFloat((((endPrice - startPrice) / startPrice) * 100).toFixed(2));

    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => t.isWin).length;
    const losingTrades = totalTrades - winningTrades;
    const winRate = totalTrades > 0 ? parseFloat(((winningTrades / totalTrades) * 100).toFixed(1)) : 0;

    const grossProfit = trades.filter(t => t.isWin).reduce((a, b) => a + b.pnl, 0);
    const grossLoss = Math.abs(trades.filter(t => !t.isWin).reduce((a, b) => a + b.pnl, 0));
    const profitFactor = grossLoss > 0 ? parseFloat((grossProfit / grossLoss).toFixed(2)) : (grossProfit > 0 ? 9.99 : 1.0);

    return {
      initialCapital,
      finalCapital: parseFloat(finalCapital.toFixed(2)),
      strategyReturn,
      totalReturnPct: strategyReturn,
      buyHoldReturn,
      buyAndHoldReturnPct: buyHoldReturn,
      alpha: parseFloat((strategyReturn - buyHoldReturn).toFixed(2)),
      winRate,
      totalTrades,
      winningTrades,
      losingTrades,
      profitFactor,
      maxDrawdown: parseFloat(maxDrawdown.toFixed(1)),
      maxDrawdownPct: parseFloat(maxDrawdown.toFixed(1)),
      trades: trades.slice(-8), // last 8 trades
      equityCurve
    };
  }

  function getEmptyBacktest() {
    return {
      initialCapital: 100000,
      finalCapital: 100000,
      strategyReturn: 0,
      totalReturnPct: 0,
      buyHoldReturn: 0,
      buyAndHoldReturnPct: 0,
      alpha: 0,
      winRate: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      profitFactor: 1.0,
      maxDrawdown: 0,
      maxDrawdownPct: 0,
      trades: [],
      equityCurve: []
    };
  }

  /**
   * Render SVG Sparkline of Equity Curve
   */
  function renderEquitySparklineSVG(equityCurve, width = 360, height = 90) {
    if (!equityCurve || equityCurve.length < 2) {
      return `<svg width="${width}" height="${height}" class="w-full text-white/30"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="currentColor" font-size="11">Insufficient Backtest Curve</text></svg>`;
    }

    const values = equityCurve.map(pt => pt.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const padTop = 10;
    const padBottom = 15;
    const chartH = height - padTop - padBottom;

    const points = values.map((val, idx) => {
      const x = (idx / (values.length - 1)) * width;
      const y = padTop + (1 - (val - min) / range) * chartH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const lastVal = values[values.length - 1];
    const isProfit = lastVal >= equityCurve[0].value;
    const strokeColor = isProfit ? '#4edea3' : '#ff516a';
    const fillColor = isProfit ? 'rgba(78, 222, 163, 0.12)' : 'rgba(255, 81, 106, 0.12)';

    const firstPt = points.split(' ')[0];
    const lastPt = points.split(' ').slice(-1)[0];
    const areaPoints = `${firstPt} ${points} ${width},${height} 0,${height}`;

    return `
      <svg viewBox="0 0 ${width} ${height}" class="w-full overflow-hidden" preserveAspectRatio="none">
        <defs>
          <linearGradient id="eqGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        <polygon points="${areaPoints}" fill="url(#eqGrad)" />
        <polyline fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${points}" />
      </svg>
    `;
  }

  return {
    runStrategyBacktest,
    renderEquitySparklineSVG
  };
});
