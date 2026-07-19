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
