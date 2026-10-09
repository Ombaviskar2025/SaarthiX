// ============================================================
//  api/news.js — Live Market & Stock News Headlines + Sentiment
//  Sources: Google News India RSS & Economic Times
// ============================================================
'use strict';

const NEWS_CACHE = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

const BULLISH_WORDS = [
  'surge', 'surges', 'jump', 'jumps', 'rally', 'rallies', 'gain', 'gains', 'high', 'peak',
  'record', 'bull', 'bullish', 'profit', 'profits', 'growth', 'strong', 'upgrade', 'upgrades',
  'boost', 'soar', 'soars', 'outperform', 'dividend', 'order', 'win', 'wins', 'expand', 'expansion',
  'multibagger', 'breakout', 'green', 'positive', 'q1', 'q2', 'q3', 'q4', 'beat', 'beats'
];

const BEARISH_WORDS = [
  'plunge', 'plunges', 'drop', 'drops', 'fall', 'falls', 'slump', 'slumps', 'decline', 'declines',
  'down', 'low', 'loss', 'losses', 'bear', 'bearish', 'weak', 'weakness', 'downgrade', 'downgrades',
  'cut', 'cuts', 'crash', 'crashes', 'probe', 'penalty', 'fine', 'fraud', 'default', 'debt',
  'inflation', 'worry', 'worries', 'tumble', 'tumbles', 'selloff', 'red', 'negative', 'underperform'
];

function analyzeSentiment(text) {
  if (!text) return { label: 'NEUTRAL', score: 0 };
  const lower = text.toLowerCase();
  let score = 0;

  BULLISH_WORDS.forEach(w => {
    const reg = new RegExp(`\\b${w}\\b`, 'g');
    const matches = lower.match(reg);
    if (matches) score += matches.length;
  });

  BEARISH_WORDS.forEach(w => {
    const reg = new RegExp(`\\b${w}\\b`, 'g');
    const matches = lower.match(reg);
    if (matches) score -= matches.length;
  });

  if (score > 0) return { label: 'POSITIVE', score: Math.min(100, score * 30) };
  if (score < 0) return { label: 'NEGATIVE', score: Math.max(-100, score * 30) };
  return { label: 'NEUTRAL', score: 0 };
}

function cleanHtml(str) {
  if (!str) return '';
  return str
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function parseRssXml(xml) {
  const items = [];
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

  for (const itemXml of itemMatches) {
    const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
    const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/);

    let rawTitle = titleMatch ? cleanHtml(titleMatch[1]) : '';
    let link = linkMatch ? linkMatch[1].trim() : '#';
    let pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toUTCString();
    let source = sourceMatch ? cleanHtml(sourceMatch[1]) : '';

    // If source is inside title like "Title - Source Name"
    if (!source && rawTitle.includes(' - ')) {
      const parts = rawTitle.split(' - ');
      source = parts.pop().trim();
      rawTitle = parts.join(' - ').trim();
    }

    if (rawTitle) {
      const sentiment = analyzeSentiment(rawTitle);
      items.push({
        title: rawTitle,
        link,
        source: source || 'Financial Express',
        publishedAt: pubDate,
        timeAgo: getTimeAgo(pubDate),
        sentiment: sentiment.label,
        sentimentScore: sentiment.score
      });
    }
  }

  return items;
}

function getTimeAgo(dateStr) {
  try {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1h ago';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch (e) {
    return 'Recent';
  }
}

async function newsHandler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query.query || req.query.symbol || req.query.q || 'Indian stock market NSE';
  const cleanQ = query.trim();
  const cacheKey = cleanQ.toLowerCase();

  const now = Date.now();
  const cached = NEWS_CACHE.get(cacheKey);
  if (cached && (now - cached.cachedAt) < CACHE_TTL_MS) {
    return res.status(200).json({ status: 'SUCCESS', source: 'Cache', query: cleanQ, articles: cached.data });
  }

  try {
    // Construct search URL for Google News RSS India
    const searchTerms = `${cleanQ} NSE India stocks`;
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchTerms)}&hl=en-IN&gl=IN&ceid=IN:en`;

    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Google News RSS returned HTTP ${response.status}`);
    }

    const xml = await response.text();
    const articles = parseRssXml(xml).slice(0, 15);

    NEWS_CACHE.set(cacheKey, { data: articles, cachedAt: now });

    return res.status(200).json({
      status: 'SUCCESS',
      source: 'Live RSS',
      query: cleanQ,
      count: articles.length,
      articles
    });

  } catch (err) {
    console.error('[News API Error]:', err);
    return res.status(500).json({ status: 'ERROR', error: 'Failed to fetch market news headlines' });
  }
}

module.exports = newsHandler;
