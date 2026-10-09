// ============================================================
//  lib/routes/user.js — Protected Per-User Data Endpoints (MongoDB)
// ============================================================
const express = require('express');
const connectDB = require('../db');
const Holding = require('../models/Holding');
const Watchlist = require('../models/Watchlist');
const MutualFund = require('../models/MutualFund');
const { requireAuth } = require('../auth');

const router = express.Router();

// All user routes require authentication
router.use(requireAuth);

// ── 1. PORTFOLIO HOLDINGS ─────────────────────────────────────

// GET /api/user/holdings — Get all holdings for the logged in user
router.get('/holdings', async (req, res) => {
  try {
    await connectDB();
    let holdings = await Holding.find({ userId: req.user.id }).sort({ createdAt: 1 });
    
    // Convert to client-friendly format (with id mapped to _id string)
    const formatted = holdings.map(h => ({
      id: h._id.toString(),
      _id: h._id.toString(),
      ticker: h.ticker,
      name: h.name || h.ticker,
      sector: h.sector || 'EQUITIES',
      exchange: h.exchange || 'NSE',
      qty: h.qty,
      price: h.price,
      ltp: h.ltp !== null && h.ltp !== undefined ? h.ltp : h.price,
      changePct: h.changePct || 0
    }));

    return res.json({ status: 'SUCCESS', holdings: formatted });
  } catch (err) {
    console.error('[User Holdings GET Error]:', err);
    return res.status(500).json({ status: 'FAILURE', error: 'Failed to load holdings.' });
  }
});

// POST /api/user/holdings — Add a single holding
router.post('/holdings', async (req, res) => {
  try {
    await connectDB();
    const { ticker, name, sector, exchange, qty, price, ltp, changePct } = req.body;

    if (!ticker) {
      return res.status(400).json({ status: 'FAILURE', error: 'Ticker symbol is required.' });
    }

    const newHolding = await Holding.create({
      userId: req.user.id,
      ticker: ticker.toUpperCase(),
      name: name || ticker,
      sector: sector || 'EQUITIES',
      exchange: exchange || 'NSE',
      qty: parseFloat(qty) || 1,
      price: parseFloat(price) || 100,
      ltp: ltp !== undefined ? parseFloat(ltp) : parseFloat(price) || 100,
      changePct: changePct !== undefined ? parseFloat(changePct) : 0
    });

    return res.status(201).json({
      status: 'SUCCESS',
      holding: {
        id: newHolding._id.toString(),
        _id: newHolding._id.toString(),
        ticker: newHolding.ticker,
        name: newHolding.name,
        sector: newHolding.sector,
        exchange: newHolding.exchange,
        qty: newHolding.qty,
        price: newHolding.price,
        ltp: newHolding.ltp,
        changePct: newHolding.changePct
      }
    });
  } catch (err) {
    console.error('[User Holding Add Error]:', err);
    return res.status(500).json({ status: 'FAILURE', error: 'Failed to add holding.' });
  }
});

// PUT /api/user/holdings/sync — Bulk replace/sync current holdings array
router.put('/holdings/sync', async (req, res) => {
  try {
    await connectDB();
    const { holdings } = req.body;

    if (!Array.isArray(holdings)) {
      return res.status(400).json({ status: 'FAILURE', error: 'Expected holdings array.' });
    }

    // Atomic wipe & insert for current user
    await Holding.deleteMany({ userId: req.user.id });

    if (holdings.length > 0) {
      const docs = holdings.map(h => ({
        userId: req.user.id,
        ticker: (h.ticker || 'STOCK').toUpperCase(),
        name: h.name || h.ticker || 'Company',
        sector: h.sector || 'EQUITIES',
        exchange: h.exchange || 'NSE',
        qty: parseFloat(h.qty) || 1,
        price: parseFloat(h.price) || 100,
        ltp: h.ltp !== undefined ? parseFloat(h.ltp) : parseFloat(h.price) || 100,
        changePct: parseFloat(h.changePct) || 0
      }));
      await Holding.insertMany(docs);
    }

    const saved = await Holding.find({ userId: req.user.id }).sort({ createdAt: 1 });
    const formatted = saved.map(h => ({
      id: h._id.toString(),
      _id: h._id.toString(),
      ticker: h.ticker,
      name: h.name,
      sector: h.sector,
      exchange: h.exchange,
      qty: h.qty,
      price: h.price,
      ltp: h.ltp,
      changePct: h.changePct
    }));

    return res.json({ status: 'SUCCESS', holdings: formatted });
  } catch (err) {
    console.error('[User Holdings Sync Error]:', err);
    return res.status(500).json({ status: 'FAILURE', error: 'Failed to synchronize holdings.' });
  }
});

// PUT /api/user/holdings/:id — Update single holding
router.put('/holdings/:id', async (req, res) => {
  try {
    await connectDB();
    const { qty, price, ltp, changePct } = req.body;
    const update = {};
    if (qty !== undefined) update.qty = parseFloat(qty);
    if (price !== undefined) update.price = parseFloat(price);
    if (ltp !== undefined) update.ltp = parseFloat(ltp);
    if (changePct !== undefined) update.changePct = parseFloat(changePct);

    const updated = await Holding.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: update },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ status: 'FAILURE', error: 'Holding not found.' });
    }

    return res.json({ status: 'SUCCESS', holding: updated });
  } catch (err) {
    console.error('[User Holding Update Error]:', err);
    return res.status(500).json({ status: 'FAILURE', error: 'Failed to update holding.' });
  }
});

// DELETE /api/user/holdings/:id — Delete single holding
router.delete('/holdings/:id', async (req, res) => {
  try {
    await connectDB();
    const deleted = await Holding.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) {
      return res.status(404).json({ status: 'FAILURE', error: 'Holding not found.' });
    }
    return res.json({ status: 'SUCCESS', message: 'Holding removed.' });
  } catch (err) {
    console.error('[User Holding Delete Error]:', err);
    return res.status(500).json({ status: 'FAILURE', error: 'Failed to remove holding.' });
  }
});

// ── 2. WATCHLIST ──────────────────────────────────────────────

// GET /api/user/watchlist — Get watchlist for logged in user
router.get('/watchlist', async (req, res) => {
  try {
    await connectDB();
    let wl = await Watchlist.findOne({ userId: req.user.id });
    if (!wl) {
      wl = await Watchlist.create({
        userId: req.user.id,
        tickers: ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'TATAMOTORS', 'BAJFINANCE', 'SBIN']
      });
    }
    return res.json({ status: 'SUCCESS', tickers: wl.tickers });
  } catch (err) {
    console.error('[User Watchlist GET Error]:', err);
    return res.status(500).json({ status: 'FAILURE', error: 'Failed to load watchlist.' });
  }
});

// PUT /api/user/watchlist — Set/Replace entire watchlist tickers
router.put('/watchlist', async (req, res) => {
  try {
    await connectDB();
    const { tickers } = req.body;
    if (!Array.isArray(tickers)) {
      return res.status(400).json({ status: 'FAILURE', error: 'Expected tickers array.' });
    }

    const cleanTickers = [...new Set(tickers.map(t => String(t).trim().toUpperCase()).filter(Boolean))];

    const wl = await Watchlist.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { tickers: cleanTickers } },
      { upsert: true, new: true }
    );

    return res.json({ status: 'SUCCESS', tickers: wl.tickers });
  } catch (err) {
    console.error('[User Watchlist PUT Error]:', err);
    return res.status(500).json({ status: 'FAILURE', error: 'Failed to save watchlist.' });
  }
});

// POST /api/user/watchlist/add — Add ticker to watchlist
router.post('/watchlist/add', async (req, res) => {
  try {
    await connectDB();
    const ticker = (req.body.ticker || '').trim().toUpperCase();
    if (!ticker) {
      return res.status(400).json({ status: 'FAILURE', error: 'Ticker symbol is required.' });
    }

    const wl = await Watchlist.findOneAndUpdate(
      { userId: req.user.id },
      { $addToSet: { tickers: ticker } },
      { upsert: true, new: true }
    );

    return res.json({ status: 'SUCCESS', tickers: wl.tickers });
  } catch (err) {
    console.error('[User Watchlist Add Error]:', err);
    return res.status(500).json({ status: 'FAILURE', error: 'Failed to add ticker to watchlist.' });
  }
});

// DELETE /api/user/watchlist/:ticker — Remove ticker from watchlist
router.delete('/watchlist/:ticker', async (req, res) => {
  try {
    await connectDB();
    const ticker = req.params.ticker.trim().toUpperCase();

    const wl = await Watchlist.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { tickers: ticker } },
      { new: true }
    );

    return res.json({ status: 'SUCCESS', tickers: wl ? wl.tickers : [] });
  } catch (err) {
    console.error('[User Watchlist Remove Error]:', err);
    return res.status(500).json({ status: 'FAILURE', error: 'Failed to remove ticker from watchlist.' });
  }
});

// ── 3. MUTUAL FUNDS ───────────────────────────────────────────

// GET /api/user/mutual-funds — Get saved mutual funds & risk profile
router.get('/mutual-funds', async (req, res) => {
  try {
    await connectDB();
    const mf = await MutualFund.findOne({ userId: req.user.id });
    return res.json({
      status: 'SUCCESS',
      holdings: mf ? mf.holdings : [],
      riskProfile: mf ? mf.riskProfile : 'Moderate'
    });
  } catch (err) {
    console.error('[User MutualFunds GET Error]:', err);
    return res.status(500).json({ status: 'FAILURE', error: 'Failed to load mutual fund data.' });
  }
});

// POST /api/user/mutual-funds — Save mutual funds & risk profile
router.post('/mutual-funds', async (req, res) => {
  try {
    await connectDB();
    const { holdings, riskProfile } = req.body;

    const update = {};
    if (Array.isArray(holdings)) update.holdings = holdings;
    if (riskProfile) update.riskProfile = riskProfile;

    const mf = await MutualFund.findOneAndUpdate(
      { userId: req.user.id },
      { $set: update },
      { upsert: true, new: true }
    );

    return res.json({
      status: 'SUCCESS',
      holdings: mf.holdings,
      riskProfile: mf.riskProfile
    });
  } catch (err) {
    console.error('[User MutualFunds POST Error]:', err);
    return res.status(500).json({ status: 'FAILURE', error: 'Failed to save mutual fund data.' });
  }
});

module.exports = router;
