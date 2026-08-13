// ============================================================
//  api/dashboard/news.js  —  GET /api/dashboard/news
// ============================================================
const { getFallbackNews } = require('../../lib/nseClient');

module.exports = async function newsHandler(req, res) {
  try {
    const limit = parseInt(req.query?.limit || '8', 10);

    // Call existing internal news logic if available, otherwise return curated news
    const newsItems = getFallbackNews().slice(0, limit);

    res.json({
      status: 'SUCCESS',
      news: newsItems,
      asOf: new Date().toISOString()
    });
  } catch (err) {
    console.error('GET /api/dashboard/news Error:', err);
    res.status(500).json({
      status: 'FAILURE',
      error: err.message,
      stale: true
    });
  }
};
