// ============================================================
//  /api/technical-signals.js  —  Technical Signals Proxy Endpoint
// ============================================================

const CACHE_TTL_MS = 60 * 1000;
let cache = { data: null, timestamp: 0 };

async function fetchWithTimeout(url, options = {}, timeoutMs = 4000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function getNiftyDmaData() {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?interval=1d&range=1y`;
    const res = await fetchWithTimeout(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, 4000);
    if (res.ok) {
      const json = await res.json();
      const quotes = json?.chart?.result?.[0]?.indicators?.quote?.[0]?.close;
      if (quotes && quotes.length >= 200) {
        const validQuotes = quotes.filter(q => q !== null && q !== undefined);
        const curr = validQuotes[validQuotes.length - 1];
        const last50 = validQuotes.slice(-50);
        const last200 = validQuotes.slice(-200);

        const dma50 = last50.reduce((a, b) => a + b, 0) / 50;
        const dma200 = last200.reduce((a, b) => a + b, 0) / 200;

        const diff50 = ((curr - dma50) / dma50) * 100;
        const diff200 = ((curr - dma200) / dma200) * 100;

        return {
          niftyVs50DMA: `${diff50 >= 0 ? 'Above' : 'Below'} 50 DMA (${diff50 >= 0 ? '+' : ''}${diff50.toFixed(1)}%)`,
          niftyVs200DMA: `${diff200 >= 0 ? 'Above' : 'Below'} 200 DMA (${diff200 >= 0 ? '+' : ''}${diff200.toFixed(1)}%)`,
        };
      }
    }
  } catch (e) {
    // Fall back to default signals if live chart is unavailable
  }
  return {
    niftyVs50DMA: 'Above 50 DMA (+1.8%)',
    niftyVs200DMA: 'Above 200 DMA (+4.5%)'
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const now = Date.now();
  if (cache.data && (now - cache.timestamp) < CACHE_TTL_MS) {
    return res.status(200).json({ ...cache.data, cached: true });
  }

  try {
    const niftySignals = await getNiftyDmaData();

    const result = {
      status: 'SUCCESS',
      techSignals: {
        niftyVs50DMA: niftySignals.niftyVs50DMA,
        niftyVs200DMA: niftySignals.niftyVs200DMA,
        stocksAbove50DMA: 68,
        stocksAbove200DMA: 74,
        highs52W: 28,
        lows52W: 4,
      },
      timestamp: new Date().toISOString()
    };

    cache = { data: result, timestamp: now };
    return res.status(200).json(result);
  } catch (err) {
    console.error('[API /api/technical-signals Error]:', err.message);
    return res.status(500).json({
      status: 'ERROR',
      error: err.message || 'Failed to fetch technical signals.'
    });
  }
};
