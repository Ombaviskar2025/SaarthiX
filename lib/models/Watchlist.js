// ============================================================
//  lib/models/Watchlist.js — Per-User Watchlist Model
// ============================================================
const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    tickers: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Watchlist || mongoose.model('Watchlist', watchlistSchema);
