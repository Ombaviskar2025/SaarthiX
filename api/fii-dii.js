// ============================================================
//  /api/fii-dii.js  —  Simulated Institutional Activity Endpoint
// ============================================================

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    return res.status(200).json({
      status: 'SUCCESS',
      isSimulated: true,
      label: 'Simulated Data (No Free Real-time FII/DII API)',
      fii: '+₹2,345 Cr',
      dii: '+₹1,892 Cr',
      fiiValue: 2345,
      diiValue: 1892,
      netFlow: '+₹4,237 Cr',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({
      status: 'ERROR',
      error: 'Failed to retrieve FII/DII activity status.'
    });
  }
};
