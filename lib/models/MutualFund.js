// ============================================================
//  lib/models/MutualFund.js — Per-User Mutual Fund Holdings & Profile
// ============================================================
const mongoose = require('mongoose');

const mutualFundSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    holdings: {
      type: Array,
      default: []
    },
    riskProfile: {
      type: String,
      default: 'Moderate'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.MutualFund || mongoose.model('MutualFund', mutualFundSchema);
