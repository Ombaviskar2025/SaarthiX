// ============================================================
//  seed-db.js — Creates the 'saarthix' database and collections in MongoDB
// ============================================================
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./lib/models/User');
const Holding = require('./lib/models/Holding');
const Watchlist = require('./lib/models/Watchlist');
const bcrypt = require('bcryptjs');

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/saarthix';
  console.log(`Connecting to MongoDB at: ${uri}...`);

  await mongoose.connect(uri);
  console.log('Connected successfully!');

  // Check if starter user exists
  let user = await User.findOne({ phone: '+919876543210' });
  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password@123', salt);
    user = await User.create({
      firstName: 'Om',
      lastName: 'Baviskar',
      phone: '+919876543210',
      email: 'om.baviskar@example.com',
      passwordHash
    });
    console.log(`Created default user: ${user.firstName} ${user.lastName} (${user.phone})`);
  } else {
    console.log(`User ${user.firstName} already exists.`);
  }

  // Seed default holdings if empty
  const holdingCount = await Holding.countDocuments({ userId: user._id });
  if (holdingCount === 0) {
    await Holding.create([
      { userId: user._id, ticker: 'INOXWIND', name: 'Inox Wind Limited', exchange: 'NSE', qty: 10, price: 50.00, ltp: 66.65 },
      { userId: user._id, ticker: 'RELIANCE', name: 'Reliance Industries', exchange: 'NSE', qty: 5, price: 2850.00, ltp: 2980.50 },
      { userId: user._id, ticker: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', qty: 4, price: 3800.00, ltp: 4120.00 }
    ]);
    console.log('Seeded default stock holdings.');
  }

  // Seed default watchlist if empty
  let wl = await Watchlist.findOne({ userId: user._id });
  if (!wl) {
    await Watchlist.create({
      userId: user._id,
      tickers: ['INOXWIND', 'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TATAMOTORS']
    });
    console.log('Seeded default watchlist.');
  }

  console.log('============================================================');
  console.log('Database "saarthix" created and seeded with collections:');
  console.log('- users');
  console.log('- holdings');
  console.log('- watchlists');
  console.log('============================================================');
  console.log('Refresh MongoDB Compass now! You will see "saarthix".');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
