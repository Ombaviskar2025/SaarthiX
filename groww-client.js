// ============================================================
//  groww-client.js  —  SaarthiX Live Market Data Client (Yahoo Finance)
// ============================================================
'use strict';

(function() {
  const API_BASE = '/api';
  let pollInterval = 15000; // 15s polling
  let pollTimer = null;
  let isInitialLoad = true;

  // CSS injection for banners and price-flashing animations
  const style = document.createElement('style');
  style.textContent = `
    .api-status-banner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.8rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
      animation: bannerSlideIn 0.3s ease-out;
    }
    @keyframes bannerSlideIn {
      from { transform: translateY(-10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .flash-pulse {
      animation: pulseHighlight 1s ease-out;
    }
    @keyframes pulseHighlight {
      0% { text-shadow: 0 0 10px rgba(78, 222, 163, 0.8); color: #4edea3; }
      100% { text-shadow: none; }
    }
  `;
  document.head.appendChild(style);

  // Initialize status container in header
  function getOrCreateStatusContainer() {
    let header = document.querySelector('header');
    if (!header) return null;
    
    let container = document.getElementById('groww-status-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'groww-status-container';
      container.className = 'flex items-center gap-2';
      const targetChild = header.querySelector('.flex.items-center.gap-4');
      if (targetChild) {
        targetChild.insertBefore(container, targetChild.firstChild);
      } else {
        header.appendChild(container);
      }
    }
    return container;
  }

  // Update Status Banner UI
  function setStatus(state, message = '') {
    const container = getOrCreateStatusContainer();
    if (!container) return;

    container.innerHTML = ''; // clear

    let banner = document.createElement('div');
    banner.className = 'api-status-banner ';

    switch (state) {
      case 'LIVE':
        banner.className += 'bg-secondary/10 border border-secondary/30 text-secondary';
        banner.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span>Live (Yahoo Finance) • ${message}</span>
        `;
        break;
      case 'CLOSED':
        banner.className += 'bg-surface-container border border-white/10 text-on-surface-variant';
        banner.innerHTML = `
          <span class="w-2.5 h-2.5 rounded-full bg-on-surface-variant/40"></span>
          <span>Market Closed (${message})</span>
        `;
        break;
      case 'DELAYED':
        banner.className += 'bg-warning/10 border border-warning/30 text-warning';
        banner.innerHTML = `
          <span class="material-symbols-outlined text-[16px] text-yellow-400">warning</span>
          <span>Data may be delayed</span>
          <button onclick="window.retryGrowwConnection()" class="ml-1 px-1.5 py-0.5 rounded bg-warning/20 hover:bg-warning/30 text-[10px] uppercase font-bold tracking-wider">Retry</button>
        `;
        break;
      case 'ERROR':
        banner.className += 'bg-error/10 border border-error/30 text-error';
        banner.innerHTML = `
          <span class="material-symbols-outlined text-[16px]">warning</span>
          <span class="truncate max-w-[200px]" title="${message}">${message}</span>
          <button onclick="window.retryGrowwConnection()" class="ml-1 px-1.5 py-0.5 rounded bg-error/20 hover:bg-error/30 text-[10px] uppercase font-bold tracking-wider">Retry</button>
        `;
        break;
      case 'LOADING':
        banner.className += 'bg-white/5 border border-white/10 text-on-surface-variant';
        banner.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-on-surface-variant animate-ping"></span>
          <span>Syncing Live Prices...</span>
        `;
        break;
    }
    container.appendChild(banner);
  }

  // Global retry helper
  window.retryGrowwConnection = function() {
    setStatus('LOADING');
    fetchLivePrices();
  };

  // Main polling logic
  async function fetchLivePrices() {
    try {
      if (typeof window.LIVE_STOCKS === 'undefined') return;

      // Stop local random simulation when live data is active
      if (window.stopSimulation) {
        window.stopSimulation();
      }

      // Pass current watchlist tickers to market-watch endpoint
      const currentTickers = window.LIVE_STOCKS.map(s => s.ticker).join(',');
      const response = await fetch(`${API_BASE}/market-watch?symbols=${currentTickers}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'FAILURE') {
        throw new Error(data.error?.message || 'Server error fetching market watch data');
      }

      // 1. Update Stocks
      if (data.data && Array.isArray(data.data)) {
        data.data.forEach(item => {
          let stock = window.LIVE_STOCKS.find(s => s.ticker === item.ticker);
          if (!stock) {
            // Dynamically register stock into LIVE_STOCKS if it was searched on demand
            stock = {
              ticker: item.ticker,
              name: item.companyName || item.ticker,
              exchange: item.exchange || 'NSE',
              sector: item.sector || 'Other',
              price: item.price,
              change: item.change,
              changePct: item.changePct,
              pChange: item.changePct,
              volume: item.volume,
              high: item.high,
              low: item.low,
              high52: item.fiftyTwoWeekHigh,
              low52: item.fiftyTwoWeekLow,
              yearHigh: item.fiftyTwoWeekHigh,
              yearLow: item.fiftyTwoWeekLow
            };
            window.LIVE_STOCKS.push(stock);
          } else {
            const changed = stock.price !== item.price;
            stock.price = item.price;
            stock.change = item.change;
            stock.changePct = item.changePct;
            stock.pChange = item.changePct;
            stock.volume = item.volume;
            stock.high = item.high;
            stock.low = item.low;
            stock.high52 = item.fiftyTwoWeekHigh;
            stock.low52 = item.fiftyTwoWeekLow;
            stock.yearHigh = item.fiftyTwoWeekHigh;
            stock.yearLow = item.fiftyTwoWeekLow;
            if (item.companyName) stock.name = item.companyName;
            if (item.exchange) stock.exchange = item.exchange;
            
            if (changed && !isInitialLoad) {
              stock.lastUpdated = Date.now();
            }
          }
        });
      }

      // 2. Update Indices
      if (data.indices) {
        Object.entries(data.indices).forEach(([key, idxObj]) => {
          if (window.LIVE_INDICES && window.LIVE_INDICES[key] && idxObj) {
            window.LIVE_INDICES[key].value = idxObj.price;
            window.LIVE_INDICES[key].change = idxObj.change;
            window.LIVE_INDICES[key].changePct = idxObj.changePct;
          }
        });
      }

      isInitialLoad = false;
      const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      // Market status display
      if (data.isDelayed) {
        setStatus('DELAYED');
      } else if (data.marketStatus?.isOpen) {
        setStatus('LIVE', timeStr);
      } else {
        setStatus('CLOSED', data.marketStatus?.reason || 'Closed');
      }
      
      // Update timestamp indicators across the app
      document.querySelectorAll('.live-timestamp').forEach(el => {
        el.textContent = `Last updated: ${timeStr} IST`;
      });

      // Dispatch tick event to update all DOM views
      document.dispatchEvent(new CustomEvent('market:tick'));

    } catch (err) {
      console.warn('[MarketWatch Client Error]:', err.message);
      setStatus('DELAYED');
    }
  }

  function startPolling() {
    if (pollTimer) clearInterval(pollTimer);
    fetchLivePrices();
    pollTimer = setInterval(fetchLivePrices, pollInterval);
  }

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      setStatus('LOADING');
      startPolling();
    }, 200);
  });

})();
