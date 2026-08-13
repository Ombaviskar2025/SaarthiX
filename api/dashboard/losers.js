// ============================================================
//  api/dashboard/losers.js  —  GET /api/dashboard/losers
// ============================================================
const { getMarketStatus, computeLosers } = require('../../lib/nseClient');

module.exports = async function losersHandler(req, res, marketWatchCache, refreshCacheFn) {
  try {
    const limit = parseInt(req.query?.limit || '10', 10);

    if (!marketWatchCache || Object.keys(marketWatchCache.stocks || {}).length === 0) {
      if (typeof refreshCacheFn === 'function') {
        await refreshCacheFn();
      }
    }

    const stocks = Object.values(marketWatchCache?.stocks || {});
    const losers = computeLosers(stocks, limit);
    const marketStatus = getMarketStatus();

    res.json({
      status: 'SUCCESS',
      losers,
      limit,
      asOf: new Date().toISOString(),
      marketOpen: marketStatus.isOpen
    });
  } catch (err) {
    console.error('GET /api/dashboard/losers Error:', err);
    res.status(500).json({
      status: 'FAILURE',
      error: err.message,
      stale: true
    });
  }
};
