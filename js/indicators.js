// ============================================================
//  js/indicators.js — SaarthiX Pure JS Quant Indicator Engine
//  Unit-testable, handles short history, zero divide & NaN edge cases.
// ============================================================
'use strict';

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.IndicatorEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  /**
   * Simple Moving Average (SMA)
   * @param {number[]} data 
   * @param {number} period 
   * @returns {(number|null)[]} array matching input length
   */
  function calculateSMA(data, period) {
    if (!data || data.length === 0 || period <= 0) return [];
    const result = new Array(data.length).fill(null);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
      if (i >= period) {
        sum -= data[i - period];
      }
      if (i >= period - 1) {
        result[i] = parseFloat((sum / period).toFixed(2));
      }
    }
    return result;
  }

  /**
   * Exponential Moving Average (EMA)
   * @param {number[]} data 
   * @param {number} period 
   * @returns {(number|null)[]} array matching input length
   */
  function calculateEMA(data, period) {
    if (!data || data.length === 0 || period <= 0) return [];
    const result = new Array(data.length).fill(null);
    if (data.length < period) return result;

    const k = 2 / (period + 1);
    // Initial SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[i];
    }
    let prevEMA = sum / period;
    result[period - 1] = parseFloat(prevEMA.toFixed(2));

    for (let i = period; i < data.length; i++) {
      const currentEMA = (data[i] - prevEMA) * k + prevEMA;
      result[i] = parseFloat(currentEMA.toFixed(2));
      prevEMA = currentEMA;
    }
    return result;
  }

  /**
   * Relative Strength Index (RSI - Wilder's smoothing)
   * @param {number[]} closes 
   * @param {number} period 
   * @returns {(number|null)[]}
   */
  function calculateRSI(closes, period = 14) {
    if (!closes || closes.length <= period) return new Array(closes ? closes.length : 0).fill(null);
    const result = new Array(closes.length).fill(null);

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff >= 0) gains += diff;
      else losses += Math.abs(diff);
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    if (avgLoss === 0) {
      result[period] = 100.00;
    } else {
      const rs = avgGain / avgLoss;
      result[period] = parseFloat((100 - (100 / (1 + rs))).toFixed(2));
    }

    for (let i = period + 1; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? Math.abs(diff) : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      if (avgLoss === 0) {
        result[i] = 100.00;
      } else {
        const rs = avgGain / avgLoss;
        result[i] = parseFloat((100 - (100 / (1 + rs))).toFixed(2));
      }
    }
    return result;
  }

  /**
   * MACD (12, 26, 9)
   * @param {number[]} closes 
   * @param {number} fastPeriod 
   * @param {number} slowPeriod 
   * @param {number} signalPeriod 
   */
  function calculateMACD(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const len = closes ? closes.length : 0;
    const nullArr = () => new Array(len).fill(null);
    if (len < slowPeriod) {
      return { macd: nullArr(), signal: nullArr(), histogram: nullArr() };
    }

    const fastEMA = calculateEMA(closes, fastPeriod);
    const slowEMA = calculateEMA(closes, slowPeriod);

    const macdLine = new Array(len).fill(null);
    const validMacdValues = [];
    const validIndices = [];

    for (let i = 0; i < len; i++) {
      if (fastEMA[i] !== null && slowEMA[i] !== null) {
        const val = parseFloat((fastEMA[i] - slowEMA[i]).toFixed(2));
        macdLine[i] = val;
        validMacdValues.push(val);
        validIndices.push(i);
      }
    }

    const signalOnValid = calculateEMA(validMacdValues, signalPeriod);
    const signalLine = new Array(len).fill(null);
    const histogram = new Array(len).fill(null);

    for (let j = 0; j < validIndices.length; j++) {
      const origIdx = validIndices[j];
      const sigVal = signalOnValid[j];
      if (sigVal !== null) {
        signalLine[origIdx] = sigVal;
        histogram[origIdx] = parseFloat((macdLine[origIdx] - sigVal).toFixed(2));
      }
    }

    return { macd: macdLine, signal: signalLine, histogram };
  }

  /**
   * Bollinger Bands (20, 2)
   * @param {number[]} closes 
   * @param {number} period 
   * @param {number} mult 
   */
  function calculateBollingerBands(closes, period = 20, mult = 2) {
    const len = closes ? closes.length : 0;
    const upper = new Array(len).fill(null);
    const middle = new Array(len).fill(null);
    const lower = new Array(len).fill(null);
    const bandwidth = new Array(len).fill(null);
    const percentB = new Array(len).fill(null);

    if (len < period) {
      return { upper, middle, lower, bandwidth, percentB };
    }

    const sma = calculateSMA(closes, period);

    for (let i = period - 1; i < len; i++) {
      const m = sma[i];
      if (m === null) continue;

      let sumSqDiff = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sumSqDiff += Math.pow(closes[j] - m, 2);
      }
      const sd = Math.sqrt(sumSqDiff / period);
      const u = parseFloat((m + mult * sd).toFixed(2));
      const l = parseFloat((m - mult * sd).toFixed(2));
      const bw = m !== 0 ? parseFloat((((u - l) / m) * 100).toFixed(2)) : 0;
      const pb = (u - l) !== 0 ? parseFloat(((closes[i] - l) / (u - l)).toFixed(3)) : 0.5;

      middle[i] = m;
      upper[i] = u;
      lower[i] = l;
      bandwidth[i] = bw;
      percentB[i] = pb;
    }

    return { upper, middle, lower, bandwidth, percentB };
  }

  /**
   * Average True Range (ATR 14)
   * @param {Array<{high:number, low:number, close:number}>} candles 
   * @param {number} period 
   */
  function calculateATR(candles, period = 14) {
    const len = candles ? candles.length : 0;
    const result = new Array(len).fill(null);
    if (len < 2) return result;

    const tr = [candles[0].high - candles[0].low];
    for (let i = 1; i < len; i++) {
      const h = candles[i].high;
      const l = candles[i].low;
      const prevC = candles[i - 1].close;
      const trueRange = Math.max(h - l, Math.abs(h - prevC), Math.abs(l - prevC));
      tr.push(trueRange);
    }

    if (len < period) return result;

    // First ATR is simple average of TR
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += tr[i];
    }
    let prevATR = sum / period;
    result[period - 1] = parseFloat(prevATR.toFixed(2));

    for (let i = period; i < len; i++) {
      const currentATR = (prevATR * (period - 1) + tr[i]) / period;
      result[i] = parseFloat(currentATR.toFixed(2));
      prevATR = currentATR;
    }

    return result;
  }

  /**
   * Average Directional Index (ADX 14) with +DI / -DI
   */
  function calculateADX(candles, period = 14) {
    const len = candles ? candles.length : 0;
    const adx = new Array(len).fill(null);
    const plusDI = new Array(len).fill(null);
    const minusDI = new Array(len).fill(null);

    if (len <= period * 2) {
      return { adx, plusDI, minusDI };
    }

    const tr = [0];
    const plusDM = [0];
    const minusDM = [0];

    for (let i = 1; i < len; i++) {
      const h = candles[i].high;
      const l = candles[i].low;
      const prevH = candles[i - 1].high;
      const prevL = candles[i - 1].low;
      const prevC = candles[i - 1].close;

      const currentTR = Math.max(h - l, Math.abs(h - prevC), Math.abs(l - prevC));
      const upMove = h - prevH;
      const downMove = prevL - l;

      let pDM = 0;
      let mDM = 0;
      if (upMove > downMove && upMove > 0) pDM = upMove;
      if (downMove > upMove && downMove > 0) mDM = downMove;

      tr.push(currentTR);
      plusDM.push(pDM);
      minusDM.push(mDM);
    }

    // Initial smoothed values
    let trSmoothed = 0;
    let plusDMSmoothed = 0;
    let minusDMSmoothed = 0;

    for (let i = 1; i <= period; i++) {
      trSmoothed += tr[i];
      plusDMSmoothed += plusDM[i];
      minusDMSmoothed += minusDM[i];
    }

    const dxList = [];
    const dxIndices = [];

    let pDI = trSmoothed === 0 ? 0 : parseFloat(((plusDMSmoothed / trSmoothed) * 100).toFixed(2));
    let mDI = trSmoothed === 0 ? 0 : parseFloat(((minusDMSmoothed / trSmoothed) * 100).toFixed(2));
    plusDI[period] = pDI;
    minusDI[period] = mDI;

    const diSum = pDI + mDI;
    const initialDX = diSum === 0 ? 0 : (Math.abs(pDI - mDI) / diSum) * 100;
    dxList.push(initialDX);
    dxIndices.push(period);

    for (let i = period + 1; i < len; i++) {
      trSmoothed = trSmoothed - (trSmoothed / period) + tr[i];
      plusDMSmoothed = plusDMSmoothed - (plusDMSmoothed / period) + plusDM[i];
      minusDMSmoothed = minusDMSmoothed - (minusDMSmoothed / period) + minusDM[i];

      pDI = trSmoothed === 0 ? 0 : parseFloat(((plusDMSmoothed / trSmoothed) * 100).toFixed(2));
      mDI = trSmoothed === 0 ? 0 : parseFloat(((minusDMSmoothed / trSmoothed) * 100).toFixed(2));
      plusDI[i] = pDI;
      minusDI[i] = mDI;

      const currentDISum = pDI + mDI;
      const currentDX = currentDISum === 0 ? 0 : (Math.abs(pDI - mDI) / currentDISum) * 100;
      dxList.push(currentDX);
      dxIndices.push(i);
    }

    if (dxList.length >= period) {
      let adxSum = 0;
      for (let i = 0; i < period; i++) {
        adxSum += dxList[i];
      }
      let currentADX = adxSum / period;
      adx[dxIndices[period - 1]] = parseFloat(currentADX.toFixed(2));

      for (let i = period; i < dxList.length; i++) {
        currentADX = (currentADX * (period - 1) + dxList[i]) / period;
        adx[dxIndices[i]] = parseFloat(currentADX.toFixed(2));
      }
    }

    return { adx, plusDI, minusDI };
  }

  /**
   * Supertrend (10, 3)
   * @param {Array<{high:number, low:number, close:number}>} candles 
   * @param {number} period 
   * @param {number} mult 
   * @returns {{ supertrend: (number|null)[], direction: (number|null)[] }} 1 = Bullish, -1 = Bearish
   */
  function calculateSupertrend(candles, period = 10, mult = 3) {
    const len = candles ? candles.length : 0;
    const supertrend = new Array(len).fill(null);
    const direction = new Array(len).fill(null); // 1 = bullish, -1 = bearish

    if (len < period + 1) {
      return { supertrend, direction };
    }

    const atr = calculateATR(candles, period);

    const basicUpper = [];
    const basicLower = [];

    for (let i = 0; i < len; i++) {
      const hl2 = (candles[i].high + candles[i].low) / 2;
      const a = atr[i] || 0;
      basicUpper.push(parseFloat((hl2 + mult * a).toFixed(2)));
      basicLower.push(parseFloat((hl2 - mult * a).toFixed(2)));
    }

    const finalUpper = new Array(len).fill(0);
    const finalLower = new Array(len).fill(0);

    finalUpper[period - 1] = basicUpper[period - 1];
    finalLower[period - 1] = basicLower[period - 1];

    let currentDir = 1;
    supertrend[period - 1] = finalLower[period - 1];
    direction[period - 1] = 1;

    for (let i = period; i < len; i++) {
      const prevClose = candles[i - 1].close;

      // Final Upper Band
      if (basicUpper[i] < finalUpper[i - 1] || prevClose > finalUpper[i - 1]) {
        finalUpper[i] = basicUpper[i];
      } else {
        finalUpper[i] = finalUpper[i - 1];
      }

      // Final Lower Band
      if (basicLower[i] > finalLower[i - 1] || prevClose < finalLower[i - 1]) {
        finalLower[i] = basicLower[i];
      } else {
        finalLower[i] = finalLower[i - 1];
      }

      // Direction Flip Check
      if (currentDir === 1 && candles[i].close < finalLower[i]) {
        currentDir = -1;
      } else if (currentDir === -1 && candles[i].close > finalUpper[i]) {
        currentDir = 1;
      }

      direction[i] = currentDir;
      supertrend[i] = currentDir === 1 ? finalLower[i] : finalUpper[i];
    }

    return { supertrend, direction };
  }

  /**
   * Stochastic Oscillator (14, 3, 3)
   */
  function calculateStochastic(candles, kPeriod = 14, dPeriod = 3, smooth = 3) {
    const len = candles ? candles.length : 0;
    const k = new Array(len).fill(null);
    const d = new Array(len).fill(null);

    if (len < kPeriod) {
      return { k, d };
    }

    const rawK = [];
    const validIdxs = [];

    for (let i = kPeriod - 1; i < len; i++) {
      let lowest = Infinity;
      let highest = -Infinity;
      for (let j = i - kPeriod + 1; j <= i; j++) {
        if (candles[j].low < lowest) lowest = candles[j].low;
        if (candles[j].high > highest) highest = candles[j].high;
      }
      const range = highest - lowest;
      const fastK = range === 0 ? 50 : ((candles[i].close - lowest) / range) * 100;
      rawK.push(fastK);
      validIdxs.push(i);
    }

    // Smooth rawK
    const smoothedK = calculateSMA(rawK, smooth);
    const smoothedD = calculateSMA(smoothedK.filter(x => x !== null), dPeriod);

    let dPtr = 0;
    for (let i = 0; i < validIdxs.length; i++) {
      const orig = validIdxs[i];
      if (smoothedK[i] !== null) {
        k[orig] = parseFloat(smoothedK[i].toFixed(2));
      }
      if (i >= (smooth - 1) + (dPeriod - 1)) {
        if (smoothedD[dPtr] !== null && smoothedD[dPtr] !== undefined) {
          d[orig] = parseFloat(smoothedD[dPtr].toFixed(2));
          dPtr++;
        }
      }
    }

    return { k, d };
  }

  /**
   * Volume Metrics & On-Balance Volume (OBV)
   */
  function calculateVolumeMetrics(candles, period = 20) {
    const len = candles ? candles.length : 0;
    if (len === 0) {
      return { avgVolume: 0, currentVolume: 0, volumeRatio: 1, obv: [] };
    }

    const volumes = candles.map(c => c.volume || 0);
    const smaVol = calculateSMA(volumes, period);

    const obv = new Array(len).fill(0);
    obv[0] = volumes[0];

    for (let i = 1; i < len; i++) {
      if (candles[i].close > candles[i - 1].close) {
        obv[i] = obv[i - 1] + volumes[i];
      } else if (candles[i].close < candles[i - 1].close) {
        obv[i] = obv[i - 1] - volumes[i];
      } else {
        obv[i] = obv[i - 1];
      }
    }

    const currentVolume = volumes[len - 1];
    const avgVolume = smaVol[len - 1] || currentVolume;
    const volumeRatio = avgVolume > 0 ? parseFloat((currentVolume / avgVolume).toFixed(2)) : 1.0;

    return {
      avgVolume: Math.round(avgVolume),
      currentVolume: Math.round(currentVolume),
      volumeRatio,
      smaVolumeSeries: smaVol,
      obv
    };
  }

  /**
   * Classic Pivot Points & 52-Week High / Low
   */
  function calculatePivotsAndRanges(candles) {
    const len = candles ? candles.length : 0;
    if (len === 0) {
      return {
        pivots: { P: 0, S1: 0, S2: 0, S3: 0, R1: 0, R2: 0, R3: 0 },
        high52: 0,
        low52: 0
      };
    }

    // 52-Week High/Low (last 250 trading sessions)
    const window52W = candles.slice(-Math.min(250, len));
    const high52 = Math.max(...window52W.map(c => c.high));
    const low52 = Math.min(...window52W.map(c => c.low));

    // Classic Pivot Points based on previous 20-day / monthly swing reference
    const refCandle = candles[Math.max(0, len - 2)];
    const H = refCandle.high;
    const L = refCandle.low;
    const C = refCandle.close;

    const P = parseFloat(((H + L + C) / 3).toFixed(2));
    const R1 = parseFloat((2 * P - L).toFixed(2));
    const S1 = parseFloat((2 * P - H).toFixed(2));
    const R2 = parseFloat((P + (H - L)).toFixed(2));
    const S2 = parseFloat((P - (H - L)).toFixed(2));
    const R3 = parseFloat((H + 2 * (P - L)).toFixed(2));
    const S3 = parseFloat((L - 2 * (H - P)).toFixed(2));

    return {
      pivots: { P, S1, S2, S3, R1, R2, R3 },
      high52,
      low52
    };
  }

  /**
   * Identify Key Support & Resistance Levels from Swing Highs & Lows
   */
  function calculateSupportResistance(candles, swingWindow = 5) {
    const len = candles ? candles.length : 0;
    if (len < swingWindow * 2 + 1) {
      return { supports: [], resistances: [] };
    }

    const rawSupports = [];
    const rawResistances = [];

    // Find fractal pivot highs and lows
    for (let i = swingWindow; i < len - swingWindow; i++) {
      let isHigh = true;
      let isLow = true;
      for (let j = i - swingWindow; j <= i + swingWindow; j++) {
        if (j === i) continue;
        if (candles[j].high >= candles[i].high) isHigh = false;
        if (candles[j].low <= candles[i].low) isLow = false;
      }
      if (isHigh) rawResistances.push(candles[i].high);
      if (isLow) rawSupports.push(candles[i].low);
    }

    // Cluster nearby levels (within 1.5% proximity)
    function clusterLevels(levels) {
      if (!levels.length) return [];
      levels.sort((a, b) => a - b);
      const clusters = [];
      let currentCluster = [levels[0]];

      for (let i = 1; i < levels.length; i++) {
        const avg = currentCluster.reduce((a, b) => a + b, 0) / currentCluster.length;
        if (Math.abs(levels[i] - avg) / avg < 0.02) {
          currentCluster.push(levels[i]);
        } else {
          clusters.push(parseFloat((avg).toFixed(2)));
          currentCluster = [levels[i]];
        }
      }
      if (currentCluster.length) {
        clusters.push(parseFloat((currentCluster.reduce((a, b) => a + b, 0) / currentCluster.length).toFixed(2)));
      }
      return clusters;
    }

    const currentPrice = candles[len - 1].close;
    const allSupp = clusterLevels(rawSupports).filter(p => p < currentPrice).slice(-3);
    const allRes = clusterLevels(rawResistances).filter(p => p > currentPrice).slice(0, 3);

    return {
      supports: allSupp.length ? allSupp : [parseFloat((currentPrice * 0.94).toFixed(2))],
      resistances: allRes.length ? allRes : [parseFloat((currentPrice * 1.08).toFixed(2))]
    };
  }

  /**
   * Event Detection System
   * Identifies Golden Cross, Death Cross, EMA 9/21 crosses, RSI divergence, etc.
   */
  function detectTechnicalEvents(candles, indicators) {
    const events = [];
    const n = candles ? candles.length : 0;
    if (n < 2) return events;

    const { ema9, ema21, ema50, ema200, rsi, macd, supertrend, volume } = indicators;
    const currentPrice = candles[n - 1].close;

    // 1. Golden Cross / Death Cross (EMA50 vs EMA200)
    if (ema50 && ema200 && ema50[n - 1] && ema200[n - 1] && ema50[n - 2] && ema200[n - 2]) {
      if (ema50[n - 2] <= ema200[n - 2] && ema50[n - 1] > ema200[n - 1]) {
        events.push({ type: 'GOLDEN_CROSS', label: 'Golden Cross (EMA 50 crossed above EMA 200)', sentiment: 'bullish', priority: 1 });
      } else if (ema50[n - 2] >= ema200[n - 2] && ema50[n - 1] < ema200[n - 1]) {
        events.push({ type: 'DEATH_CROSS', label: 'Death Cross (EMA 50 crossed below EMA 200)', sentiment: 'bearish', priority: 1 });
      } else if (ema50[n - 1] > ema200[n - 1]) {
        events.push({ type: 'BULLISH_DMA_STRUCTURE', label: 'EMA 50 is trending comfortably above EMA 200', sentiment: 'bullish', priority: 3 });
      }
    }

    // 2. EMA 9/21 Momentum Crossover
    if (ema9 && ema21 && ema9[n - 1] && ema21[n - 1] && ema9[n - 2] && ema21[n - 2]) {
      if (ema9[n - 2] <= ema21[n - 2] && ema9[n - 1] > ema21[n - 1]) {
        events.push({ type: 'EMA_BULL_CROSS', label: 'Short-term EMA 9 crossed above EMA 21 (Fresh Buy Momentum)', sentiment: 'bullish', priority: 1 });
      } else if (ema9[n - 2] >= ema21[n - 2] && ema9[n - 1] < ema21[n - 1]) {
        events.push({ type: 'EMA_BEAR_CROSS', label: 'Short-term EMA 9 crossed below EMA 21 (Pullback Warning)', sentiment: 'bearish', priority: 1 });
      }
    }

    // 3. Price vs 200 DMA Primary Trend
    if (ema200 && ema200[n - 1]) {
      const dma200 = ema200[n - 1];
      if (currentPrice >= dma200) {
        const pctAbove = (((currentPrice - dma200) / dma200) * 100).toFixed(1);
        events.push({ type: 'ABOVE_200DMA', label: `Trading +${pctAbove}% above 200-DMA (Macro Uptrend Confirmed)`, sentiment: 'bullish', priority: 2 });
      } else {
        const pctBelow = (((dma200 - currentPrice) / dma200) * 100).toFixed(1);
        events.push({ type: 'BELOW_200DMA', label: `Trading -${pctBelow}% below 200-DMA (Macro Trend Caution)`, sentiment: 'bearish', priority: 2 });
      }
    }

    // 4. RSI Overbought / Oversold
    if (rsi && rsi[n - 1] !== null) {
      const currentRSI = rsi[n - 1];
      if (currentRSI >= 70) {
        events.push({ type: 'RSI_OVERBOUGHT', label: `RSI Overbought at ${currentRSI.toFixed(1)} (Profit Booking Zone)`, sentiment: 'bearish', priority: 2 });
      } else if (currentRSI <= 30) {
        events.push({ type: 'RSI_OVERSOLD', label: `RSI Oversold at ${currentRSI.toFixed(1)} (Value Accumulation Zone)`, sentiment: 'bullish', priority: 2 });
      } else if (currentRSI >= 50 && currentRSI <= 68) {
        events.push({ type: 'RSI_HEALTHY', label: `RSI at ${currentRSI.toFixed(1)} in strong accumulation territory`, sentiment: 'bullish', priority: 4 });
      }
    }

    // 5. MACD Signal-Line Cross
    if (macd && macd.macd && macd.signal && macd.histogram) {
      const h1 = macd.histogram[n - 1];
      const h2 = macd.histogram[n - 2];
      if (h2 <= 0 && h1 > 0) {
        events.push({ type: 'MACD_BULL_CROSS', label: 'MACD Histogram flipped positive (Bullish Momentum Expansion)', sentiment: 'bullish', priority: 2 });
      } else if (h2 >= 0 && h1 < 0) {
        events.push({ type: 'MACD_BEAR_CROSS', label: 'MACD Histogram flipped negative (Momentum Slowing)', sentiment: 'bearish', priority: 2 });
      }
    }

    // 6. Supertrend Flip
    if (supertrend && supertrend.direction) {
      const d1 = supertrend.direction[n - 1];
      const d2 = supertrend.direction[n - 2];
      if (d2 === -1 && d1 === 1) {
        events.push({ type: 'SUPERTREND_BUY', label: 'Supertrend flipped to Bullish (Greenscape Trigger)', sentiment: 'bullish', priority: 1 });
      } else if (d2 === 1 && d1 === -1) {
        events.push({ type: 'SUPERTREND_SELL', label: 'Supertrend flipped to Bearish (Trailing Stop Trigger)', sentiment: 'bearish', priority: 1 });
      } else if (d1 === 1) {
        events.push({ type: 'SUPERTREND_ACTIVE_BULL', label: 'Supertrend indicator remains in active BUY mode', sentiment: 'bullish', priority: 3 });
      }
    }

    // 7. Volume Breakout
    if (volume && volume.volumeRatio >= 1.5) {
      const isGreen = candles[n - 1].close >= candles[n - 1].open;
      events.push({
        type: 'VOLUME_SURGE',
        label: `High Institutional Activity: Volume is ${volume.volumeRatio}x 20-day average on ${isGreen ? 'buyer accumulation' : 'seller distribution'}`,
        sentiment: isGreen ? 'bullish' : 'bearish',
        priority: 2
      });
    }

    return events.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Master Function: Calculate Full Technical Suite from OHLCV Candles
   */
  function computeAllIndicators(candles) {
    if (!candles || candles.length === 0) {
      return null;
    }

    const closes = candles.map(c => c.close);
    const ema9 = calculateEMA(closes, 9);
    const ema21 = calculateEMA(closes, 21);
    const ema50 = calculateEMA(closes, 50);
    const ema200 = calculateEMA(closes, 200);

    const sma20 = calculateSMA(closes, 20);
    const sma50 = calculateSMA(closes, 50);
    const sma200 = calculateSMA(closes, 200);

    const rsi = calculateRSI(closes, 14);
    const macd = calculateMACD(closes, 12, 26, 9);
    const bBands = calculateBollingerBands(closes, 20, 2);
    const atr = calculateATR(candles, 14);
    const adx = calculateADX(candles, 14);
    const supertrend = calculateSupertrend(candles, 10, 3);
    const stoch = calculateStochastic(candles, 14, 3, 3);
    const volumeMetrics = calculateVolumeMetrics(candles, 20);
    const pivotsAndRanges = calculatePivotsAndRanges(candles);
    const suppRes = calculateSupportResistance(candles);

    const indicators = {
      ema9,
      ema21,
      ema50,
      ema200,
      sma20,
      sma50,
      sma200,
      rsi,
      macd,
      bBands,
      atr,
      adx,
      supertrend,
      stoch,
      volume: volumeMetrics,
      pivots: pivotsAndRanges.pivots,
      high52: pivotsAndRanges.high52,
      low52: pivotsAndRanges.low52,
      supportResistance: suppRes
    };

    const events = detectTechnicalEvents(candles, indicators);

    return {
      candles,
      indicators,
      events
    };
  }

  return {
    calculateSMA,
    calculateEMA,
    calculateRSI,
    calculateMACD,
    calculateBollingerBands,
    calculateATR,
    calculateADX,
    calculateSupertrend,
    calculateStochastic,
    calculateVolumeMetrics,
    calculatePivotsAndRanges,
    calculateSupportResistance,
    detectTechnicalEvents,
    computeAllIndicators
  };
});
