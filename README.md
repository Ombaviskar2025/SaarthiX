# SaarthiX — Groww Live Market Integration

SaarthiX now features integration with **Groww's Live Stock Data API** for real-time BSE & NSE prices, day change value, and percentage change. 

---

## ⚙️ Configuration & Environment Setup

To run with live data, create a `.env` file in the root directory (based on `.env.example`) and configure the following variables:

```ini
GROWW_ACCESS_TOKEN=your_bearer_token_here
PORT=3000
POLL_INTERVAL_MS=7000
```

### 🗝️ Obtaining the `GROWW_ACCESS_TOKEN`
1. Log in to your Groww web portal account in Chrome/Firefox.
2. Open Chrome Developer Tools (`F12`), select the **Network** tab, and filter by Fetch/XHR.
3. Reload or navigate the Groww dashboard, locate any request to `api.groww.in`.
4. Under request headers, look for the `Authorization` header.
5. Copy the JWT token part (everything after `Bearer `) and paste it into `.env` as the `GROWW_ACCESS_TOKEN`.

> [!WARNING]  
> **Daily Token Expiration:** Groww API access tokens expire daily at **6:00 AM IST**. You must extract a new token and update your `.env` file daily. 

---

## 🏃 Running the Application

This project runs on a single Express port (Port 3000) which serves both the frontend static site and acts as a secure backend API proxy to bypass CORS issues and keep your `GROWW_ACCESS_TOKEN` secret.

### Steps:
1. Ensure dependencies are installed (Express, CORS, Dotenv):
   ```bash
   npm install
   ```
2. Start the Express server:
   ```bash
   node server.js
   ```
3. Open your browser and navigate to:
   [http://localhost:3000/login.html](http://localhost:3000/login.html)

---

## 🔄 Graceful Fallback (Demo Mode)

If the server fails to connect to the Groww API, or if your `GROWW_ACCESS_TOKEN` is missing, expired, or invalid:
- SaarthiX will automatically detect this on the client side.
- A status banner showing **"Demo Mode (Simulated Data)"** will appear in the top header.
- The app will seamlessly fall back to local price simulation, ensuring a fully functional interactive experience without crashing.

---

## 📈 Stock Signal Studio & Quant Signal Scoring

The **Stock Signal Studio** in `portfolio.html` provides position-aware intelligence for Indian equities (NSE & BSE) using institutional-grade technical models and position analytics.

### 1. Signal Score Calculation (-100 to +100)
The quant trading signal evaluates real daily/weekly OHLCV candlestick data across **5 weighted quantitative pillars**:

| Pillar | Weight | Indicators Evaluated | Bullish Conditions | Bearish Conditions |
|---|---|---|---|---|
| **Trend** | **35%** | EMA 9, 21, 50, 200, Supertrend (10, 3), ADX (14) +DI/-DI | Price > EMA 200, Bullish EMA stack (9>21>50), Supertrend Green (+1), ADX > 25 with +DI > -DI | Price < EMA 200, Bearish EMA stack (9<21<50), Supertrend Red (-1), ADX > 25 with -DI > +DI |
| **Momentum** | **25%** | RSI (14), MACD (12, 26, 9) line & histogram, Stochastic (14, 3, 3) | RSI 45-65 trending up (or oversold reversal <30), MACD histogram > 0 & crossing signal upward, Stoch %K > %D | RSI > 70 (overbought) or < 40 falling, MACD histogram < 0 & crossing below signal line, Stoch %K < %D |
| **Volatility & Breakouts** | **15%** | Bollinger Bands (20, 2), ATR (14) | Price breaking upper Bollinger Band with expanding bandwidth, healthy ATR expansion | Price closing below lower band, band contraction breakdown |
| **Volume Confirmation** | **15%** | Volume vs 20-Day SMA Volume, On-Balance Volume (OBV) trend | Volume > 1.5x 20-day moving average on up days, rising OBV | Heavy volume on down days, falling OBV, declining volume on rallies |
| **Market Structure** | **10%** | Classic Pivot Points (P, R1, R2, S1, S2), 52-Week High/Low range, Swing Support/Resistance | Price bouncing from S1/S2 or major swing support, within 10% of 52-week highs | Price rejected at R1/R2 resistance, hovering within 5% of 52-week lows |

#### Score to Trading Verdict Mapping:
- **$\ge +60$**: `STRONG BUY` (Heavy green, strong trend & volume alignment)
- **$+25$ to $+59$**: `BUY` (Emerald, positive trend and constructive momentum)
- **$-24$ to $+24$**: `HOLD` (Amber, consolidation inside neutral range)
- **$-25$ to $-59$**: `SELL` (Rose, distribution, moving average breakdown)
- **$\le -60$**: `STRONG SELL` (Deep red, primary trend breakdown, death cross)

### 2. Position-Aware Advisor & Live Averaging
Using the user's actual holding parameters (`symbol`, `exchange`, `qty`, `avgBuyPrice`, `ltp`):
- **Trailing Stop-Loss**: 2x ATR below swing support or below Supertrend line.
- **Targets**: Target 1 (Conservative ATR / Pivot R1) and Target 2 (Aggressive Pivot R2 / 52W High).
- **Position Actions**: Automatically selects `ADD MORE`, `AVERAGE DOWN`, `HOLD`, `TRAIL STOP-LOSS`, `BOOK PARTIAL PROFIT`, or `EXIT`.
- **Live Averaging Calculator**: Dynamically computes the new average buy price, total position size, and required capital for extra quantities.
- **Budget 2024 Capital Gains Tax**: Accurately computes STCG (20%) or LTCG (12.5% above ₹1.25L exemption threshold).

### 3. Deploying to Vercel

The project is pre-configured for seamless deployment to Vercel via `vercel.json`:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: Add Stock Signal Studio with Lightweight Charts and quant engine"
   git push origin main
   ```
2. **Import into Vercel**:
   - Link your GitHub repository in the [Vercel Dashboard](https://vercel.com).
   - Set Framework Preset to **Other** (Root directory `./`).
3. **Serverless Functions**:
   - `/api/history.js` executes as a serverless Node.js function on Vercel, proxying historical data from Yahoo Finance with 5-minute caching (`Cache-Control: s-maxage=300`).
   - All client static files and scripts in `/js` (`indicators.js`, `signal.js`, `position.js`, `charts.js`, `backtest.js`) are served directly.
4. **Live Verification**:
   - Visit `https://your-deployment.vercel.app/portfolio.html`. INOXWIND and all user positions will render live interactive charts, overlays, signals, and backtest results.

