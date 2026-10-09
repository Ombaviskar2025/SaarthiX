// ============================================================
//  api/ai-analysis.js — Institutional AI Market Commentary
//  Powered by Anthropic Claude (with quantitative rule synthesis fallback)
// ============================================================
'use strict';

async function generateClaudeAnalysis(dataPackage) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const { holding, indicators, signal, fundamentals, newsSentiment } = dataPackage;
  const prompt = `You are a SEBI-compliant senior quantitative equity analyst.
Analyze the following position based STRICTLY on the verified market data provided below.
DO NOT hallucinate or invent prices, numbers, or events not present in this data.

STOCK & POSITION:
- Ticker: ${holding?.ticker || 'UNKNOWN'} (${holding?.exchange || 'NSE'})
- User Quantity: ${holding?.qty || 0} shares
- Average Buy Price: ₹${holding?.price || 0}
- Current LTP: ₹${holding?.ltp || 0}
- Current P&L: ₹${((holding?.ltp - holding?.price) * holding?.qty).toFixed(2)} (${(((holding?.ltp - holding?.price) / (holding?.price || 1)) * 100).toFixed(2)}%)

TECHNICAL INDICATORS:
- Overall Quant Signal: ${signal?.verdict || 'NEUTRAL'} (Score: ${signal?.overallScore || 0}/100)
- RSI (14, Wilder): ${indicators?.rsi ? indicators.rsi[indicators.rsi.length - 1] : 'N/A'}
- Supertrend Direction: ${indicators?.supertrend?.direction ? indicators.supertrend.direction[indicators.supertrend.direction.length - 1] : 'N/A'}
- EMA 21: ₹${indicators?.ema21 ? indicators.ema21[indicators.ema21.length - 1] : 'N/A'}
- EMA 50: ₹${indicators?.ema50 ? indicators.ema50[indicators.ema50.length - 1] : 'N/A'}
- EMA 200: ₹${indicators?.ema200 ? indicators.ema200[indicators.ema200.length - 1] : 'N/A'}

FUNDAMENTALS:
- Sector: ${fundamentals?.sector || 'Equities'}
- P/E Ratio: ${fundamentals?.pe || 'N/A'}
- Price-to-Book: ${fundamentals?.pb || 'N/A'}
- Beta: ${fundamentals?.beta || 1.0}
- ROE: ${fundamentals?.roe || 'N/A'}%

NEWS SENTIMENT:
- Dominant Sentiment: ${newsSentiment || 'Neutral'}

OUTPUT FORMAT (JSON):
Return pure JSON with keys:
"summary": 2-3 sentences explaining current position health,
"technicalThesis": 2 bullet points on momentum and moving average structure,
"fundamentalContext": 2 bullet points on valuation and sector tailwinds,
"actionPlan": specific recommendation for this investor (Hold / Accumulate / Trim / SL alert) with rationale.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) return null;
    const json = await res.json();
    const content = json?.content?.[0]?.text;
    if (!content) return null;

    // Try parsing JSON block
    const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);

  } catch (err) {
    console.warn('[AI Analysis] Anthropic call failed, falling back:', err.message);
    return null;
  }
}

function generateDeterministicThesis(dataPackage) {
  const { holding, indicators, signal, fundamentals, newsSentiment } = dataPackage;
  const ticker = holding?.ticker || 'STOCK';
  const ltp = holding?.ltp || 100;
  const avg = holding?.price || 100;
  const isGain = ltp >= avg;
  const pnlPct = avg > 0 ? (((ltp - avg) / avg) * 100).toFixed(1) : '0.0';

  const rsi = indicators?.rsi ? indicators.rsi[indicators.rsi.length - 1] : 50;
  const ema21 = indicators?.ema21 ? indicators.ema21[indicators.ema21.length - 1] : ltp;
  const ema50 = indicators?.ema50 ? indicators.ema50[indicators.ema50.length - 1] : ltp;
  const ema200 = indicators?.ema200 ? indicators.ema200[indicators.ema200.length - 1] : ltp;

  const isBullish = ltp > ema21 && ema21 > ema50;
  const verdict = signal?.verdict || (isBullish ? 'BUY / ACCUMULATE' : 'HOLD / DEFENSIVE');

  const peText = fundamentals?.pe ? `trading at a P/E of ${fundamentals.pe}` : 'with balanced valuation metrics';
  const sector = fundamentals?.sector || 'the broader market';

  let rsiState = 'neutral';
  if (rsi > 70) rsiState = 'overbought';
  else if (rsi < 35) rsiState = 'oversold';

  return {
    summary: `${ticker} is currently trading at ₹${ltp.toFixed(2)}, reflecting a ${isGain ? '+' : ''}${pnlPct}% return against your average purchase price of ₹${avg.toFixed(2)}. Current technical setup displays a ${verdict} posture within ${sector}.`,
    technicalThesis: [
      `Price is positioned ${ltp > ema21 ? 'above' : 'below'} the 21-day EMA (₹${ema21.toFixed(2)}) and ${ltp > ema200 ? 'above' : 'below'} the 200-day EMA (₹${ema200.toFixed(2)}).`,
      `RSI (14) stands at ${rsi.toFixed(1)}, indicating a ${rsiState} momentum regime with ${indicators?.supertrend?.direction?.slice(-1)[0] === 1 ? 'bullish' : 'bearish'} Supertrend alignment.`
    ],
    fundamentalContext: [
      `Company is ${peText} against sectoral peers in ${sector}.`,
      `Debt-to-equity is monitored at ${fundamentals?.debtToEquity || 'stable levels'} with a market beta of ${fundamentals?.beta || '1.0'}.`
    ],
    actionPlan: isGain
      ? `Maintain current holding size with trailing stop-loss adjusted below ₹${(Math.min(avg, ltp * 0.94)).toFixed(2)} to protect accumulated capital gains.`
      : `Avoid aggressive averaging until price breaks definitively above the 21-day EMA at ₹${ema21.toFixed(2)}.`
  };
}

async function aiAnalysisHandler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Cache-Control', 'no-cache');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const dataPackage = req.body || {};
    let analysis = await generateClaudeAnalysis(dataPackage);

    if (!analysis) {
      analysis = generateDeterministicThesis(dataPackage);
    }

    return res.status(200).json({
      status: 'SUCCESS',
      ...analysis,
      analysis,
      timestamp: Date.now()
    });

  } catch (err) {
    console.error('[AI Analysis Error]:', err);
    return res.status(500).json({ status: 'ERROR', error: 'Failed to generate AI analysis' });
  }
}

module.exports = aiAnalysisHandler;
