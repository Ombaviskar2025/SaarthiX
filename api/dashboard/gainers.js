// ============================================================
//  api/dashboard/gainers.js  —  GET /api/dashboard/gainers
// ============================================================
const { getMarketStatus, computeGainers } = require('../../lib/nseClient');

module.exports = async function gainersHandler(req, res, marketWatchCache, refreshCacheFn) {
  try {
    const limit = parseInt(req.query?.limit || '10', 10);

    if (!marketWatchCache || Object.keys(marketWatchCache.stocks || {}).length === 0) {
      if (typeof refreshCacheFn === 'function') {
        await refreshCacheFn();
      }
    }

    const stocks = Object.values(marketWatchCache?.stocks || {});
    const gainers = computeGainers(stocks, limit);
    const marketStatus = getMarketStatus();

    res.json({
      status: 'SUCCESS',
      gainers,
      limit,
      asOf: new Date().toISOString(),
      marketOpen: marketStatus.isOpen
    });
  } catch (err) {
    console.error('GET /api/dashboard/gainers Error:', err);
    res.status(500).json({
      status: 'FAILURE',
      error: err.message,
      stale: true
    });
  }
};
