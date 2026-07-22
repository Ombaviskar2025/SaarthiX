// ============================================================
//  /api/health.js  —  Proxy Health Check Endpoint
// ============================================================

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const isOk = true; // Lightweight server process status check

    if (isOk) {
      return res.status(200).json({
        status: 'OK',
        service: 'SaarthiX API Proxy',
        uptime: process.uptime(),
        environment: {
          twelvedata: process.env.TWELVEDATA_API_KEY ? 'CONFIGURED' : 'NOT_SET',
          finnhub: process.env.FINNHUB_API_KEY ? 'CONFIGURED' : 'NOT_SET',
          news: process.env.NEWS_API_KEY ? 'CONFIGURED' : 'NOT_SET',
          anthropic: process.env.ANTHROPIC_API_KEY ? 'CONFIGURED' : 'NOT_SET',
          gemini: process.env.GEMINI_API_KEY ? 'CONFIGURED' : 'NOT_SET'
        },
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(503).json({
        status: 'DEGRADED',
        error: 'Proxy service degraded.',
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 'ERROR',
      error: err.message || 'Health check failed.',
      timestamp: new Date().toISOString()
    });
  }
};
