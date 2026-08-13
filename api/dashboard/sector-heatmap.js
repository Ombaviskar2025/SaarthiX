// ============================================================
//  api/dashboard/sector-heatmap.js  —  GET /api/dashboard/sector-heatmap
// ============================================================
const { getMarketStatus, computeSectorHeatmap } = require('../../lib/nseClient');

module.exports = async function sectorHeatmapHandler(req, res, marketWatchCache, refreshCacheFn) {
  try {
    if (!marketWatchCache || Object.keys(marketWatchCache.stocks || {}).length === 0) {
      if (typeof refreshCacheFn === 'function') {
        await refreshCacheFn();
      }
    }

    const stocks = Object.values(marketWatchCache?.stocks || {});
    const sectors = computeSectorHeatmap(stocks);
    const marketStatus = getMarketStatus();

    res.json({
      status: 'SUCCESS',
      sectors,
      asOf: new Date().toISOString(),
      marketOpen: marketStatus.isOpen
    });
  } catch (err) {
    console.error('GET /api/dashboard/sector-heatmap Error:', err);
    res.status(500).json({
      status: 'FAILURE',
      error: err.message,
      stale: true
    });
  }
};
