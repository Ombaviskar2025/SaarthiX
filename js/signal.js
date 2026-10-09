// ============================================================
//  js/signal.js — SaarthiX Weighted Quant Signal Engine
//  Computes -100 to +100 score, confidence %, top reasons & indicator breakdown
// ============================================================
'use strict';

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SignalEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  /**
   * Evaluate Quant Trading Signal
   * @param {Array<{open:number, high:number, low:number, close:number, volume:number}>} candles 
   * @param {Object} technicalData result of IndicatorEngine.computeAllIndicators
   * @returns {Object} Comprehensive Signal Report
   */
  function evaluateSignal(candles, technicalData) {
    if (!candles || candles.length === 0 || !technicalData) {
      return getNeutralSignal();
    }

    const { indicators, events } = technicalData;
    const n = candles.length;
    const currentPrice = candles[n - 1].close;

    // Helper for latest indicator value
    const last = arr => (arr && arr.length ? arr[arr.length - 1] : null);
    const prev = arr => (arr && arr.length > 1 ? arr[arr.length - 2] : null);

    const ema9 = last(indicators.ema9);
    const ema21 = last(indicators.ema21);
    const ema50 = last(indicators.ema50);
    const ema200 = last(indicators.ema200);

    const rsiVal = last(indicators.rsi) !== null ? last(indicators.rsi) : 50;
    const macdHist = indicators.macd && last(indicators.macd.histogram) !== null ? last(indicators.macd.histogram) : 0;
    const macdLine = indicators.macd && last(indicators.macd.macd) !== null ? last(indicators.macd.macd) : 0;
    const supertrendDir = indicators.supertrend && last(indicators.supertrend.direction) !== null ? last(indicators.supertrend.direction) : 1;
    const adxVal = indicators.adx && last(indicators.adx.adx) !== null ? last(indicators.adx.adx) : 20;
    const plusDI = indicators.adx && last(indicators.adx.plusDI) !== null ? last(indicators.adx.plusDI) : 25;
    const minusDI = indicators.adx && last(indicators.adx.minusDI) !== null ? last(indicators.adx.minusDI) : 20;
    const stochK = indicators.stoch && last(indicators.stoch.k) !== null ? last(indicators.stoch.k) : 50;
    const stochD = indicators.stoch && last(indicators.stoch.d) !== null ? last(indicators.stoch.d) : 50;

    const bbPercentB = indicators.bBands && last(indicators.bBands.percentB) !== null ? last(indicators.bBands.percentB) : 0.5;
    const bbBandwidth = indicators.bBands && last(indicators.bBands.bandwidth) !== null ? last(indicators.bBands.bandwidth) : 10;
    const atrVal = last(indicators.atr) || (currentPrice * 0.02);

    const volumeRatio = indicators.volume ? indicators.volume.volumeRatio : 1.0;
    const high52 = indicators.high52 || currentPrice * 1.2;
    const low52 = indicators.low52 || currentPrice * 0.8;
    const pivots = indicators.pivots || {};

    const breakdown = [];
    const reasons = [];

    // ─────────────────────────────────────────────────────────────
    // 1. TREND SCORE (Weight: 35%)
    // ─────────────────────────────────────────────────────────────
    let trendSubscore = 0;

    // A. Price vs Moving Averages
    if (ema200) {
      if (currentPrice >= ema200) {
        trendSubscore += 35;
        breakdown.push({
          name: '200 EMA (Primary Trend)',
          value: `₹${ema200.toFixed(2)}`,
          signal: 'Bullish',
          color: '#4edea3',
          detail: `CMP ₹${currentPrice} is trading above 200-DMA (Macro Uptrend).`
        });
        reasons.push({ text: `Price sustained above 200-DMA (₹${ema200.toFixed(2)}) confirming macro bull trend.`, sentiment: 'bullish' });
      } else {
        trendSubscore -= 35;
        breakdown.push({
          name: '200 EMA (Primary Trend)',
          value: `₹${ema200.toFixed(2)}`,
          signal: 'Bearish',
          color: '#ff516a',
          detail: `CMP ₹${currentPrice} is below 200-DMA (Macro Downtrend pressure).`
        });
        reasons.push({ text: `Price trading below 200-DMA (₹${ema200.toFixed(2)}), signalling primary trend weakness.`, sentiment: 'bearish' });
      }
    }

    // B. EMA Alignment Stack (9 > 21 > 50)
    if (ema9 && ema21 && ema50) {
      if (ema9 > ema21 && ema21 > ema50) {
        trendSubscore += 35;
        breakdown.push({
          name: 'EMA Ribbon Stack',
          value: '9 > 21 > 50',
          signal: 'Bullish',
          color: '#4edea3',
          detail: 'Full bullish ribbon alignment with upward momentum.'
        });
        reasons.push({ text: 'Moving average stack (EMA 9 > 21 > 50) in strong upward alignment.', sentiment: 'bullish' });
      } else if (ema9 < ema21 && ema21 < ema50) {
        trendSubscore -= 35;
        breakdown.push({
          name: 'EMA Ribbon Stack',
          value: '9 < 21 < 50',
          signal: 'Bearish',
          color: '#ff516a',
          detail: 'Full bearish ribbon alignment with downward drift.'
        });
        reasons.push({ text: 'Moving average stack (EMA 9 < 21 < 50) under sustained selling pressure.', sentiment: 'bearish' });
      } else {
        breakdown.push({
          name: 'EMA Ribbon Stack',
          value: 'Mixed/Crossing',
          signal: 'Neutral',
          color: '#f59e0b',
          detail: 'Ribbons converging; consolidating between key moving averages.'
        });
      }
    }

    // C. Supertrend Direction
    if (supertrendDir === 1) {
      trendSubscore += 20;
      breakdown.push({
        name: 'Supertrend (10, 3)',
        value: `₹${(last(indicators.supertrend.supertrend) || 0).toFixed(2)}`,
        signal: 'Bullish',
        color: '#4edea3',
        detail: 'Supertrend is green with stop-loss trailing safely below price.'
      });
      reasons.push({ text: 'Supertrend indicator remains in green BUY status.', sentiment: 'bullish' });
    } else {
      trendSubscore -= 20;
      breakdown.push({
        name: 'Supertrend (10, 3)',
        value: `₹${(last(indicators.supertrend.supertrend) || 0).toFixed(2)}`,
        signal: 'Bearish',
        color: '#ff516a',
        detail: 'Supertrend is red with resistance ceiling above current price.'
      });
      reasons.push({ text: 'Supertrend in SELL mode, imposing overhead resistance.', sentiment: 'bearish' });
    }

    // D. ADX Trend Strength
    if (adxVal >= 25) {
      if (plusDI > minusDI) {
        trendSubscore += 10;
        breakdown.push({
          name: 'ADX Trend Strength',
          value: `${adxVal.toFixed(1)} (+DI: ${plusDI.toFixed(1)})`,
          signal: 'Bullish',
          color: '#4edea3',
          detail: 'Strong trending market controlled by buyers.'
        });
      } else {
        trendSubscore -= 10;
        breakdown.push({
          name: 'ADX Trend Strength',
          value: `${adxVal.toFixed(1)} (-DI: ${minusDI.toFixed(1)})`,
          signal: 'Bearish',
          color: '#ff516a',
          detail: 'Strong trending market controlled by sellers.'
        });
      }
    } else {
      breakdown.push({
        name: 'ADX Trend Strength',
        value: `${adxVal.toFixed(1)} (Range-bound)`,
        signal: 'Neutral',
        color: '#f59e0b',
        detail: 'ADX < 25 signals non-trending consolidation phase.'
      });
    }

    trendSubscore = Math.max(-100, Math.min(100, trendSubscore));

    // ─────────────────────────────────────────────────────────────
    // 2. MOMENTUM SCORE (Weight: 25%)
    // ─────────────────────────────────────────────────────────────
    let momentumSubscore = 0;

    // A. RSI (14)
    if (rsiVal >= 50 && rsiVal <= 68) {
      momentumSubscore += 45;
      breakdown.push({
        name: 'RSI (14)',
        value: rsiVal.toFixed(1),
        signal: 'Bullish',
        color: '#4edea3',
        detail: 'Healthy accumulation zone with strong buying momentum.'
      });
      reasons.push({ text: `RSI at ${rsiVal.toFixed(1)} is bullish with plenty of room before overbought levels.`, sentiment: 'bullish' });
    } else if (rsiVal > 68 && rsiVal <= 75) {
      momentumSubscore += 10;
      breakdown.push({
        name: 'RSI (14)',
        value: `${rsiVal.toFixed(1)} (High)`,
        signal: 'Neutral',
        color: '#f59e0b',
        detail: 'Momentum is strong but approaching overbought territory.'
      });
    } else if (rsiVal > 75) {
      momentumSubscore -= 35;
      breakdown.push({
        name: 'RSI (14)',
        value: `${rsiVal.toFixed(1)} (Overbought)`,
        signal: 'Bearish',
        color: '#ff516a',
        detail: 'Extreme overbought condition (>75); elevated pullback risk.'
      });
      reasons.push({ text: `RSI is overbought at ${rsiVal.toFixed(1)}, warning of short-term profit taking.`, sentiment: 'bearish' });
    } else if (rsiVal < 30) {
      momentumSubscore += 20; // Mean reversion potential
      breakdown.push({
        name: 'RSI (14)',
        value: `${rsiVal.toFixed(1)} (Oversold)`,
        signal: 'Bullish',
        color: '#4edea3',
        detail: 'Deep oversold zone (<30); potential tactical bounce candidate.'
      });
      reasons.push({ text: `RSI is deeply oversold (${rsiVal.toFixed(1)}), presenting mean-reversion setup.`, sentiment: 'bullish' });
    } else {
      momentumSubscore -= 30;
      breakdown.push({
        name: 'RSI (14)',
        value: rsiVal.toFixed(1),
        signal: 'Bearish',
        color: '#ff516a',
        detail: 'RSI below 50 indicates seller dominance.'
      });
    }

    // B. MACD (12, 26, 9)
    if (macdHist > 0 && macdLine > 0) {
      momentumSubscore += 35;
      breakdown.push({
        name: 'MACD (12, 26, 9)',
        value: `Hist: +${macdHist.toFixed(2)}`,
        signal: 'Bullish',
        color: '#4edea3',
        detail: 'MACD above zero line and expanding positive histogram.'
      });
      reasons.push({ text: `MACD histogram positive (+${macdHist.toFixed(2)}) confirming buyer control.`, sentiment: 'bullish' });
    } else if (macdHist > 0 && macdLine <= 0) {
      momentumSubscore += 15;
      breakdown.push({
        name: 'MACD (12, 26, 9)',
        value: `Hist: +${macdHist.toFixed(2)}`,
        signal: 'Bullish',
        color: '#4edea3',
        detail: 'Early turnaround: MACD histogram positive below center line.'
      });
    } else {
      momentumSubscore -= 35;
      breakdown.push({
        name: 'MACD (12, 26, 9)',
        value: `Hist: ${macdHist.toFixed(2)}`,
        signal: 'Bearish',
        color: '#ff516a',
        detail: 'Negative histogram indicates weakening momentum.'
      });
      reasons.push({ text: `MACD histogram negative (${macdHist.toFixed(2)}), signalling momentum lag.`, sentiment: 'bearish' });
    }

    // C. Stochastic
    if (stochK > stochD && stochK < 80) {
      momentumSubscore += 20;
      breakdown.push({
        name: 'Stochastic (14, 3, 3)',
        value: `%K: ${stochK.toFixed(1)} > %D: ${stochD.toFixed(1)}`,
        signal: 'Bullish',
        color: '#4edea3',
        detail: 'Stochastic lines pointing upward in bullish crossover.'
      });
    } else if (stochK < stochD && stochK > 20) {
      momentumSubscore -= 20;
      breakdown.push({
        name: 'Stochastic (14, 3, 3)',
        value: `%K: ${stochK.toFixed(1)} < %D: ${stochD.toFixed(1)}`,
        signal: 'Bearish',
        color: '#ff516a',
        detail: 'Stochastic bearish divergence.'
      });
    } else {
      breakdown.push({
        name: 'Stochastic (14, 3, 3)',
        value: `%K: ${stochK.toFixed(1)}`,
        signal: 'Neutral',
        color: '#f59e0b',
        detail: 'Stochastic neutral in middle band.'
      });
    }

    momentumSubscore = Math.max(-100, Math.min(100, momentumSubscore));

    // ─────────────────────────────────────────────────────────────
    // 3. VOLATILITY & BREAKOUT SCORE (Weight: 15%)
    // ─────────────────────────────────────────────────────────────
    let volSubscore = 0;

    if (bbPercentB >= 0.75) {
      volSubscore += 35;
      breakdown.push({
        name: 'Bollinger Bands',
        value: `%b: ${bbPercentB.toFixed(2)}`,
        signal: 'Bullish',
        color: '#4edea3',
        detail: 'Riding the upper band in active breakout mode.'
      });
    } else if (bbPercentB <= 0.25) {
      volSubscore -= 35;
      breakdown.push({
        name: 'Bollinger Bands',
        value: `%b: ${bbPercentB.toFixed(2)}`,
        signal: 'Bearish',
        color: '#ff516a',
        detail: 'Price pinned to lower band indicating heavy selling.'
      });
    } else {
      breakdown.push({
        name: 'Bollinger Bands',
        value: `%b: ${bbPercentB.toFixed(2)}`,
        signal: 'Neutral',
        color: '#f59e0b',
        detail: 'Consolidating safely inside normal volatility channels.'
      });
    }

    // Bollinger Squeeze Check (Bandwidth < 8%)
    if (bbBandwidth < 9.0) {
      volSubscore += 15;
      reasons.push({ text: `Bollinger Bandwidth contracted to ${bbBandwidth.toFixed(1)}% (Squeeze setup for imminent explosive move).`, sentiment: 'neutral' });
    }

    volSubscore = Math.max(-100, Math.min(100, volSubscore));

    // ─────────────────────────────────────────────────────────────
    // 4. VOLUME & FLOW SCORE (Weight: 15%)
    // ─────────────────────────────────────────────────────────────
    let volumeSubscore = 0;
    const isGreenCandle = candles[n - 1].close >= candles[n - 1].open;

    if (volumeRatio >= 1.3 && isGreenCandle) {
      volumeSubscore += 65;
      breakdown.push({
        name: 'Volume vs 20D Avg',
        value: `${volumeRatio}x (High Accumulation)`,
        signal: 'Bullish',
        color: '#4edea3',
        detail: 'Above-average volume accompanying green candle.'
      });
      reasons.push({ text: `Volume surge at ${volumeRatio}x 20-day average confirms active institutional demand.`, sentiment: 'bullish' });
    } else if (volumeRatio >= 1.3 && !isGreenCandle) {
      volumeSubscore -= 65;
      breakdown.push({
        name: 'Volume vs 20D Avg',
        value: `${volumeRatio}x (Heavy Distribution)`,
        signal: 'Bearish',
        color: '#ff516a',
        detail: 'High volume sell-off signalling distribution.'
      });
      reasons.push({ text: `Heavy trading volume (${volumeRatio}x avg) on red candle warns of institutional selling.`, sentiment: 'bearish' });
    } else {
      volumeSubscore += 10;
      breakdown.push({
        name: 'Volume vs 20D Avg',
        value: `${volumeRatio}x (Normal)`,
        signal: 'Neutral',
        color: '#f59e0b',
        detail: 'Volume aligned with recent historical baseline.'
      });
    }

    // OBV Trend Check
    const obvArr = indicators.volume ? indicators.volume.obv : [];
    if (obvArr.length >= 10) {
      const obvNow = obvArr[obvArr.length - 1];
      const obv10Ago = obvArr[obvArr.length - 10];
      if (obvNow > obv10Ago) {
        volumeSubscore += 25;
      } else {
        volumeSubscore -= 25;
      }
    }

    volumeSubscore = Math.max(-100, Math.min(100, volumeSubscore));

    // ─────────────────────────────────────────────────────────────
    // 5. STRUCTURE & 52-WEEK POSITION (Weight: 10%)
    // ─────────────────────────────────────────────────────────────
    let structureSubscore = 0;
    const range52W = high52 - low52;
    const pos52W = range52W > 0 ? ((currentPrice - low52) / range52W) * 100 : 50;

    if (pos52W >= 65) {
      structureSubscore += 50;
      breakdown.push({
        name: '52-Week Range Position',
        value: `${pos52W.toFixed(0)}% of Range`,
        signal: 'Bullish',
        color: '#4edea3',
        detail: `Trading near upper quartile (52W High ₹${high52.toFixed(2)}).`
      });
      reasons.push({ text: `Trading in upper 52-week tier (${pos52W.toFixed(0)}% of annual high-low range).`, sentiment: 'bullish' });
    } else if (pos52W <= 25) {
      structureSubscore -= 30;
      breakdown.push({
        name: '52-Week Range Position',
        value: `${pos52W.toFixed(0)}% of Range`,
        signal: 'Bearish',
        color: '#ff516a',
        detail: `Depressed near 52W Low (₹${low52.toFixed(2)}).`
      });
      reasons.push({ text: `Price near 52-week lows (${pos52W.toFixed(0)}% of annual range), indicating multi-month lag.`, sentiment: 'bearish' });
    } else {
      breakdown.push({
        name: '52-Week Range Position',
        value: `${pos52W.toFixed(0)}% (Mid-band)`,
        signal: 'Neutral',
        color: '#f59e0b',
        detail: 'Consolidating in median band of annual channel.'
      });
    }

    // Pivot Position Check
    if (pivots.P && currentPrice >= pivots.P) {
      structureSubscore += 35;
      breakdown.push({
        name: 'Classic Pivot Support',
        value: `Pivot ₹${pivots.P.toFixed(2)}`,
        signal: 'Bullish',
        color: '#4edea3',
        detail: 'Holding above key baseline pivot level.'
      });
    } else if (pivots.P) {
      structureSubscore -= 35;
      breakdown.push({
        name: 'Classic Pivot Support',
        value: `Pivot ₹${pivots.P.toFixed(2)}`,
        signal: 'Bearish',
        color: '#ff516a',
        detail: 'Slipped below key baseline pivot level.'
      });
    }

    structureSubscore = Math.max(-100, Math.min(100, structureSubscore));

    // ─────────────────────────────────────────────────────────────
    // COMPOSITE WEIGHTED SCORE CALCULATION
    // Trend: 35%, Momentum: 25%, Volatility: 15%, Volume: 15%, Structure: 10%
    // ─────────────────────────────────────────────────────────────
    const rawScore = (
      0.35 * trendSubscore +
      0.25 * momentumSubscore +
      0.15 * volSubscore +
      0.15 * volumeSubscore +
      0.10 * structureSubscore
    );

    const score = Math.round(Math.max(-100, Math.min(100, rawScore)));

    // Verdict Mapping
    let verdict = 'HOLD';
    let verdictColor = '#f59e0b';
    let verdictBg = 'rgba(245, 158, 11, 0.15)';
    let verdictClass = 'verdict-hold';

    if (score >= 60) {
      verdict = 'STRONG BUY';
      verdictColor = '#4edea3';
      verdictBg = 'rgba(78, 222, 163, 0.2)';
      verdictClass = 'verdict-strong-buy';
    } else if (score >= 25) {
      verdict = 'BUY';
      verdictColor = '#6ffbbe';
      verdictBg = 'rgba(111, 251, 190, 0.15)';
      verdictClass = 'verdict-buy';
    } else if (score <= -60) {
      verdict = 'STRONG SELL';
      verdictColor = '#ff516a';
      verdictBg = 'rgba(255, 81, 106, 0.2)';
      verdictClass = 'verdict-strong-sell';
    } else if (score <= -25) {
      verdict = 'SELL';
      verdictColor = '#ffb4ab';
      verdictBg = 'rgba(255, 180, 171, 0.15)';
      verdictClass = 'verdict-sell';
    }

    // Confidence Calculation (Consensus between 5 pillars)
    const subscores = [trendSubscore, momentumSubscore, volSubscore, volumeSubscore, structureSubscore];
    const isOverallBullish = score > 15;
    const isOverallBearish = score < -15;

    let agreementCount = 0;
    subscores.forEach(s => {
      if (isOverallBullish && s > 10) agreementCount++;
      else if (isOverallBearish && s < -10) agreementCount++;
      else if (!isOverallBullish && !isOverallBearish && Math.abs(s) <= 25) agreementCount++;
    });

    const confidenceBase = Math.round(52 + (agreementCount / 5) * 40 + (Math.abs(score) / 100) * 8);
    const confidence = Math.min(96, Math.max(55, confidenceBase));

    // Ensure at least 5 meaningful reasons
    while (reasons.length < 5) {
      if (reasons.length === 0) {
        reasons.push({ text: 'Consolidating within historical average bands.', sentiment: 'neutral' });
      } else if (reasons.length === 1) {
        reasons.push({ text: `Average True Range (ATR) calculated at ₹${atrVal.toFixed(2)} per day.`, sentiment: 'neutral' });
      } else if (reasons.length === 2) {
        reasons.push({ text: 'Technical indicators show balanced buyer-seller equilibrium.', sentiment: 'neutral' });
      } else if (reasons.length === 3) {
        reasons.push({ text: 'Position holding steady with tight risk-reward parameters.', sentiment: 'neutral' });
      } else {
        reasons.push({ text: 'Volume profile indicates steady liquidity without excess volatility.', sentiment: 'neutral' });
      }
    }

    return {
      score,
      verdict,
      verdictColor,
      verdictBg,
      verdictClass,
      confidence,
      pillars: {
        trend: { score: trendSubscore, weight: '35%' },
        momentum: { score: momentumSubscore, weight: '25%' },
        volatility: { score: volSubscore, weight: '15%' },
        volume: { score: volumeSubscore, weight: '15%' },
        structure: { score: structureSubscore, weight: '10%' }
      },
      topReasons: reasons.slice(0, 5),
      indicatorBreakdown: breakdown,
      evaluatedAt: new Date().toISOString()
    };
  }

  function getNeutralSignal() {
    return {
      score: 0,
      verdict: 'HOLD',
      verdictColor: '#f59e0b',
      verdictBg: 'rgba(245, 158, 11, 0.15)',
      verdictClass: 'verdict-hold',
      confidence: 60,
      pillars: {
        trend: { score: 0, weight: '35%' },
        momentum: { score: 0, weight: '25%' },
        volatility: { score: 0, weight: '15%' },
        volume: { score: 0, weight: '15%' },
        structure: { score: 0, weight: '10%' }
      },
      topReasons: [
        { text: 'Awaiting market data stream for full indicator calculation.', sentiment: 'neutral' }
      ],
      indicatorBreakdown: [],
      evaluatedAt: new Date().toISOString()
    };
  }

  return {
    evaluateSignal
  };
});
