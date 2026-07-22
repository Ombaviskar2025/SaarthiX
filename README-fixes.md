# SaarthiX — AI Insights Page Fixes & Serverless Proxy Architecture

## 1. Diagnostics & Root Cause Summary

Prior to these changes, several widgets on `ai-insights.html` were permanently stuck in loading states or rendering empty tables:
- **Direct Browser-to-API Calls & CORS Failures**: Data fetches executed in the browser against third-party endpoints failed due to CORS restrictions or missing authorization headers, hanging silently on `"Analyzing..."`.
- **Missing Timeouts & Error States**: The frontend lacked request timeout handling and error states. If a fetch failed or hung, the loading skeleton remained indefinitely.
- **Empty State Handling**: Sector Momentum and Technical Signals lacked explicit empty array/null state handling.
- **Unwired Deep AI Analysis Search**: The ticker search and tab interface had placeholder handlers without end-to-end backend integration.

---

## 2. Changes Made & Architecture Overview

### Dedicated Vercel Serverless Proxy Layer (`/api/*.js`)
To protect API keys and ensure zero direct third-party browser calls, all data fetching was relocated to server-side Node.js proxy endpoints:

1. **`/api/sentiment.js`**: Aggregates index price trends and news sentiment (Finnhub / Yahoo Finance / Gemini). Returns market score, sentiment label (`Bullish`/`Neutral`/`Bearish`), advances/declines, and gauge rotation degrees.
2. **`/api/sector-momentum.js`**: Computes average price change (%) and momentum ratings (`Strong Up`, `Up`, `Neutral`, `Down`, `Strong Down`) across 10 major NSE sectors.
3. **`/api/technical-signals.js`**: Calculates NIFTY 50 vs 50/200 DMAs, % of NSE stocks above 50/200 DMAs, and 52W Highs/Lows count.
4. **`/api/stock-analysis.js`**: Handles `POST { ticker, tool }` for Deep AI Analysis (Thesis, Earnings, Valuation, Bear vs Bull, Insider Signal) using Gemini / Anthropic / ATB API or fallback market engine.
5. **`/api/fii-dii.js`**: Serves institutional flow estimates clearly labeled as **Simulated Data**.
6. **`/api/health.js`**: Lightweight server health check endpoint polled by the frontend.

### Frontend UI & Robust Error Handling (`ai-insights.html`)
- **Global "Data Connection Warning" Banner**: Polling `/api/health` displays a top alert banner when proxy health is degraded. Features a **Retry Connection** button that re-triggers data fetches for all failed widgets without reloading the page.
- **Strict 10-Second Abort Controller Timeout**: All `fetch()` calls enforce an `AbortController` timeout (10,000ms).
- **Three-State Widget Lifecycle**:
  - **Loading**: Pulse skeletons.
  - **Loaded**: Rendered metrics and charts.
  - **Error / Empty**: Inline error messages with dedicated **Retry** buttons and explicit empty states.
- **Deep AI Analysis Integration**: Wired ticker search and tool tabs (`stock-thesis`, `earnings-analysis`, `valuation-snapshot`, `bear-vs-bull`, `insider-signal`) to `POST /api/stock-analysis`.

---

## 3. Free API Tier Limits & Caching Strategy

To ensure operation within free-tier rate limits, every serverless proxy function implements server-side in-memory caching:

| API Provider | Free Tier Rate Limit | Server Caching Strategy | Target Endpoint |
|---|---|---|---|
| **Twelve Data** | 800 requests/day, 8 req/min | 60s in-memory cache per symbol | Price quotes (`.NS` tickers) |
| **Finnhub** | 60 requests/minute | 60s in-memory cache | Market News & Sentiment |
| **Marketaux / NewsAPI** | 100 requests/day | 60s in-memory cache | Headlines & Calendar events |
| **Gemini API** | 15 RPM / 1,500 RPD | 5-minute per-ticker/tool cache | LLM Investment Thesis |
| **Anthropic API** | Pay-as-you-go / Rate limited | 5-minute per-ticker/tool cache | LLM Investment Thesis |

### Caching Mechanism
- **Stock Analysis Cache**: 5-minute TTL per `${ticker}:${tool}` key to prevent redundant AI model invocations.
- **Sector & Sentiment Cache**: 60-second TTL on market-wide aggregations.

---

## 4. Verification & Testing Instructions

1. **Local Server Verification**:
   ```bash
   npm start
   ```
2. **Endpoint Health Checks**:
   - `GET /api/health` -> Status 200 `{ status: "OK" }`
   - `GET /api/sentiment` -> Status 200 `{ status: "SUCCESS", score: ..., sentiment: ... }`
   - `GET /api/sector-momentum` -> Status 200 `{ status: "SUCCESS", sectors: [...] }`
   - `GET /api/technical-signals` -> Status 200 `{ status: "SUCCESS", techSignals: {...} }`
   - `POST /api/stock-analysis` -> Status 200 `{ status: "SUCCESS", payload: {...} }`
3. **Frontend Error State Test**:
   - Disconnect network or invalidate an API endpoint.
   - Verify widget renders an inline error container with a functional **Retry** button.
   - Click **Retry** after reconnecting -> widget resolves cleanly without full page refresh.
