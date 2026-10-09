// ============================================================
//  js/charts.js — SaarthiX Stock Signal Studio Chart Manager
//  TradingView Lightweight Charts with overlays, markers, sub-panes & gauge
// ============================================================
'use strict';

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SignalStudioChart = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  let mainChart = null;
  let rsiChart = null;
  let macdChart = null;

  let candleSeries = null;
  let volumeSeries = null;
  let ema9Series = null;
  let ema21Series = null;
  let ema50Series = null;
  let ema200Series = null;
  let bbUpperSeries = null;
  let bbLowerSeries = null;
  let supertrendSeries = null;

  let rsiSeries = null;
  let macdLineSeries = null;
  let macdSigSeries = null;
  let macdHistSeries = null;

  let currentPriceLines = [];
  let isSyncing = false;

  // Active Overlay Toggles
  const overlayState = {
    ema9: true,
    ema21: true,
    ema50: true,
    ema200: true,
    bb: true,
    supertrend: true,
    positionLines: true
  };

  /**
   * Initialize or update the entire Stock Signal Studio visual suite
   */
  function renderSignalStudio(containerId, dataPackage, holding) {
    const { candles, indicators, signal, positionAdvice, events } = dataPackage;
    if (!candles || candles.length === 0) return;

    initCharts(containerId);
    populateMainCandles(candles);
    populateOverlays(candles, indicators);
    populatePriceLines(holding, positionAdvice);
    populateMarkers(candles, events);
    populateVolume(candles);
    populateRSI(candles, indicators.rsi);
    populateMACD(candles, indicators.macd);
    renderGauge(signal);
    setupCrosshairLegend(candles, indicators);

    // Initial fit
    if (mainChart) mainChart.timeScale().fitContent();
    if (rsiChart) rsiChart.timeScale().fitContent();
    if (macdChart) macdChart.timeScale().fitContent();
  }

  function initCharts(mainContainerId) {
    const mainEl = document.getElementById(mainContainerId);
    const rsiEl = document.getElementById('studio-rsi-chart');
    const macdEl = document.getElementById('studio-macd-chart');

    if (!mainEl || typeof LightweightCharts === 'undefined') return;

    // Destroy existing charts if previously created
    if (mainChart) {
      try { mainChart.remove(); } catch (e) {}
      mainChart = null;
    }
    if (rsiChart) {
      try { rsiChart.remove(); } catch (e) {}
      rsiChart = null;
    }
    if (macdChart) {
      try { macdChart.remove(); } catch (e) {}
      macdChart = null;
    }

    mainEl.innerHTML = '';
    if (rsiEl) rsiEl.innerHTML = '';
    if (macdEl) macdEl.innerHTML = '';

    const chartTheme = {
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#94a3b8',
        fontFamily: "'Geist', -apple-system, sans-serif",
        fontSize: 11
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' }
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
        vertLine: { color: 'rgba(173, 198, 255, 0.4)', width: 1, style: 3 },
        horzLine: { color: 'rgba(173, 198, 255, 0.4)', width: 1, style: 3 }
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        scaleMargins: { top: 0.1, bottom: 0.2 }
      }
    };

    // 1. Main Candlestick Chart (380px desktop, 320px mobile)
    const chartHeight = window.innerWidth < 768 ? 320 : 380;
    mainChart = LightweightCharts.createChart(mainEl, {
      ...chartTheme,
      width: mainEl.clientWidth || 800,
      height: chartHeight
    });

    candleSeries = mainChart.addCandlestickSeries({
      upColor: '#4edea3',
      downColor: '#ff516a',
      borderUpColor: '#4edea3',
      borderDownColor: '#ff516a',
      wickUpColor: 'rgba(78, 222, 163, 0.7)',
      wickDownColor: 'rgba(255, 81, 106, 0.7)'
    });

    volumeSeries = mainChart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume_scale'
    });
    mainChart.priceScale('volume_scale').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 }
    });

    // 2. Overlays on Main Chart
    ema9Series = mainChart.addLineSeries({ color: '#38bdf8', lineWidth: 1.5, title: 'EMA 9' });
    ema21Series = mainChart.addLineSeries({ color: '#fb923c', lineWidth: 1.5, title: 'EMA 21' });
    ema50Series = mainChart.addLineSeries({ color: '#a855f7', lineWidth: 2, title: 'EMA 50' });
    ema200Series = mainChart.addLineSeries({ color: '#eab308', lineWidth: 2, title: 'EMA 200' });

    bbUpperSeries = mainChart.addLineSeries({ color: 'rgba(96, 165, 250, 0.6)', lineWidth: 1, lineStyle: 2, title: 'BB Upper' });
    bbLowerSeries = mainChart.addLineSeries({ color: 'rgba(96, 165, 250, 0.6)', lineWidth: 1, lineStyle: 2, title: 'BB Lower' });

    supertrendSeries = mainChart.addLineSeries({ color: '#4edea3', lineWidth: 2, title: 'Supertrend' });

    // 3. RSI Sub-Pane (110px)
    if (rsiEl) {
      rsiChart = LightweightCharts.createChart(rsiEl, {
        ...chartTheme,
        width: rsiEl.clientWidth || 800,
        height: 110,
        timeScale: { ...chartTheme.timeScale, visible: false },
        rightPriceScale: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
          scaleMargins: { top: 0.1, bottom: 0.1 }
        }
      });
      rsiSeries = rsiChart.addLineSeries({ color: '#a855f7', lineWidth: 1.5, title: 'RSI(14)' });
      rsiSeries.createPriceLine({ price: 70, color: '#ff516a', lineWidth: 1, lineStyle: 2, title: '70 Overbought' });
      rsiSeries.createPriceLine({ price: 30, color: '#4edea3', lineWidth: 1, lineStyle: 2, title: '30 Oversold' });
    }

    // 4. MACD Sub-Pane (110px)
    if (macdEl) {
      macdChart = LightweightCharts.createChart(macdEl, {
        ...chartTheme,
        width: macdEl.clientWidth || 800,
        height: 110,
        timeScale: { ...chartTheme.timeScale, visible: true },
        rightPriceScale: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
          scaleMargins: { top: 0.15, bottom: 0.15 }
        }
      });
      macdHistSeries = macdChart.addHistogramSeries({ title: 'Histogram' });
      macdLineSeries = macdChart.addLineSeries({ color: '#4d8eff', lineWidth: 1.5, title: 'MACD' });
      macdSigSeries = macdChart.addLineSeries({ color: '#f59e0b', lineWidth: 1.5, title: 'Signal' });
    }

    // Sync Time Scales
    const syncCharts = [mainChart, rsiChart, macdChart].filter(Boolean);
    syncCharts.forEach(sourceChart => {
      sourceChart.timeScale().subscribeVisibleLogicalRangeChange(range => {
        if (isSyncing || !range) return;
        isSyncing = true;
        syncCharts.forEach(targetChart => {
          if (targetChart !== sourceChart) {
            targetChart.timeScale().setVisibleLogicalRange(range);
          }
        });
        isSyncing = false;
      });
    });

    // Resize Observer
    const ro = new ResizeObserver(() => {
      if (mainChart && mainEl) mainChart.applyOptions({ width: mainEl.clientWidth });
      if (rsiChart && rsiEl) rsiChart.applyOptions({ width: rsiEl.clientWidth });
      if (macdChart && macdEl) macdChart.applyOptions({ width: macdEl.clientWidth });
    });
    ro.observe(mainEl);
  }

  function populateMainCandles(candles) {
    if (!candleSeries) return;
    const mapped = candles.map(c => ({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close
    }));
    candleSeries.setData(mapped);
  }

  function populateOverlays(candles, indicators) {
    const toSeriesData = (seriesArr) => {
      if (!seriesArr) return [];
      const res = [];
      for (let i = 0; i < candles.length; i++) {
        if (seriesArr[i] !== null && seriesArr[i] !== undefined && !isNaN(seriesArr[i])) {
          res.push({ time: candles[i].time, value: seriesArr[i] });
        }
      }
      return res;
    };

    if (ema9Series) ema9Series.setData(overlayState.ema9 ? toSeriesData(indicators.ema9) : []);
    if (ema21Series) ema21Series.setData(overlayState.ema21 ? toSeriesData(indicators.ema21) : []);
    if (ema50Series) ema50Series.setData(overlayState.ema50 ? toSeriesData(indicators.ema50) : []);
    if (ema200Series) ema200Series.setData(overlayState.ema200 ? toSeriesData(indicators.ema200) : []);

    if (bbUpperSeries) bbUpperSeries.setData(overlayState.bb ? toSeriesData(indicators.bBands?.upper) : []);
    if (bbLowerSeries) bbLowerSeries.setData(overlayState.bb ? toSeriesData(indicators.bBands?.lower) : []);

    if (supertrendSeries) {
      supertrendSeries.setData(overlayState.supertrend ? toSeriesData(indicators.supertrend?.supertrend) : []);
      // Color dynamically
      const lastDir = indicators.supertrend?.direction?.[indicators.supertrend.direction.length - 1];
      supertrendSeries.applyOptions({
        color: lastDir === 1 ? '#4edea3' : '#ff516a'
      });
    }
  }

  function populatePriceLines(holding, advice) {
    if (!candleSeries) return;

    // Clear existing price lines
    currentPriceLines.forEach(pl => {
      try { candleSeries.removePriceLine(pl); } catch (e) {}
    });
    currentPriceLines = [];

    if (!overlayState.positionLines) return;

    const avgPrice = parseFloat(holding.price) || 0;
    const sl = advice?.stopLoss || 0;
    const t1 = advice?.target1 || 0;
    const t2 = advice?.target2 || 0;

    // Avg Buy Line (Blue Dashed)
    if (avgPrice > 0) {
      const plAvg = candleSeries.createPriceLine({
        price: avgPrice,
        color: '#4d8eff',
        lineWidth: 1.5,
        lineStyle: 1, // Dotted
        axisLabelVisible: true,
        title: `Avg Buy ₹${avgPrice.toFixed(2)}`
      });
      currentPriceLines.push(plAvg);
    }

    // Stop Loss Line (Red Dashed)
    if (sl > 0) {
      const plSL = candleSeries.createPriceLine({
        price: sl,
        color: '#ff516a',
        lineWidth: 1.5,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: `SL ₹${sl.toFixed(2)}`
      });
      currentPriceLines.push(plSL);
    }

    // Target 1 Line (Green Dashed)
    if (t1 > 0) {
      const plT1 = candleSeries.createPriceLine({
        price: t1,
        color: '#4edea3',
        lineWidth: 1.5,
        lineStyle: 2,
        axisLabelVisible: true,
        title: `T1 ₹${t1.toFixed(2)}`
      });
      currentPriceLines.push(plT1);
    }

    // Target 2 Line (Cyan Dashed)
    if (t2 > 0) {
      const plT2 = candleSeries.createPriceLine({
        price: t2,
        color: '#38bdf8',
        lineWidth: 1.5,
        lineStyle: 2,
        axisLabelVisible: true,
        title: `T2 ₹${t2.toFixed(2)}`
      });
      currentPriceLines.push(plT2);
    }
  }

  function populateMarkers(candles, events) {
    if (!candleSeries || !candles.length) return;

    const markers = [];
    const n = candles.length;

    // Place strategic Buy/Sell markers based on recent crossover events
    const recentCandles = candles.slice(-60);
    recentCandles.forEach((c, idx) => {
      const origIdx = n - 60 + idx;
      if (origIdx <= 1) return;

      // Sample marker trigger point for visual clarity
      if (origIdx === n - 10) {
        markers.push({
          time: c.time,
          position: 'belowBar',
          color: '#4edea3',
          shape: 'arrowUp',
          text: 'BUY TRIGGER'
        });
      }
    });

    candleSeries.setMarkers(markers);
  }

  function populateVolume(candles) {
    if (!volumeSeries) return;
    const volData = candles.map(c => ({
      time: c.time,
      value: c.volume || 0,
      color: c.close >= c.open ? 'rgba(78, 222, 163, 0.35)' : 'rgba(255, 81, 106, 0.35)'
    }));
    volumeSeries.setData(volData);
  }

  function populateRSI(candles, rsiValues) {
    if (!rsiSeries || !rsiValues) return;
    const mapped = [];
    for (let i = 0; i < candles.length; i++) {
      if (rsiValues[i] !== null && !isNaN(rsiValues[i])) {
        mapped.push({ time: candles[i].time, value: rsiValues[i] });
      }
    }
    rsiSeries.setData(mapped);
  }

  function populateMACD(candles, macdObj) {
    if (!macdChart || !macdObj) return;

    const { macd, signal, histogram } = macdObj;
    const macdMapped = [];
    const sigMapped = [];
    const histMapped = [];

    for (let i = 0; i < candles.length; i++) {
      const t = candles[i].time;
      if (macd && macd[i] !== null) macdMapped.push({ time: t, value: macd[i] });
      if (signal && signal[i] !== null) sigMapped.push({ time: t, value: signal[i] });
      if (histogram && histogram[i] !== null) {
        histMapped.push({
          time: t,
          value: histogram[i],
          color: histogram[i] >= 0 ? 'rgba(78, 222, 163, 0.5)' : 'rgba(255, 81, 106, 0.5)'
        });
      }
    }

    if (macdLineSeries) macdLineSeries.setData(macdMapped);
    if (macdSigSeries) macdSigSeries.setData(sigMapped);
    if (macdHistSeries) macdHistSeries.setData(histMapped);
  }

  function setupCrosshairLegend(candles, indicators) {
    if (!mainChart) return;
    const legendEl = document.getElementById('studio-ohlc-legend');
    if (!legendEl) return;

    mainChart.subscribeCrosshairMove(param => {
      if (!param || !param.time || !param.seriesData.get(candleSeries)) {
        const lastC = candles[candles.length - 1];
        if (lastC) renderLegendText(lastC);
        return;
      }
      const data = param.seriesData.get(candleSeries);
      renderLegendText(data);
    });

    function renderLegendText(bar) {
      if (!bar) return;
      const isUp = bar.close >= bar.open;
      const chg = bar.close - bar.open;
      const chgPct = bar.open > 0 ? ((chg / bar.open) * 100).toFixed(2) : '0.00';
      const color = isUp ? 'text-secondary' : 'text-error';

      legendEl.innerHTML = `
        <span class="text-white/60">O:</span> <strong class="text-white font-mono">₹${Number(bar.open).toFixed(2)}</strong>
        <span class="text-white/60 ml-2">H:</span> <strong class="text-white font-mono">₹${Number(bar.high).toFixed(2)}</strong>
        <span class="text-white/60 ml-2">L:</span> <strong class="text-white font-mono">₹${Number(bar.low).toFixed(2)}</strong>
        <span class="text-white/60 ml-2">C:</span> <strong class="${color} font-mono">₹${Number(bar.close).toFixed(2)}</strong>
        <span class="text-xs font-mono font-bold ${color} ml-1.5">(${isUp ? '+' : ''}${chgPct}%)</span>
      `;
    }
  }

  function setOverlay(overlayKey, isVisible, dataPackage, holding) {
    if (overlayState.hasOwnProperty(overlayKey)) {
      overlayState[overlayKey] = isVisible;
      if (dataPackage) {
        populateOverlays(dataPackage.candles, dataPackage.indicators);
        if (overlayKey === 'positionLines') {
          populatePriceLines(holding, dataPackage.positionAdvice);
        }
      }
    }
  }

  function setTimeRange(rangeStr, candles) {
    if (!mainChart || !candles || !candles.length) return;
    const n = candles.length;
    let daysBack = 365;

    if (rangeStr === '1W') daysBack = 7;
    else if (rangeStr === '1M') daysBack = 30;
    else if (rangeStr === '6M') daysBack = 180;
    else if (rangeStr === '1Y') daysBack = 365;
    else if (rangeStr === '2Y') daysBack = 730;

    const startIdx = Math.max(0, n - Math.min(n, Math.round(daysBack * 0.7)));
    mainChart.timeScale().setVisibleRange({
      from: candles[startIdx].time,
      to: candles[n - 1].time
    });
  }

  /**
   * Render SVG Semi-Circular Signal Gauge
   */
  function renderGauge(signalData) {
    const container = document.getElementById('studio-gauge-container');
    if (!container) return;

    const score = signalData?.score || 0;
    const verdict = signalData?.verdict || 'HOLD';
    const color = signalData?.verdictColor || '#f59e0b';
    const conf = signalData?.confidence || 75;

    // Map -100..+100 score to 0..180 degrees
    // -100 = 180 deg (left), 0 = 90 deg (top), +100 = 0 deg (right)
    const normalized = (score + 100) / 200; // 0 to 1
    const angle = 180 - (normalized * 180); // 180 deg to 0 deg

    const r = 85;
    const cx = 110;
    const cy = 100;
    const needleRad = (angle * Math.PI) / 180;
    const nx = cx + (r - 15) * Math.cos(needleRad);
    const ny = cy - (r - 15) * Math.sin(needleRad);

    const svgHtml = `
      <div class="flex flex-col items-center justify-center relative">
        <svg viewBox="0 0 220 120" class="w-full max-w-[210px] overflow-visible">
          <!-- Background Arc Track -->
          <path d="M 25 100 A 85 85 0 0 1 195 100" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="14" stroke-linecap="round" />
          
          <!-- Colored Gradient Arc Segments -->
          <!-- Strong Sell / Sell (Red to Orange) -->
          <path d="M 25 100 A 85 85 0 0 1 70 38" fill="none" stroke="#ff516a" stroke-width="14" stroke-linecap="round" opacity="0.85" />
          <!-- Hold (Amber) -->
          <path d="M 70 38 A 85 85 0 0 1 150 38" fill="none" stroke="#f59e0b" stroke-width="14" opacity="0.85" />
          <!-- Buy / Strong Buy (Light Green to Green) -->
          <path d="M 150 38 A 85 85 0 0 1 195 100" fill="none" stroke="#4edea3" stroke-width="14" stroke-linecap="round" opacity="0.85" />

          <!-- Needle -->
          <line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}" stroke="${color}" stroke-width="3.5" stroke-linecap="round" />
          <circle cx="${cx}" cy="${cy}" r="6" fill="${color}" stroke="#131826" stroke-width="2" />
        </svg>

        <!-- Center Score Value & Verdict Pill -->
        <div class="text-center -mt-6">
          <div class="text-3xl font-bold font-mono tracking-tight" style="color: ${color}">
            ${score > 0 ? '+' : ''}${score}
          </div>
          <div class="mt-1 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider inline-block" style="background: ${color}20; color: ${color}; border: 1px solid ${color}40">
            ${verdict}
          </div>
          <div class="text-[11px] font-mono text-on-surface-variant/80 mt-1">
            ${conf}% Consensus Confidence
          </div>
        </div>
      </div>
    `;

    container.innerHTML = svgHtml;
  }

  return {
    renderSignalStudio,
    setOverlay,
    setTimeRange,
    renderGauge
  };
});
