// ============================================================
//  lib/routes/auth.js — Authentication Endpoints (MongoDB + JWT)
// ============================================================
const express = require('express');
const bcrypt = require('bcryptjs');
const connectDB = require('../db');
const User = require('../models/User');
const Holding = require('../models/Holding');
const Watchlist = require('../models/Watchlist');
const { generateToken, setAuthCookie, clearAuthCookie, requireAuth } = require('../auth');
const { createRateLimiter, sanitizeString, normalizePhone, normalizeEmail } = require('../security');

const router = express.Router();

// Rate limiters
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: 'Too many authentication attempts.'
});

// Helper: Seed default starter holdings and watchlist for newly registered user
async function seedNewUserData(userId) {
  try {
    const existingHoldings = await Holding.find({ userId });
    if (existingHoldings.length === 0) {
      await Holding.insertMany([
        {
          userId,
          ticker: 'INOXWIND',
          name: 'Inox Wind Limited',
          sector: 'CLEAN ENERGY',
          exchange: 'NSE',
          qty: 10,
          price: 50.00,
          ltp: 66.65,
          changePct: 2.22
        },
        {
          userId,
          ticker: 'ZENSARTECH',
          name: 'Zensar Technologies Ltd',
          sector: 'IT SERVICES',
          exchange: 'NSE',
          qty: 150,
          price: 200.00,
          ltp: 810.40,
          changePct: 2.40
        },
        {
          userId,
          ticker: 'TATAMOTORS',
          name: 'Tata Motors Limited',
          sector: 'AUTOMOBILE',
          exchange: 'NSE',
          qty: 75,
          price: 620.50,
          ltp: 985.00,
          changePct: 1.10
        },
        {
          userId,
          ticker: 'HDFCBANK',
          name: 'HDFC Bank Ltd',
          sector: 'PRIVATE BANK',
          exchange: 'NSE',
          qty: 50,
          price: 1420.00,
          ltp: 1640.00,
          changePct: 0.70
        }
      ]);
    }

    const existingWl = await Watchlist.findOne({ userId });
    if (!existingWl) {
      await Watchlist.create({
        userId,
        tickers: ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'TATAMOTORS', 'BAJFINANCE', 'SBIN']
      });
    }
  } catch (err) {
    console.warn('Non-fatal: failed to seed default user data:', err.message);
  }
}

// ── 1. POST /api/auth/signup ─────────────────────────────────
router.post('/signup', authLimiter, async (req, res) => {
  try {
    await connectDB();

    let { firstName, lastName, phone, countryCode, email, password } = req.body;

    firstName = sanitizeString(firstName);
    lastName = sanitizeString(lastName);
    email = normalizeEmail(email);

    if (!firstName || firstName.length < 1) {
      return res.status(400).json({ status: 'FAILURE', field: 'firstName', error: 'First name is required.' });
    }
    if (!lastName || lastName.length < 1) {
      return res.status(400).json({ status: 'FAILURE', field: 'lastName', error: 'Last name is required.' });
    }

    // Process phone with country code e.g. +91
    let fullPhone = phone || '';
    if (countryCode && !fullPhone.startsWith('+')) {
      const codeDigits = countryCode.replace(/\D/g, '');
      const phoneDigits = fullPhone.replace(/\D/g, '');
      fullPhone = `+${codeDigits}${phoneDigits}`;
    } else {
      fullPhone = normalizePhone(fullPhone);
    }

    const rawDigitsOnly = fullPhone.replace(/\D/g, '');
    if (!fullPhone || rawDigitsOnly.length < 7) {
      return res.status(400).json({ status: 'FAILURE', field: 'phone', error: 'Please enter a valid phone number (at least 7 digits).' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ status: 'FAILURE', field: 'email', error: 'Please enter a valid email address.' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ status: 'FAILURE', field: 'password', error: 'Password must be at least 8 characters.' });
    }

    // Check duplicate phone
    const existingPhone = await User.findOne({ phone: fullPhone });
    if (existingPhone) {
      return res.status(409).json({
        status: 'FAILURE',
        field: 'phone',
        error: 'An account with this phone number already exists. Please log in.'
      });
    }

    // Check duplicate email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({
        status: 'FAILURE',
        field: 'email',
        error: 'An account with this email address already exists. Please log in.'
      });
    }

    // Hash password (10 salt rounds)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Save user to MongoDB
    const newUser = await User.create({
      firstName,
      lastName,
      phone: fullPhone,
      email,
      passwordHash
    });

    // Seed default holdings & watchlist for this user
    await seedNewUserData(newUser._id);

    // Issue JWT cookie
    const token = generateToken(newUser);
    setAuthCookie(res, token);

    return res.status(201).json({
      status: 'SUCCESS',
      message: 'Account created successfully',
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    console.error('[Auth Signup Error]:', error);
    // Handle Mongoose duplicate key error (code 11000)
    if (error.code === 11000) {
      const isEmail = error.keyPattern && error.keyPattern.email;
      return res.status(409).json({
        status: 'FAILURE',
        field: isEmail ? 'email' : 'phone',
        error: isEmail ? 'An account with this email already exists.' : 'An account with this phone number already exists.'
      });
    }
    return res.status(500).json({
      status: 'FAILURE',
      error: 'Server error creating account. Please try again.'
    });
  }
});

// ── 2. POST /api/auth/login ──────────────────────────────────
router.post('/login', authLimiter, async (req, res) => {
  try {
    await connectDB();

    let { phone, countryCode, password } = req.body;

    let fullPhone = phone || '';
    if (countryCode && !fullPhone.startsWith('+')) {
      const codeDigits = countryCode.replace(/\D/g, '');
      const phoneDigits = fullPhone.replace(/\D/g, '');
      fullPhone = `+${codeDigits}${phoneDigits}`;
    } else {
      fullPhone = normalizePhone(fullPhone);
    }

    if (!fullPhone || !password) {
      return res.status(400).json({
        status: 'FAILURE',
        error: 'Phone number and password are required.'
      });
    }

    // Generic error constant to avoid credential enumeration
    const genericErrorMsg = 'Invalid phone number or password.';

    const user = await User.findOne({ phone: fullPhone });
    if (!user) {
      return res.status(401).json({
        status: 'FAILURE',
        error: genericErrorMsg
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        status: 'FAILURE',
        error: genericErrorMsg
      });
    }

    // Issue JWT cookie
    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.json({
      status: 'SUCCESS',
      message: 'Logged in successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('[Auth Login Error]:', error);
    return res.status(500).json({
      status: 'FAILURE',
      error: 'Server error processing login. Please try again.'
    });
  }
});

// ── 3. POST /api/auth/logout ─────────────────────────────────
router.post('/logout', (req, res) => {
  try {
    clearAuthCookie(res);
    return res.json({
      status: 'SUCCESS',
      message: 'Logged out successfully'
    });
  } catch (error) {
    return res.status(500).json({ status: 'FAILURE', error: 'Failed to log out.' });
  }
});

// ── 4. GET /api/auth/me ──────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  try {
    await connectDB();
    const user = await User.findById(req.user.id).select('-passwordHash');

    if (!user) {
      clearAuthCookie(res);
      return res.status(401).json({
        status: 'UNAUTHORIZED',
        error: 'User account not found.'
      });
    }

    return res.json({
      status: 'SUCCESS',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('[Auth Me Error]:', error);
    return res.status(500).json({
      status: 'FAILURE',
      error: 'Failed to retrieve session user.'
    });
  }
});

module.exports = router;
