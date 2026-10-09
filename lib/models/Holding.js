// ============================================================
//  lib/models/Holding.js — Per-User Portfolio Holding Model
// ============================================================
const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    ticker: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      trim: true
    },
    sector: {
      type: String,
      trim: true,
      default: 'EQUITIES'
    },
    exchange: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'NSE'
    },
    qty: {
      type: Number,
      required: true,
      min: 0.0001,
      default: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 100
    },
    ltp: {
      type: Number,
      default: null
    },
    changePct: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

holdingSchema.index({ userId: 1, ticker: 1 });

module.exports = mongoose.models.Holding || mongoose.model('Holding', holdingSchema);
