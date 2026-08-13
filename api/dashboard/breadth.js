// ============================================================
//  api/dashboard/breadth.js  —  GET /api/dashboard/breadth
// ============================================================
const { getMarketStatus, computeBreadth } = require('../../lib/nseClient');

module.exports = async function breadthHandler(req, res, marketWatchCache, refreshCacheFn) {
  try {
    if (!marketWatchCache || Object.keys(marketWatchCache.stocks || {}).length === 0) {
      if (typeof refreshCacheFn === 'function') {
        await refreshCacheFn();
      }
    }

    const stocks = Object.values(marketWatchCache?.stocks || {});
    const breadth = computeBreadth(stocks);
    const marketStatus = getMarketStatus();

    res.json({
      status: 'SUCCESS',
      ...breadth,
      asOf: new Date().toISOString(),
      marketOpen: marketStatus.isOpen,
      marketStatusReason: marketStatus.reason
    });
  } catch (err) {
    console.error('GET /api/dashboard/breadth Error:', err);
    res.status(500).json({
      status: 'FAILURE',
      error: err.message,
      stale: true
    });
  }
};
