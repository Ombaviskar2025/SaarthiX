// ============================================================
//  groww-client.js  —  SaarthiX Live Data Polling Client
// ============================================================
'use strict';

(function() {
  const API_BASE = 'http://localhost:3000/api';
  let pollInterval = 7000; // default 7s
  let pollTimer = null;
  let isInitialLoad = true;

  // Banner elements
  let statusBanner = null;

  // CSS injection for banners and price-flashing animations
  const style = document.createElement('style');
  style.textContent = `
    .api-status-banner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
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

  // Initialize status container in top-right or inside the top bar
  function getOrCreateStatusContainer() {
    let header = document.querySelector('header');
    if (!header) return null;
    
    let container = document.getElementById('groww-status-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'groww-status-container';
      container.className = 'flex items-center gap-2';
      // Insert before the last items (e.g. before profile avatar/search bar)
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
          <span>Groww Live: ${message}</span>
        `;
        break;
      case 'SIMULATED':
        banner.className += 'bg-primary-container/10 border border-primary-container/30 text-primary';
        banner.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
          <span>Demo Mode (Simulated Data)</span>
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
      case 'RATE_LIMIT':
        banner.className += 'bg-tertiary-container/10 border border-tertiary-container/30 text-tertiary-container';
        banner.innerHTML = `
          <span class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
          <span>Rate Limited (Backing off...)</span>
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

  // Expose global retry helper
  window.retryGrowwConnection = function() {
    setStatus('LOADING');
    fetchLivePrices();
  };

  // Main polling logic
  async function fetchLivePrices() {
    try {
      if (typeof window.LIVE_STOCKS === 'undefined') return;

      // Stop local simulation if active
      if (window.stopSimulation) {
        window.stopSimulation();
      }

      // Collect all NSE tickers from LIVE_STOCKS and add key market indices
      const tickers = window.LIVE_STOCKS.map(s => s.ticker);
      tickers.push('BSE_SENSEX', 'NSE_NIFTY', 'NSE_BANKNIFTY', 'NSE_NIFTYIT');
      
      // Batch symbols in chunks of 50 (Groww max limit)
      const chunkSize = 50;
      const chunks = [];
      for (let i = 0; i < tickers.length; i += chunkSize) {
        chunks.push(tickers.slice(i, i + chunkSize));
      }

      let allPrices = {};
      
      // Fetch each batch
      for (const chunk of chunks) {
        const queryParams = chunk.join(',');
        const response = await fetch(`${API_BASE}/ltp?symbols=${queryParams}`);
        
        if (response.status === 429) {
          handleRateLimit();
          return;
        }

        const data = await response.json();

        if (data.status === 'SIMULATED') {
          setStatus('SIMULATED');
          if (window.restartSimulation) {
            window.restartSimulation();
          }
          return;
        }

        if (data.status === 'FAILURE') {
          throw new Error(data.error?.message || 'Server error fetching prices');
        }

        if (data.prices) {
          allPrices = { ...allPrices, ...data.prices };
        }
      }

      // Apply prices to LIVE_STOCKS and LIVE_INDICES
      let updatedCount = 0;
      Object.entries(allPrices).forEach(([ticker, priceData]) => {
        // Handle indices mapping first
        if (ticker === 'SENSEX' && window.LIVE_INDICES?.sensex) {
          window.LIVE_INDICES.sensex.value = priceData.price;
          window.LIVE_INDICES.sensex.change = priceData.change;
          window.LIVE_INDICES.sensex.changePct = priceData.changePct;
        } else if (ticker === 'NIFTY' && window.LIVE_INDICES?.nifty50) {
          window.LIVE_INDICES.nifty50.value = priceData.price;
          window.LIVE_INDICES.nifty50.change = priceData.change;
          window.LIVE_INDICES.nifty50.changePct = priceData.changePct;
        } else if (ticker === 'BANKNIFTY' && window.LIVE_INDICES?.niftyBank) {
          window.LIVE_INDICES.niftyBank.value = priceData.price;
          window.LIVE_INDICES.niftyBank.change = priceData.change;
          window.LIVE_INDICES.niftyBank.changePct = priceData.changePct;
        } else if (ticker === 'NIFTYIT' && window.LIVE_INDICES?.niftyIT) {
          window.LIVE_INDICES.niftyIT.value = priceData.price;
          window.LIVE_INDICES.niftyIT.change = priceData.change;
          window.LIVE_INDICES.niftyIT.changePct = priceData.changePct;
        } else {
          // Regular stock
          const stock = window.LIVE_STOCKS.find(s => s.ticker === ticker);
          if (stock) {
            const changed = stock.price !== priceData.price;
            stock.price = priceData.price;
            stock.change = priceData.change;
            stock.changePct = priceData.changePct;
            
            if (changed && !isInitialLoad) {
              stock.lastUpdated = Date.now();
            }
            updatedCount++;
          }
        }
      });

      isInitialLoad = false;
      const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setStatus('LIVE', timeStr);
      
      // Update any page-specific elements showing live timestamp
      document.querySelectorAll('.live-timestamp').forEach(el => {
        el.textContent = `Last updated: ${timeStr} IST`;
      });

      // Dispatch standard tick event for all pages to re-render
      document.dispatchEvent(new CustomEvent('market:tick'));

    } catch (err) {
      console.warn('Groww client error:', err.message);
      
      // Show warning/error banner
      if (err.message.includes('missing') || err.message.includes('UNAUTHORIZED') || err.message.includes('expired')) {
        setStatus('SIMULATED');
        // Restart simulated market simulation since API is not configured
        if (window.restartSimulation) {
          window.restartSimulation();
        }
      } else {
        setStatus('ERROR', err.message || 'Server offline');
        // Restart simulated market simulation as a fallback
        if (window.restartSimulation) {
          window.restartSimulation();
        }
      }
    }
  }

  // Handle Groww API Rate Limits
  function handleRateLimit() {
    setStatus('RATE_LIMIT');
    // Clear regular poll interval and wait longer (60 seconds back-off)
    clearInterval(pollTimer);
    setTimeout(() => {
      startPolling();
    }, 60000);
  }

  // Start client polling
  function startPolling() {
    if (pollTimer) clearInterval(pollTimer);
    
    // Fetch immediately
    fetchLivePrices();
    
    // Set interval
    pollTimer = setInterval(fetchLivePrices, pollInterval);
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    // Wait a brief moment to ensure header layout and variables are ready
    setTimeout(() => {
      setStatus('LOADING');
      startPolling();
    }, 200);
  });

})();
