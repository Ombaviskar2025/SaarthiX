// ============================================================
//  shared.js  —  SaarthiX Indian Market Data & Utilities
// ============================================================
'use strict';

// ── Market Indices ────────────────────────────────────────────
const INDICES = {
  sensex:       { id:'sensex',       name:'SENSEX',          value:80423.72, change:312.45,   changePct:0.39,  color:'#4edea3' },
  nifty50:      { id:'nifty50',      name:'NIFTY 50',        value:24398.15, change:89.30,    changePct:0.37,  color:'#4d8eff' },
  niftyBank:    { id:'niftyBank',    name:'BANK NIFTY',      value:52841.60, change:-124.85,  changePct:-0.24, color:'#ff516a' },
  niftyIT:      { id:'niftyIT',      name:'NIFTY IT',        value:38924.30, change:245.60,   changePct:0.63,  color:'#adc6ff' },
  niftyMidcap:  { id:'niftyMidcap',  name:'NIFTY MIDCAP',    value:56234.80, change:423.15,   changePct:0.76,  color:'#ffb2b7' },
};

// ── Master Stocks Database (Expanded List of NSE/BSE stocks) ──
const STOCKS_DB = [
  // Energy & Oil
  { ticker:'RELIANCE',   name:'Reliance Industries Ltd.',      exchange:'NSE', sector:'Energy',        price:1328.80,  change:34.20,   changePct:1.22,  volume:8234567,  mktCap:'19.3L Cr', pe:24.5, high52:3024.90,  low52:2180.45 },
  { ticker:'ONGC',       name:'Oil & Natural Gas Corp.',       exchange:'NSE', sector:'Energy',        price:247.27,   change:-2.15,   changePct:-0.75, volume:12456789, mktCap:'3.6L Cr',  pe:8.2,  high52:345.20,   low52:197.50  },
  { ticker:'BPCL',       name:'Bharat Petroleum Corp.',        exchange:'BSE', sector:'Energy',        price:315.00,   change:4.80,    changePct:1.56,  volume:5678901,  mktCap:'1.4L Cr',  pe:11.4, high52:376.50,   low52:224.80  },
  { ticker:'IOC',        name:'Indian Oil Corporation',        exchange:'NSE', sector:'Energy',        price:175.40,   change:2.10,    changePct:1.21,  volume:9823412,  mktCap:'2.4L Cr',  pe:10.5, high52:196.80,   low52:120.50  },
  { ticker:'HINDPETRO',  name:'Hindustan Petroleum Corp.',     exchange:'NSE', sector:'Energy',        price:410.20,   change:-3.40,   changePct:-0.82, volume:4523100,  mktCap:'0.8L Cr',  pe:9.4,  high52:456.00,   low52:250.10  },
  { ticker:'GAIL',       name:'GAIL (India) Ltd.',             exchange:'NSE', sector:'Energy',        price:173.99,   change:1.80,    changePct:1.05,  volume:11234500, mktCap:'1.1L Cr',  pe:12.4, high52:246.00,   low52:130.00  },
  { ticker:'PETRONET',   name:'Petronet LNG Ltd.',             exchange:'NSE', sector:'Energy',        price:340.50,   change:3.20,    changePct:0.95,  volume:3456789,  mktCap:'0.5L Cr',  pe:11.8, high52:380.00,   low52:210.00  },

  // IT & Tech
  { ticker:'TCS',        name:'Tata Consultancy Services',     exchange:'NSE', sector:'IT',            price:2266.00,  change:-28.35,  changePct:-0.72, volume:2134892,  mktCap:'14.2L Cr', pe:31.2, high52:4592.25,  low52:3311.80 },
  { ticker:'INFY',       name:'Infosys Ltd.',                  exchange:'NSE', sector:'IT',            price:1094.20,  change:18.90,   changePct:1.18,  volume:4523781,  mktCap:'6.8L Cr',  pe:27.4, high52:1992.25,  low52:1356.20 },
  { ticker:'WIPRO',      name:'Wipro Ltd.',                    exchange:'NSE', sector:'IT',            price:175.90,   change:-3.45,   changePct:-0.64, volume:3892456,  mktCap:'2.8L Cr',  pe:22.1, high52:648.80,   low52:424.15  },
  { ticker:'HCLTECH',    name:'HCL Technologies Ltd.',         exchange:'NSE', sector:'IT',            price:1203.90,  change:22.10,   changePct:1.30,  volume:2345678,  mktCap:'4.7L Cr',  pe:25.8, high52:1980.70,  low52:1244.60 },
  { ticker:'TECHM',      name:'Tech Mahindra Ltd.',            exchange:'NSE', sector:'IT',            price:1572.90,  change:15.30,   changePct:1.01,  volume:1234567,  mktCap:'1.5L Cr',  pe:38.5, high52:1765.90,  low52:1097.45 },
  { ticker:'ZENSARTECH', name:'Zensar Technologies Limited',   exchange:'NSE', sector:'IT',            price:435.00,   change:12.90,   changePct:3.06,  volume:1425000,  mktCap:'0.98L Cr', pe:21.8, high52:822.00,   low52:416.15  },
  { ticker:'LTIM',       name:'LTIMindtree Ltd.',              exchange:'NSE', sector:'IT',            price:5890.00,  change:45.00,   changePct:0.77,  volume:876543,   mktCap:'1.7L Cr',  pe:36.4, high52:6750.00,  low52:4500.00 },
  { ticker:'PERSISTENT', name:'Persistent Systems Ltd.',       exchange:'NSE', sector:'IT',            price:5210.00,  change:68.00,   changePct:1.32,  volume:654321,   mktCap:'0.8L Cr',  pe:48.2, high52:5900.00,  low52:3200.00 },
  { ticker:'COFORGE',    name:'Coforge Ltd.',                  exchange:'NSE', sector:'IT',            price:7850.00,  change:-34.00,  changePct:-0.43, volume:432109,   mktCap:'0.5L Cr',  pe:42.1, high52:8400.00,  low52:4800.00 },
  { ticker:'MPHASIS',    name:'Mphasis Ltd.',                  exchange:'NSE', sector:'IT',            price:2940.00,  change:24.00,   changePct:0.82,  volume:543210,   mktCap:'0.5L Cr',  pe:32.6, high52:3300.00,  low52:2100.00 },
  { ticker:'TATAELXSI',  name:'Tata Elxsi Ltd.',               exchange:'NSE', sector:'IT',            price:6820.00,  change:-45.00,  changePct:-0.65, volume:321098,   mktCap:'0.4L Cr',  pe:52.4, high52:8900.00,  low52:6200.00 },
  { ticker:'KPITTECH',   name:'KPIT Technologies Ltd.',        exchange:'NSE', sector:'IT',            price:1640.00,  change:18.50,   changePct:1.14,  volume:1234567,  mktCap:'0.4L Cr',  pe:58.2, high52:1900.00,  low52:1100.00 },
  { ticker:'DIXON',      name:'Dixon Technologies (India) Ltd',exchange:'NSE', sector:'Tech',          price:14850.00, change:185.00,  changePct:1.26,  volume:845000,   mktCap:'0.89L Cr', pe:85.4, high52:16200.00, low52:8500.00 },
  { ticker:'IRCTC',      name:'IRCTC Ltd.',                    exchange:'NSE', sector:'Logistics',     price:835.50,   change:8.20,    changePct:0.99,  volume:2890000,  mktCap:'0.67L Cr', pe:52.4, high52:1138.00,  low52:680.00  },

  // Banking & Financials
  { ticker:'HDFCBANK',   name:'HDFC Bank Ltd.',                exchange:'NSE', sector:'Banking',       price:820.80,   change:-12.40,  changePct:-0.69, volume:9876543,  mktCap:'13.6L Cr', pe:21.3, high52:1979.90,  low52:1363.55 },
  { ticker:'ICICIBANK',  name:'ICICI Bank Ltd.',               exchange:'NSE', sector:'Banking',       price:1454.00,  change:14.25,   changePct:1.16,  volume:11234567, mktCap:'8.7L Cr',  pe:18.7, high52:1388.35,  low52:945.75  },
  { ticker:'KOTAKBANK',  name:'Kotak Mahindra Bank Ltd.',      exchange:'NSE', sector:'Banking',       price:390.70,   change:-8.90,   changePct:-0.47, volume:3456789,  mktCap:'3.8L Cr',  pe:19.8, high52:2196.50,  low52:1620.00 },
  { ticker:'AXISBANK',   name:'Axis Bank Ltd.',                exchange:'NSE', sector:'Banking',       price:1329.40,  change:9.75,    changePct:0.85,  volume:7654321,  mktCap:'3.6L Cr',  pe:16.4, high52:1339.65,  low52:895.45  },
  { ticker:'SBIN',       name:'State Bank of India',           exchange:'NSE', sector:'Banking',       price:1043.20,  change:6.20,    changePct:0.76,  volume:18234567, mktCap:'7.4L Cr',  pe:12.1, high52:912.10,   low52:543.20  },
  { ticker:'INDUSINDBK', name:'IndusInd Bank Ltd.',            exchange:'NSE', sector:'Banking',       price:1026.10,  change:-18.30,  changePct:-1.78, volume:4321098,  mktCap:'0.8L Cr',  pe:14.2, high52:1694.50,  low52:853.60  },
  { ticker:'PNB',        name:'Punjab National Bank',          exchange:'NSE', sector:'Banking',       price:108.50,   change:1.20,    changePct:1.12,  volume:25432100, mktCap:'1.2L Cr',  pe:11.2, high52:142.00,   low52:76.00   },
  { ticker:'BANKBARODA', name:'Bank of Baroda',                exchange:'NSE', sector:'Banking',       price:254.10,   change:3.40,    changePct:1.36,  volume:18765432, mktCap:'1.3L Cr',  pe:7.8,  high52:298.00,   low52:190.00  },
  { ticker:'CANBK',      name:'Canara Bank',                   exchange:'NSE', sector:'Banking',       price:102.30,   change:-0.80,   changePct:-0.78, volume:16543210, mktCap:'0.9L Cr',  pe:6.9,  high52:128.00,   low52:72.00   },
  { ticker:'UNIONBANK',  name:'Union Bank of India',           exchange:'NSE', sector:'Banking',       price:124.80,   change:1.50,    changePct:1.22,  volume:12345670, mktCap:'0.9L Cr',  pe:6.4,  high52:172.00,   low52:88.00   },
  { ticker:'IDFCFIRSTB', name:'IDFC FIRST Bank Ltd.',          exchange:'NSE', sector:'Banking',       price:72.40,    change:-0.60,   changePct:-0.82, volume:21098765, mktCap:'0.5L Cr',  pe:18.5, high52:90.00,    low52:68.00   },
  { ticker:'FEDERALBNK', name:'Federal Bank Ltd.',             exchange:'NSE', sector:'Banking',       price:204.50,   change:2.80,    changePct:1.39,  volume:14321098, mktCap:'0.5L Cr',  pe:12.8, high52:215.00,   low52:138.00  },
  { ticker:'YESBANK',    name:'YES Bank Ltd.',                 exchange:'NSE', sector:'Banking',       price:23.14,    change:0.35,    changePct:1.54,  volume:85432100, mktCap:'0.7L Cr',  pe:54.2, high52:32.80,    low52:17.20   },

  // NBFC & Finance
  { ticker:'BAJFINANCE', name:'Bajaj Finance Ltd.',            exchange:'NSE', sector:'NBFC',          price:1055.30,  change:45.80,   changePct:0.67,  volume:1234567,  mktCap:'4.2L Cr',  pe:35.4, high52:8192.45,  low52:6186.70 },
  { ticker:'BAJAJFINSV', name:'Bajaj Finserv Ltd.',            exchange:'NSE', sector:'NBFC',          price:1854.00,  change:12.35,   changePct:0.73,  volume:987654,   mktCap:'2.7L Cr',  pe:28.6, high52:1990.30,  low52:1419.25 },
  { ticker:'JIOFIN',     name:'Jio Financial Services Ltd.',   exchange:'NSE', sector:'NBFC',          price:240.03,   change:3.45,    changePct:1.46,  volume:34567890, mktCap:'2.0L Cr',  pe:120.4,high52:394.70,   low52:205.00  },
  { ticker:'IRFC',       name:'Indian Railway Finance Corp.',  exchange:'NSE', sector:'NBFC',          price:88.31,    change:1.25,    changePct:1.44,  volume:45678901, mktCap:'1.8L Cr',  pe:32.4, high52:229.00,   low52:72.00   },
  { ticker:'PFC',        name:'Power Finance Corp.',           exchange:'NSE', sector:'NBFC',          price:480.20,   change:5.40,    changePct:1.14,  volume:12345678, mktCap:'1.6L Cr',  pe:8.2,  high52:580.00,   low52:350.00  },
  { ticker:'RECLTD',     name:'REC Ltd.',                      exchange:'NSE', sector:'NBFC',          price:512.40,   change:6.80,    changePct:1.34,  volume:14567890, mktCap:'1.4L Cr',  pe:8.6,  high52:650.00,   low52:380.00  },
  { ticker:'SHRIRAMFIN', name:'Shriram Finance Ltd.',          exchange:'NSE', sector:'NBFC',          price:3240.00,  change:28.00,   changePct:0.87,  volume:2345678,  mktCap:'1.2L Cr',  pe:16.2, high52:3600.00,  low52:2100.00 },
  { ticker:'MUTHOOTFIN', name:'Muthoot Finance Ltd.',          exchange:'NSE', sector:'NBFC',          price:1980.00,  change:-14.00,  changePct:-0.70, volume:1234567,  mktCap:'0.8L Cr',  pe:18.4, high52:2150.00,  low52:1250.00 },
  { ticker:'CDSL',       name:'Central Depository Services Ltd',exchange:'NSE', sector:'NBFC',          price:1480.00,  change:22.00,   changePct:1.51,  volume:3456789,  mktCap:'0.3L Cr',  pe:58.4, high52:1750.00,  low52:850.00  },
  { ticker:'BSE',        name:'BSE Ltd.',                      exchange:'NSE', sector:'NBFC',          price:4650.00,  change:85.00,   changePct:1.86,  volume:2345678,  mktCap:'0.6L Cr',  pe:68.2, high52:5100.00,  low52:1900.00 },

  // Auto & Mobility
  { ticker:'MARUTI',     name:'Maruti Suzuki India Ltd.',      exchange:'NSE', sector:'Auto',          price:13824.00, change:124.35,  changePct:1.12,  volume:456789,   mktCap:'3.4L Cr',  pe:28.9, high52:13680.00, low52:9862.50 },
  { ticker:'TATAMOTORS', name:'Tata Motors Ltd.',              exchange:'NSE', sector:'Auto',          price:411.75,   change:-4.80,   changePct:-1.15, volume:18765432, mktCap:'2.8L Cr',  pe:11.2, high52:1179.00,  low52:390.00  },
  { ticker:'HEROMOTOCO', name:'Hero MotoCorp Ltd.',            exchange:'NSE', sector:'Auto',          price:4906.00,  change:38.20,   changePct:0.80,  volume:345678,   mktCap:'0.96L Cr', pe:22.4, high52:5916.00,  low52:3990.55 },
  { ticker:'EICHERMOT',  name:'Eicher Motors Ltd.',            exchange:'NSE', sector:'Auto',          price:7556.00,  change:45.30,   changePct:0.84,  volume:234567,   mktCap:'1.5L Cr',  pe:32.8, high52:5828.00,  low52:3804.20 },
  { ticker:'M&M',        name:'Mahindra & Mahindra Ltd.',      exchange:'NSE', sector:'Auto',          price:3178.90,  change:28.65,   changePct:1.03,  volume:2345678,  mktCap:'3.5L Cr',  pe:26.7, high52:3222.90,  low52:1694.90 },
  { ticker:'BAJAJ-AUTO', name:'Bajaj Auto Ltd.',               exchange:'NSE', sector:'Auto',          price:10439.50, change:56.40,   changePct:0.64,  volume:345678,   mktCap:'2.6L Cr',  pe:30.5, high52:12774.35, low52:7408.80 },
  { ticker:'TRENT',      name:'Trent Ltd.',                    exchange:'NSE', sector:'Consumer',      price:7120.00,  change:140.00,  changePct:2.01,  volume:1876543,  mktCap:'2.5L Cr',  pe:145.0,high52:8300.00,  low52:2800.00 },

  // Green Energy & Power
  { ticker:'TATAPOWER',  name:'Tata Power Company Ltd.',       exchange:'NSE', sector:'Utilities',     price:381.45,   change:4.50,    changePct:1.19,  volume:24567890, mktCap:'1.2L Cr',  pe:34.5, high52:494.00,   low52:230.00  },
  { ticker:'SUZLON',     name:'Suzlon Energy Ltd.',            exchange:'NSE', sector:'Utilities',     price:53.17,    change:0.85,    changePct:1.62,  volume:68901234, mktCap:'0.7L Cr',  pe:78.4, high52:86.00,    low52:24.00   },
  { ticker:'POWERGRID',  name:'Power Grid Corp. of India',     exchange:'NSE', sector:'Utilities',     price:283.20,   change:2.80,    changePct:0.82,  volume:9876543,  mktCap:'3.2L Cr',  pe:19.4, high52:366.25,   low52:205.40  },
  { ticker:'NTPC',       name:'NTPC Ltd.',                     exchange:'NSE', sector:'Utilities',     price:341.90,   change:3.45,    changePct:0.84,  volume:12345678, mktCap:'4.0L Cr',  pe:16.2, high52:448.45,   low52:213.05  },
  { ticker:'ADANIPOWER', name:'Adani Power Ltd.',              exchange:'NSE', sector:'Utilities',     price:620.50,   change:-8.40,   changePct:-1.34, volume:15432109, mktCap:'2.4L Cr',  pe:18.5, high52:896.00,   low52:320.00  },
  { ticker:'ADANIGREEN', name:'Adani Green Energy Ltd.',       exchange:'NSE', sector:'Utilities',     price:1540.00,  change:18.00,   changePct:1.18,  volume:5432109,  mktCap:'2.4L Cr',  pe:180.0,high52:2170.00,  low52:920.00  },
  { ticker:'SJVN',       name:'SJVN Ltd.',                     exchange:'NSE', sector:'Utilities',     price:112.40,   change:1.80,    changePct:1.63,  volume:18765432, mktCap:'0.4L Cr',  pe:42.1, high52:160.00,   low52:68.00   },
  { ticker:'NHPC',       name:'NHPC Ltd.',                     exchange:'NSE', sector:'Utilities',     price:88.50,    change:0.90,    changePct:1.03,  volume:22345678, mktCap:'0.9L Cr',  pe:24.5, high52:118.00,   low52:58.00   },

  // Defense & Capital Goods
  { ticker:'HAL',        name:'Hindustan Aeronautics Ltd.',    exchange:'NSE', sector:'Defense',       price:4581.70,  change:68.50,   changePct:1.52,  volume:3456789,  mktCap:'3.0L Cr',  pe:38.2, high52:5670.00,  low52:1850.00 },
  { ticker:'BEL',        name:'Bharat Electronics Ltd.',       exchange:'NSE', sector:'Defense',       price:410.05,   change:5.80,    changePct:1.43,  volume:28765432, mktCap:'2.1L Cr',  pe:48.5, high52:340.00,   low52:130.00  },
  { ticker:'BHEL',       name:'Bharat Heavy Electricals Ltd.', exchange:'NSE', sector:'Defense',       price:413.30,   change:4.20,    changePct:1.03,  volume:19876543, mktCap:'0.9L Cr',  pe:110.0,high52:335.00,   low52:125.00  },
  { ticker:'MAHDOCK',    name:'Mazagon Dock Shipbuilders Ltd.',exchange:'NSE', sector:'Defense',       price:4250.00,  change:82.00,   changePct:1.97,  volume:2345678,  mktCap:'0.8L Cr',  pe:45.0, high52:5860.00,  low52:1800.00 },
  { ticker:'LT',         name:'Larsen & Toubro Ltd.',          exchange:'NSE', sector:'Infrastructure',price:3817.90,  change:28.40,   changePct:0.84,  volume:1234567,  mktCap:'4.9L Cr',  pe:34.2, high52:3994.00,  low52:2727.50 },

  // New-Age Tech & Retail
  { ticker:'PAYTM',      name:'One 97 Communications Ltd.',    exchange:'NSE', sector:'Tech',          price:1300.50,  change:18.00,   changePct:1.40,  volume:12345678, mktCap:'0.5L Cr',  pe:65.0, high52:1350.00,  low52:310.00  },
  { ticker:'POLICYBZR',  name:'PB Fintech Ltd. (Policybazaar)',exchange:'NSE', sector:'Tech',          price:1720.00,  change:24.00,   changePct:1.41,  volume:2345678,  mktCap:'0.8L Cr',  pe:110.0,high52:1960.00,  low52:720.00  },
  { ticker:'ZOMATO',     name:'Zomato Ltd. / Eternal',         exchange:'NSE', sector:'Tech',          price:268.40,   change:4.50,    changePct:1.71,  volume:45678901, mktCap:'2.4L Cr',  pe:130.0,high52:305.00,   low52:115.00  },
  { ticker:'NYKAA',      name:'FSN E-Commerce (Nykaa)',        exchange:'NSE', sector:'Tech',          price:198.50,   change:-1.80,   changePct:-0.90, volume:8765432,  mktCap:'0.5L Cr',  pe:140.0,high52:228.00,   low52:140.00  },
  { ticker:'DELHIVERY',  name:'Delhivery Ltd.',                exchange:'NSE', sector:'Logistics',     price:395.00,   change:4.20,    changePct:1.07,  volume:3456789,  mktCap:'0.3L Cr',  pe:85.0, high52:488.00,   low52:340.00  },

  // Consumer & FMCG
  { ticker:'HINDUNILVR', name:'Hindustan Unilever Ltd.',       exchange:'NSE', sector:'FMCG',          price:2140.00,  change:-15.20,  changePct:-0.62, volume:2345678,  mktCap:'5.8L Cr',  pe:55.2, high52:2964.60,  low52:2183.40 },
  { ticker:'ITC',        name:'ITC Ltd.',                      exchange:'NSE', sector:'FMCG',          price:280.50,   change:3.40,    changePct:0.73,  volume:15678901, mktCap:'5.9L Cr',  pe:27.8, high52:528.55,   low52:399.35  },
  { ticker:'NESTLEIND',  name:'Nestle India Ltd.',             exchange:'BSE', sector:'FMCG',          price:1427.80,  change:18.45,   changePct:0.80,  volume:456789,   mktCap:'2.2L Cr',  pe:78.4, high52:2778.00,  low52:2104.90 },
  { ticker:'BRITANNIA',  name:'Britannia Industries Ltd.',     exchange:'NSE', sector:'FMCG',          price:5415.00,  change:-22.45,  changePct:-0.41, volume:234567,   mktCap:'1.3L Cr',  pe:56.7, high52:6012.00,  low52:4512.10 },
  { ticker:'TATACONSUM', name:'Tata Consumer Products Ltd.',   exchange:'NSE', sector:'FMCG',          price:1088.80,  change:8.90,    changePct:0.74,  volume:1234567,  mktCap:'1.1L Cr',  pe:64.2, high52:1388.75,  low52:947.30  },
  { ticker:'VBL',        name:'Varun Beverages Ltd.',          exchange:'NSE', sector:'FMCG',          price:463.45,   change:6.80,    changePct:1.49,  volume:18765432, mktCap:'1.5L Cr',  pe:62.4, high52:680.00,   low52:340.00  },
  { ticker:'DABUR',      name:'Dabur India Ltd.',              exchange:'NSE', sector:'FMCG',          price:540.20,   change:3.10,    changePct:0.58,  volume:3456789,  mktCap:'0.9L Cr',  pe:52.1, high52:670.00,   low52:490.00  },
  { ticker:'MARICO',     name:'Marico Ltd.',                   exchange:'NSE', sector:'FMCG',          price:635.00,   change:5.40,    changePct:0.86,  volume:2345678,  mktCap:'0.8L Cr',  pe:54.6, high52:715.00,   low52:480.00  },

  // Pharma & Healthcare
  { ticker:'SUNPHARMA',  name:'Sun Pharmaceutical Ind.',       exchange:'NSE', sector:'Pharma',        price:1934.00,  change:14.20,   changePct:0.76,  volume:2345678,  mktCap:'4.5L Cr',  pe:38.2, high52:2175.00,  low52:1375.75 },
  { ticker:'DRREDDY',    name:"Dr. Reddy's Laboratories",      exchange:'NSE', sector:'Pharma',        price:1210.30,  change:-34.15,  changePct:-0.50, volume:456789,   mktCap:'1.1L Cr',  pe:24.6, high52:7645.00,  low52:5231.45 },
  { ticker:'CIPLA',      name:'Cipla Ltd.',                    exchange:'NSE', sector:'Pharma',        price:1419.50,  change:12.45,   changePct:0.78,  volume:1234567,  mktCap:'1.3L Cr',  pe:31.4, high52:1765.00,  low52:1148.80 },
  { ticker:'DIVISLAB',   name:"Divi's Laboratories Ltd.",      exchange:'NSE', sector:'Pharma',        price:7247.50,  change:-22.30,  changePct:-0.46, volume:234567,   mktCap:'1.3L Cr',  pe:68.4, high52:5390.00,  low52:3360.25 },
  { ticker:'APOLLOHOSP', name:'Apollo Hospitals Enterprise',   exchange:'NSE', sector:'Healthcare',    price:8820.00,  change:45.80,   changePct:0.64,  volume:234567,   mktCap:'1.0L Cr',  pe:102.4,high52:7265.00,  low52:4846.50 },
  { ticker:'LUPIN',      name:'Lupin Ltd.',                    exchange:'NSE', sector:'Pharma',        price:2150.00,  change:28.00,   changePct:1.32,  volume:1876543,  mktCap:'0.9L Cr',  pe:38.4, high52:2300.00,  low52:1100.00 },
  { ticker:'ZYDUSLIFE',  name:'Zydus Lifesciences Ltd.',       exchange:'NSE', sector:'Pharma',        price:1020.00,  change:12.00,   changePct:1.19,  volume:2345678,  mktCap:'1.0L Cr',  pe:28.6, high52:1320.00,  low52:620.00  },

  // Metals & Mining
  { ticker:'TATASTEEL',  name:'Tata Steel Ltd.',               exchange:'NSE', sector:'Metals',        price:185.75,   change:-2.80,   changePct:-1.69, volume:34567890, mktCap:'2.0L Cr',  pe:22.4, high52:184.60,   low52:120.60  },
  { ticker:'JSWSTEEL',   name:'JSW Steel Ltd.',                exchange:'NSE', sector:'Metals',        price:1235.00,  change:-8.45,   changePct:-0.91, volume:4567890,  mktCap:'2.3L Cr',  pe:26.8, high52:1062.00,  low52:782.10  },
  { ticker:'HINDALCO',   name:'Hindalco Industries Ltd.',      exchange:'NSE', sector:'Metals',        price:945.05,   change:6.80,    changePct:0.96,  volume:5678901,  mktCap:'1.6L Cr',  pe:18.2, high52:770.40,   low52:452.85  },
  { ticker:'COALINDIA',  name:'Coal India Ltd.',               exchange:'NSE', sector:'Mining',        price:427.60,   change:4.15,    changePct:0.80,  volume:7890123,  mktCap:'3.2L Cr',  pe:9.8,  high52:543.55,   low52:382.65  },
  { ticker:'VEDL',       name:'Vedanta Ltd.',                  exchange:'NSE', sector:'Metals',        price:465.20,   change:8.40,    changePct:1.84,  volume:24567890, mktCap:'1.7L Cr',  pe:14.2, high52:515.00,   low52:210.00  },
  { ticker:'JINDALSTEL', name:'Jindal Steel & Power Ltd.',     exchange:'NSE', sector:'Metals',        price:920.00,   change:12.00,   changePct:1.32,  volume:4567890,  mktCap:'0.9L Cr',  pe:18.4, high52:1080.00,  low52:640.00  },
  { ticker:'NMDC',       name:'NMDC Ltd.',                     exchange:'NSE', sector:'Mining',        price:228.40,   change:2.80,    changePct:1.24,  volume:18765432, mktCap:'0.6L Cr',  pe:10.5, high52:286.00,   low52:160.00  },

  // Telecom & Logistics
  { ticker:'BHARTIARTL', name:'Bharti Airtel Ltd.',            exchange:'NSE', sector:'Telecom',       price:1908.00,  change:18.60,   changePct:1.15,  volume:5678901,  mktCap:'9.8L Cr',  pe:82.4, high52:1779.00,  low52:977.15  },
  { ticker:'IDEA',       name:'Vodafone Idea Ltd.',            exchange:'NSE', sector:'Telecom',       price:8.90,     change:0.15,    changePct:1.71,  volume:145678900,mktCap:'0.6L Cr',  pe:-1.2, high52:18.40,    low52:6.80    },
  { ticker:'ADANIPORTS', name:'Adani Ports & SEZ Ltd.',        exchange:'NSE', sector:'Logistics',     price:1836.50,  change:12.45,   changePct:0.89,  volume:3456789,  mktCap:'3.0L Cr',  pe:28.6, high52:1621.35,  low52:869.65  },

  // Cement & Conglomerates
  { ticker:'ULTRACEMCO', name:'UltraTech Cement Ltd.',         exchange:'NSE', sector:'Cement',        price:11685.00, change:124.30,  changePct:1.06,  volume:345678,   mktCap:'3.4L Cr',  pe:46.8, high52:12684.85, low52:8894.55 },
  { ticker:'GRASIM',     name:'Grasim Industries Ltd.',        exchange:'NSE', sector:'Cement',        price:3111.50,  change:18.40,   changePct:0.66,  volume:456789,   mktCap:'1.9L Cr',  pe:22.4, high52:2889.75,  low52:1885.45 },
  { ticker:'SHREECEM',   name:'Shree Cement Ltd.',             exchange:'BSE', sector:'Cement',        price:25412.30, change:-124.30, changePct:-0.46, volume:56789,    mktCap:'0.97L Cr', pe:48.6, high52:29449.00, low52:21217.15},
  { ticker:'ADANIENT',   name:'Adani Enterprises Ltd.',        exchange:'NSE', sector:'Conglomerate',  price:3155.00,  change:-34.20,  changePct:-1.16, volume:2345678,  mktCap:'3.3L Cr',  pe:98.4, high52:3743.90,  low52:2014.55 },
  { ticker:'ASIANPAINT', name:'Asian Paints Ltd.',             exchange:'NSE', sector:'Consumer',      price:2690.00,  change:-14.30,  changePct:-0.62, volume:1234567,  mktCap:'2.2L Cr',  pe:52.4, high52:3394.00,  low52:2174.00 },
  { ticker:'TITAN',      name:'Titan Company Ltd.',            exchange:'NSE', sector:'Consumer',      price:4632.00,  change:28.45,   changePct:0.84,  volume:987654,   mktCap:'3.0L Cr',  pe:92.4, high52:3887.00,  low52:3054.35 },
  { ticker:'HDFCLIFE',   name:'HDFC Life Insurance Co.',       exchange:'NSE', sector:'Insurance',     price:564.00,   change:4.80,    changePct:0.67,  volume:2345678,  mktCap:'1.6L Cr',  pe:82.4, high52:791.90,   low52:511.40  },
  { ticker:'SBILIFE',    name:'SBI Life Insurance Co.',        exchange:'NSE', sector:'Insurance',     price:1828.80,  change:8.90,    changePct:0.55,  volume:1234567,  mktCap:'1.6L Cr',  pe:64.2, high52:1921.85,  low52:1199.00 },
  { ticker:'UPL',        name:'UPL Ltd.',                      exchange:'NSE', sector:'Agro Chem',     price:614.20,   change:-4.20,   changePct:-0.80, volume:3456789,  mktCap:'0.4L Cr',  pe:28.4, high52:660.15,   low52:378.85  },

  // High-Growth & Popular Midcaps / Clean Energy
  { ticker:'INOXWIND',   name:'Inox Wind Limited',             exchange:'NSE', sector:'Clean Energy',  price:66.65,    change:1.45,    changePct:2.22,  volume:34500000, mktCap:'0.87L Cr', pe:42.5, high52:159.30,  low52:62.43   },
  { ticker:'SUZLON',     name:'Suzlon Energy Ltd.',            exchange:'NSE', sector:'Clean Energy',  price:58.20,    change:1.20,    changePct:2.11,  volume:62000000, mktCap:'0.79L Cr', pe:38.2, high52:86.00,   low52:37.50   },
  { ticker:'ZOMATO',     name:'Zomato Limited',                exchange:'NSE', sector:'Internet/Tech', price:245.80,   change:4.50,    changePct:1.86,  volume:45000000, mktCap:'2.18L Cr', pe:115.0,high52:298.00,  low52:150.00  },
  { ticker:'IREDA',      name:'Indian Renewable Energy Dev',   exchange:'NSE', sector:'Finance/Energy',price:188.50,   change:3.80,    changePct:2.06,  volume:28000000, mktCap:'0.51L Cr', pe:35.8, high52:310.00,  low52:135.00  },
  { ticker:'CDSL',       name:'Central Depository Services Ltd',exchange:'NSE',sector:'Finance/Market',price:1520.00,  change:22.50,   changePct:1.50,  volume:4200000,  mktCap:'0.32L Cr', pe:52.0, high52:1900.00,  low52:950.00  },
  { ticker:'PAYTM',      name:'One97 Communications Ltd',      exchange:'NSE', sector:'Fintech',       price:810.00,   change:15.00,   changePct:1.89,  volume:12000000, mktCap:'0.52L Cr', pe:-45.0,high52:1050.00,  low52:310.00  },
  { ticker:'TATAPOWER',  name:'Tata Power Co. Ltd.',           exchange:'NSE', sector:'Power',         price:412.50,   change:5.20,    changePct:1.28,  volume:16000000, mktCap:'1.32L Cr', pe:32.4, high52:494.85,  low52:325.00  },
  { ticker:'POLICYBZR',  name:'PB Fintech Limited',            exchange:'NSE', sector:'Fintech',       price:1720.00,  change:28.00,   changePct:1.65,  volume:3100000,  mktCap:'0.78L Cr', pe:85.0, high52:1950.00,  low52:980.00  }
];

// Search helper across all stocks with priority sorting (exact ticker matches first)
function searchStocksDB(query) {
  if (!query) return STOCKS_DB.slice(0, 15);
  const q = query.trim().toLowerCase();
  const qUpper = q.toUpperCase();
  const matches = STOCKS_DB.filter(s => 
    s.ticker.toLowerCase().includes(q) || 
    (s.name && s.name.toLowerCase().includes(q)) ||
    (s.sector && s.sector.toLowerCase().includes(q))
  );

  return matches.sort((a, b) => {
    if (a.ticker === qUpper) return -1;
    if (b.ticker === qUpper) return 1;
    if (a.ticker.startsWith(qUpper) && !b.ticker.startsWith(qUpper)) return -1;
    if (!a.ticker.startsWith(qUpper) && b.ticker.startsWith(qUpper)) return 1;
    return 0;
  });
}

// Universal search that seamlessly queries backend live market resolver
async function searchUniversalStocks(query) {
  const localResults = searchStocksDB(query);
  if (!query || query.trim().length < 2) return localResults;

  try {
    const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query.trim())}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.results && Array.isArray(data.results)) {
        data.results.forEach(apiStock => {
          // If not in STOCKS_DB, insert it dynamically
          const exists = STOCKS_DB.find(s => s.ticker === apiStock.ticker);
          if (!exists) {
            const newStock = {
              ticker: apiStock.ticker,
              name: apiStock.name || apiStock.ticker,
              exchange: apiStock.exchange || 'NSE',
              sector: apiStock.sector || 'Equities',
              price: apiStock.price || 100,
              change: apiStock.change || 0,
              changePct: apiStock.changePct || 0,
              volume: 1000000,
              mktCap: '1.0L Cr',
              pe: 25.0,
              high52: (apiStock.price || 100) * 1.25,
              low52: (apiStock.price || 100) * 0.75
            };
            STOCKS_DB.push(newStock);
            LIVE_STOCKS.push(JSON.parse(JSON.stringify(newStock)));
          }
        });
        return searchStocksDB(query);
      }
    }
  } catch (err) {
    console.warn('[searchUniversalStocks] Universal search API fallback to local DB:', err.message);
  }
  return localResults;
}

// Global live copies
let LIVE_STOCKS = JSON.parse(JSON.stringify(STOCKS_DB));
let LIVE_INDICES = JSON.parse(JSON.stringify(INDICES));
window.LIVE_STOCKS = LIVE_STOCKS;
window.LIVE_INDICES = LIVE_INDICES;
window.STOCKS_DB = STOCKS_DB;
window.searchStocksDB = searchStocksDB;
window.searchUniversalStocks = searchUniversalStocks;

// Simulation disabled — app runs purely on real Yahoo Finance market data
window.stopSimulation = function() {};
window.restartSimulation = function() {};

// Formatting Helpers
function fmtPrice(val) {
  if (val === undefined || val === null || isNaN(val)) return '0.00';
  return parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtVol(num) {
  if (!num || isNaN(num)) return '0';
  if (num >= 1e7) return (num / 1e7).toFixed(2) + ' Cr';
  if (num >= 1e5) return (num / 1e5).toFixed(2) + ' L';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + ' K';
  return num.toString();
}

function fmtINR(val) {
  if (val === undefined || val === null || isNaN(val)) return '₹0.00';
  return '₹' + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function changeClass(val) {
  if (val > 0) return 'text-secondary';
  if (val < 0) return 'text-error';
  return 'text-on-surface-variant';
}

function changeSign(val) {
  if (val > 0) return '+';
  return '';
}

function changeIcon(val) {
  if (val > 0) return 'arrow_upward';
  if (val < 0) return 'arrow_downward';
  return 'remove';
}

// ── 1. Icon Font Safety & CSS Injection ────────────────────────
(function injectGlobalStyles() {
  if (typeof document === 'undefined') return;
  const styleId = 'saarthix-core-styles';
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* Material Symbols safety fallback: never render raw text words */
    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined', 'Material Icons', sans-serif !important;
      font-weight: normal;
      font-style: normal;
      font-size: 20px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-feature-settings: 'liga';
      -webkit-font-smoothing: antialiased;
      vertical-align: middle;
    }
    @supports (font-variation-settings: normal) {
      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
    }

    /* Skeleton & Shimmer Loaders */
    @keyframes saarthiShimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .skeleton, .skeleton-pulse {
      background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 75%);
      background-size: 200% 100%;
      animation: saarthiShimmer 1.8s infinite ease-in-out;
      border-radius: 6px;
      display: inline-block;
    }
    .skeleton-text { height: 1em; width: 70%; min-width: 40px; border-radius: 4px; }
    .skeleton-num { height: 1.2em; width: 85px; border-radius: 4px; }
    .skeleton-badge { height: 24px; width: 75px; border-radius: 9999px; }
    .skeleton-card { width: 100%; height: 140px; border-radius: 12px; }
    .skeleton-row { width: 100%; height: 44px; border-radius: 8px; margin-bottom: 8px; }

    /* Score Breakdown styles */
    .score-breakdown-card {
      background: rgba(18, 22, 34, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 16px;
      backdrop-filter: blur(12px);
    }
    .score-factor-bar {
      height: 6px;
      border-radius: 9999px;
      background: rgba(255,255,255,0.1);
      overflow: hidden;
      position: relative;
    }
    .score-factor-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .score-high { background: linear-gradient(90deg, #4edea3, #22c55e); }
    .score-mid { background: linear-gradient(90deg, #f59e0b, #eab308); }
    .score-low { background: linear-gradient(90deg, #ef4444, #f87171); }

    /* Compliance Tooltip / Modal styles */
    .compliance-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: rgba(77, 142, 255, 0.1);
      border: 1px solid rgba(77, 142, 255, 0.25);
      border-radius: 9999px;
      font-size: 11px;
      color: #adc6ff;
      cursor: pointer;
      transition: all 0.2s;
    }
    .compliance-pill:hover {
      background: rgba(77, 142, 255, 0.2);
      border-color: #4d8eff;
      color: #fff;
    }
  `;
  document.head.appendChild(style);
})();

// ── 2. Regional Language & i18n System (Pilot: EN + HI) ───────
const I18N_DICTIONARY = {
  en: {
    nav_dashboard: 'Dashboard',
    nav_portfolio: 'Portfolio',
    nav_stock_doctor: 'Stock Doctor',
    nav_mutual_funds: 'Mutual Funds',
    nav_market_watch: 'Market Watch',
    nav_news: 'News',
    nav_ai_insights: 'AI Insights',
    search_placeholder: 'Search NSE/BSE stocks (e.g. Reliance, TCS, HDFC)...',
    quick_trade: 'Quick Trade',
    analyze_portfolio: 'Analyze Portfolio',
    run_diagnosis: 'Run Portfolio Diagnosis',
    market_intelligence: 'Market Intelligence Terminal',
    advances: 'Advances',
    declines: 'Declines',
    breadth: 'Market Breadth',
    top_gainers: 'Top Gainers',
    top_losers: 'Top Losers',
    sector_performance: 'Sector Performance',
    compare_peers: 'Compare Peers',
    price_alert: 'Set Price Alert',
    verdict_strong_buy: 'STRONG BUY',
    verdict_buy: 'BUY',
    verdict_hold: 'HOLD',
    verdict_avoid: 'AVOID',
    verdict_sell: 'SELL',
    bullish: 'Bullish',
    bearish: 'Bearish',
    neutral: 'Neutral',
    compliance_label: 'SEBI RA Compliance',
    sebi_disclaimer_short: 'Data & AI outputs are for informational & simulated educational purposes only. Not SEBI registered investment advice.',
    lang_notice: '⚡ AI-generated dynamic market narratives are currently delivered in English.',
    what_changed_title: 'What Changed Since Yesterday',
    what_changed_subtitle: 'Overnight intelligence & key session catalyst digest'
  },
  hi: {
    nav_dashboard: 'डैशबोर्ड',
    nav_portfolio: 'पोर्टफोलियो',
    nav_stock_doctor: 'स्टॉक डॉक्टर',
    nav_mutual_funds: 'म्यूचुअल फंड',
    nav_market_watch: 'मार्केट वॉच',
    nav_news: 'समाचार',
    nav_ai_insights: 'एआई इनसाइट्स',
    search_placeholder: 'NSE/BSE स्टॉक खोजें (उदा. Reliance, TCS, HDFC)...',
    quick_trade: 'त्वरित ट्रेड',
    analyze_portfolio: 'पोर्टफोलियो विश्लेषण',
    run_diagnosis: 'पोर्टफोलियो डायग्नोसिस चलाएं',
    market_intelligence: 'मार्केट इंटेलिजेंस टर्मिनल',
    advances: 'बढ़त वाले शेयर',
    declines: 'गिरावट वाले शेयर',
    breadth: 'मार्केट चौड़ाई',
    top_gainers: 'शीर्ष लाभार्थी (Gainers)',
    top_losers: 'शीर्ष नुकसान वाले (Losers)',
    sector_performance: 'सेक्टर प्रदर्शन',
    compare_peers: 'साथियों से तुलना',
    price_alert: 'मूल्य अलर्ट सेट करें',
    verdict_strong_buy: 'मजबूत खरीद (STRONG BUY)',
    verdict_buy: 'खरीदें (BUY)',
    verdict_hold: 'बनाए रखें (HOLD)',
    verdict_avoid: 'दूर रहें (AVOID)',
    verdict_sell: 'बेचें (SELL)',
    bullish: 'बुलिश / तेजी',
    bearish: 'बेयरिश / मंदी',
    neutral: 'तटस्थ',
    compliance_label: 'SEBI RA अनुपालन',
    sebi_disclaimer_short: 'डेटा और एआई परिणाम केवल शैक्षिक और सिमुलेशन उद्देश्यों के लिए हैं। यह SEBI पंजीकृत सलाह नहीं है।',
    lang_notice: '⚡ एआई-जनरेटेड गतिशील बाजार विवरण वर्तमान में अंग्रेजी में प्रस्तुत किए जाते हैं।',
    what_changed_title: 'कल से अब तक क्या बदला?',
    what_changed_subtitle: 'रात भर की बाजार खुफिया जानकारी और मुख्य प्रेरक सारांश'
  }
};

class SaarthiI18nManager {
  constructor() {
    this.currentLang = (typeof localStorage !== 'undefined' && localStorage.getItem('saarthix_lang')) || 'en';
  }
  
  getLanguage() {
    return this.currentLang;
  }
  
  setLanguage(lang) {
    if (!I18N_DICTIONARY[lang]) lang = 'en';
    this.currentLang = lang;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('saarthix_lang', lang);
    }
    this.applyTranslations();
  }
  
  t(key, fallback = '') {
    const dict = I18N_DICTIONARY[this.currentLang] || I18N_DICTIONARY.en;
    return dict[key] || fallback || key;
  }

  applyTranslations() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = this.t(key, el.textContent);
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.placeholder = this.t(key, el.placeholder);
      }
    });
    window.dispatchEvent(new CustomEvent('saarthix_lang_change', { detail: { lang: this.currentLang } }));
  }

  renderLanguageSelector(containerId = null) {
    const current = this.currentLang;
    const html = `
      <div class="relative inline-block text-left" id="saarthi-lang-picker">
        <button type="button" onclick="window.SaarthiI18n.toggleDropdown()" class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container/60 hover:bg-surface-container border border-white/10 text-xs text-on-surface font-medium transition-all" title="Select UI Language">
          <span class="material-symbols-outlined text-[16px] text-primary">translate</span>
          <span>${current === 'hi' ? 'हिंदी (HI)' : 'English (EN)'}</span>
          <span class="material-symbols-outlined text-[14px] text-on-surface-variant">expand_more</span>
        </button>
        <div id="saarthi-lang-menu" class="hidden absolute right-0 mt-2 w-36 rounded-xl bg-surface-container-high border border-white/15 shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
          <button onclick="window.SaarthiI18n.setLanguage('en'); window.SaarthiI18n.toggleDropdown(false);" class="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-white/10 text-on-surface ${current === 'en' ? 'text-primary font-bold bg-primary/10' : ''}">
            <span>English (EN)</span>
            ${current === 'en' ? '<span class="material-symbols-outlined text-[14px] text-primary">check</span>' : ''}
          </button>
          <button onclick="window.SaarthiI18n.setLanguage('hi'); window.SaarthiI18n.toggleDropdown(false);" class="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-white/10 text-on-surface ${current === 'hi' ? 'text-primary font-bold bg-primary/10' : ''}">
            <span>हिंदी (Hindi)</span>
            ${current === 'hi' ? '<span class="material-symbols-outlined text-[14px] text-primary">check</span>' : ''}
          </button>
        </div>
      </div>
    `;
    if (containerId) {
      const target = document.getElementById(containerId);
      if (target) target.innerHTML = html;
    }
    return html;
  }

  toggleDropdown(forceState = null) {
    const menu = document.getElementById('saarthi-lang-menu');
    if (!menu) return;
    if (forceState !== null) {
      if (forceState) menu.classList.remove('hidden');
      else menu.classList.add('hidden');
    } else {
      menu.classList.toggle('hidden');
    }
  }
}

window.SaarthiI18n = new SaarthiI18nManager();

if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    const picker = document.getElementById('saarthi-lang-picker');
    const menu = document.getElementById('saarthi-lang-menu');
    if (picker && menu && !picker.contains(e.target)) {
      menu.classList.add('hidden');
    }
  });
}

// ── 3. Canonical Global Navigation (7 Items) ──────────────────
function buildNav(activePageId) {
  const i18n = window.SaarthiI18n;
  const pages = [
    { id:'dashboard',    key:'nav_dashboard',    label:'Dashboard',    icon:'space_dashboard',        href:'dashboard.html' },
    { id:'portfolio',    key:'nav_portfolio',    label:'Portfolio',    icon:'account_balance_wallet', href:'portfolio.html' },
    { id:'stock-doctor', key:'nav_stock_doctor', label:'Stock Doctor', icon:'monitor_heart',          href:'stock-doctor.html' },
    { id:'mutual-funds', key:'nav_mutual_funds', label:'Mutual Funds', icon:'pie_chart',              href:'mutual-funds.html' },
    { id:'market-watch', key:'nav_market_watch', label:'Market Watch', icon:'candlestick_chart',      href:'market-watch.html' },
    { id:'news',         key:'nav_news',         label:'News',          icon:'newspaper',              href:'news.html' },
    { id:'ai-insights',  key:'nav_ai_insights',  label:'AI Insights',  icon:'auto_awesome',           href:'ai-insights.html', pro:true }
  ];

  let navLinks = '';
  let mobileLinks = '';
  let headerNavLinks = '';

  pages.forEach(p => {
    const isActive = p.id === activePageId;
    const label = i18n ? i18n.t(p.key, p.label) : p.label;
    
    const activeCls = isActive ? 'sx-nav-item active' : 'sx-nav-item';
    const proBadge = p.pro ? '<span class="sx-pro-pill">Pro</span>' : '';

    navLinks += `
      <a href="${p.href}" class="${activeCls}" title="${label}">
        <span class="material-symbols-outlined">${p.icon}</span>
        <span>${label}</span>
        ${proBadge}
      </a>
    `;

    const mobActive = isActive ? 'text-primary font-bold' : 'text-on-surface-variant';
    mobileLinks += `
      <a href="${p.href}" class="flex flex-col items-center gap-0.5 px-2 py-1 ${mobActive}">
        <span class="material-symbols-outlined text-[20px]">${p.icon}</span>
        <span class="text-[9px] font-medium tracking-tight truncate max-w-[50px]">${label}</span>
      </a>
    `;

    const hdrActive = isActive 
      ? 'text-primary font-bold border-b-2 border-primary pb-1' 
      : 'text-on-surface-variant hover:text-primary transition-colors';
    headerNavLinks += `
      <a class="font-label-md text-label-md ${hdrActive}" href="${p.href}">${label}</a>
    `;
  });

  const statusDot = `
    <span class="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
    <span class="text-xs text-secondary font-medium">NSE/BSE Live</span>
  `;

  return { navLinks, mobileLinks, headerNavLinks, statusDot };
}

// ── Canonical Sidebar Renderer (Matches Reference UI exactly) ──
function renderCanonicalSidebar(activePageId) {
  const sidebar = document.getElementById('sidebar-nav') || document.getElementById('main-sidebar');
  if (!sidebar) return;

  const { navLinks } = buildNav(activePageId);

  sidebar.innerHTML = `
    <!-- Top Circular Logo -->
    <div class="mb-5 flex items-center justify-center w-full pt-1">
      <a href="dashboard.html" title="SaarthiX Home" class="flex items-center justify-center">
        <img src="logo.png" class="w-10 h-10 object-contain rounded-full border border-white/10" alt="SaarthiX Logo"/>
      </a>
    </div>

    <!-- Nav Links (Dynamic) -->
    <div class="flex flex-col gap-1 px-1 flex-1 overflow-y-auto w-full items-center" id="nav-links">
      ${navLinks}
    </div>

    <!-- Bottom System Strip -->
    <div class="w-full flex flex-col items-center gap-1 pt-3 pb-2 border-t border-white/10 text-xs mt-auto">
      <div class="flex items-center justify-center py-1.5">
        <span class="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_#10b981]" title="NSE/BSE Live"></span>
      </div>
      <a href="support.html" class="sx-bottom-link flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-xl text-[#7a88a8] hover:text-white hover:bg-white/5 transition-colors w-[66px] text-center" title="Support & Helpdesk">
        <span class="material-symbols-outlined text-[20px]">help</span>
        <span class="text-[9px] font-medium leading-tight">Support &amp; Helpdesk</span>
      </a>
      <a href="login.html" class="sx-bottom-link flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-xl text-[#7a88a8] hover:text-white hover:bg-white/5 transition-colors w-[66px] text-center" title="Log Out">
        <span class="material-symbols-outlined text-[20px]">logout</span>
        <span class="text-[9px] font-medium leading-tight">Log Out</span>
      </a>
    </div>
  `;
}
window.renderCanonicalSidebar = renderCanonicalSidebar;
window.buildNav = buildNav;

// ── Global Sidebar Toggle Function ───────────────────────────
function toggleSidebar() {
  const sidebar = document.getElementById('main-sidebar') || document.getElementById('sidebar-nav');
  const main = document.getElementById('main-content') || document.querySelector('main');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!sidebar) return;

  const isHidden = sidebar.classList.contains('-translate-x-full') || sidebar.classList.contains('sidebar-hidden');
  if (isHidden) {
    // Open Sidebar
    sidebar.classList.remove('-translate-x-full', 'sidebar-hidden', 'hidden');
    sidebar.classList.add('flex', 'translate-x-0');
    if (main) {
      main.classList.remove('md:ml-0', 'ml-0');
      main.classList.add('md:ml-[280px]');
    }
    if (backdrop) backdrop.classList.remove('hidden');
    try { localStorage.setItem('saarthix_sidebar_state', 'open'); } catch(e){}
  } else {
    // Hide Sidebar
    sidebar.classList.add('-translate-x-full', 'sidebar-hidden');
    sidebar.classList.remove('translate-x-0');
    if (main) {
      main.classList.remove('md:ml-[280px]');
      main.classList.add('md:ml-0');
    }
    if (backdrop) backdrop.classList.add('hidden');
    try { localStorage.setItem('saarthix_sidebar_state', 'closed'); } catch(e){}
  }
}
window.toggleSidebar = toggleSidebar;

// ── 4. Explainable AI Score Breakdown Component ───────────────
function renderScoreBreakdown({ fundamental = 75, technical = 70, sentiment = 65, macro = 70, overallScore = null, showHeader = true, id = null }) {
  const f = Math.min(100, Math.max(0, Math.round(fundamental)));
  const t = Math.min(100, Math.max(0, Math.round(technical)));
  const s = Math.min(100, Math.max(0, Math.round(sentiment)));
  const m = Math.min(100, Math.max(0, Math.round(macro)));

  const computedOverall = overallScore !== null 
    ? Math.round(overallScore)
    : Math.round((f * 0.35) + (t * 0.30) + (s * 0.20) + (m * 0.15));

  const getScoreColorCls = (val) => val >= 70 ? 'score-high' : (val >= 45 ? 'score-mid' : 'score-low');
  const getTextColor = (val) => val >= 70 ? '#4edea3' : (val >= 45 ? '#f59e0b' : '#ef4444');

  const containerId = id || 'sb_' + Math.random().toString(36).substr(2, 8);

  return `
    <div id="${containerId}" class="score-breakdown-card text-xs">
      ${showHeader ? `
        <div class="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[18px]">psychology</span>
            <span class="font-semibold text-on-surface text-sm">4-Factor AI Composite Scoring</span>
          </div>
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 font-bold" style="color: ${getTextColor(computedOverall)}">
            <span>Score:</span>
            <span class="text-sm">${computedOverall}/100</span>
          </div>
        </div>
      ` : ''}

      <div class="space-y-2.5">
        <!-- Fundamental (35%) -->
        <div>
          <div class="flex justify-between text-[11px] mb-1">
            <span class="text-on-surface-variant flex items-center gap-1">
              <span class="font-semibold text-on-surface">Fundamental Analysis</span>
              <span class="text-[10px] text-primary/80 font-mono">(35% weight)</span>
            </span>
            <span class="font-bold font-mono" style="color: ${getTextColor(f)}">${f}/100</span>
          </div>
          <div class="score-factor-bar">
            <div class="score-factor-fill ${getScoreColorCls(f)}" style="width: ${f}%"></div>
          </div>
        </div>

        <!-- Technical (30%) -->
        <div>
          <div class="flex justify-between text-[11px] mb-1">
            <span class="text-on-surface-variant flex items-center gap-1">
              <span class="font-semibold text-on-surface">Technical & Momentum</span>
              <span class="text-[10px] text-primary/80 font-mono">(30% weight)</span>
            </span>
            <span class="font-bold font-mono" style="color: ${getTextColor(t)}">${t}/100</span>
          </div>
          <div class="score-factor-bar">
            <div class="score-factor-fill ${getScoreColorCls(t)}" style="width: ${t}%"></div>
          </div>
        </div>

        <!-- Sentiment (20%) -->
        <div>
          <div class="flex justify-between text-[11px] mb-1">
            <span class="text-on-surface-variant flex items-center gap-1">
              <span class="font-semibold text-on-surface">Market Sentiment</span>
              <span class="text-[10px] text-primary/80 font-mono">(20% weight)</span>
            </span>
            <span class="font-bold font-mono" style="color: ${getTextColor(s)}">${s}/100</span>
          </div>
          <div class="score-factor-bar">
            <div class="score-factor-fill ${getScoreColorCls(s)}" style="width: ${s}%"></div>
          </div>
        </div>

        <!-- Macro (15%) -->
        <div>
          <div class="flex justify-between text-[11px] mb-1">
            <span class="text-on-surface-variant flex items-center gap-1">
              <span class="font-semibold text-on-surface">Macro & Sector Regime</span>
              <span class="text-[10px] text-primary/80 font-mono">(15% weight)</span>
            </span>
            <span class="font-bold font-mono" style="color: ${getTextColor(m)}">${m}/100</span>
          </div>
          <div class="score-factor-bar">
            <div class="score-factor-fill ${getScoreColorCls(m)}" style="width: ${m}%"></div>
          </div>
        </div>
      </div>

      <div class="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-on-surface-variant/70">
        <span>Formula: 0.35F + 0.30T + 0.20S + 0.15M</span>
        <span class="cursor-pointer text-primary hover:underline" onclick="window.openComplianceModal()">SEBI Disclaimer</span>
      </div>
    </div>
  `;
}

// ── 5. Portfolio Doctor: Multi-Stock Diagnosis Engine ─────────
function calculateStockDoctorScore(stock) {
  const pe = stock.pe || 25;
  const changePct = stock.changePct || 0;
  const price = stock.price || 1000;
  const high52 = stock.high52 || (price * 1.2);
  const low52 = stock.low52 || (price * 0.8);
  
  // 1. Fundamental (PE valuation vs standard Indian market 24x)
  let fundScore = 70;
  if (pe < 15) fundScore = 88;
  else if (pe < 25) fundScore = 78;
  else if (pe < 40) fundScore = 62;
  else if (pe < 75) fundScore = 48;
  else fundScore = 32;

  // 2. Technical (Distance from 52-week low/high + price momentum)
  const rangePos = (price - low52) / (high52 - low52 || 1);
  let techScore = Math.round(rangePos * 60 + (changePct > 0 ? 30 : 15));
  techScore = Math.max(20, Math.min(95, techScore));

  // 3. Sentiment (Volume and recent movement)
  let sentScore = changePct > 1.0 ? 82 : (changePct > 0 ? 68 : (changePct > -1 ? 52 : 36));

  // 4. Macro (Sector specific tailwind)
  const sectorMap = { 'Defense': 85, 'Energy': 76, 'Banking': 74, 'Tech': 68, 'IT': 72, 'Auto': 70, 'FMCG': 65, 'Metals': 58 };
  let macroScore = sectorMap[stock.sector] || 65;

  const composite = Math.round((fundScore * 0.35) + (techScore * 0.30) + (sentScore * 0.20) + (macroScore * 0.15));

  let verdict = 'HOLD';
  let badgeColor = '#f59e0b';
  let reason = 'Consolidating within technical range. Healthy risk-reward profile.';

  if (composite >= 78) {
    verdict = 'STRONG BUY';
    badgeColor = '#4edea3';
    reason = 'Superior fundamental valuation coupled with strong institutional accumulation.';
  } else if (composite >= 64) {
    verdict = 'BUY';
    badgeColor = '#22c55e';
    reason = 'Favorable earnings visibility and positive sector momentum tailwind.';
  } else if (composite >= 48) {
    verdict = 'HOLD';
    badgeColor = '#f59e0b';
    reason = 'Trading within moving average bounds. Maintain position until breakout confirmation.';
  } else if (composite >= 36) {
    verdict = 'AVOID / TRIM';
    badgeColor = '#f97316';
    reason = 'Elevated valuation multiple and distribution observed near 52-week resistance.';
  } else {
    verdict = 'SELL';
    badgeColor = '#ef4444';
    reason = 'Weak earnings delivery and break below key 200 DMA structural support.';
  }

  return {
    ticker: stock.ticker,
    name: stock.name,
    sector: stock.sector,
    price: stock.price,
    changePct: stock.changePct,
    fundamental: fundScore,
    technical: techScore,
    sentiment: sentScore,
    macro: macroScore,
    overallScore: composite,
    verdict,
    badgeColor,
    reason
  };
}

function runPortfolioDiagnosis(holdingsList = null) {
  const holdings = holdingsList || [
    { ticker: 'RELIANCE', qty: 10, buyPrice: 1000.00 },
    { ticker: 'INFY', qty: 15, buyPrice: 1120.00 },
    { ticker: 'HDFCBANK', qty: 20, buyPrice: 850.00 },
    { ticker: 'TCS', qty: 5, buyPrice: 2400.00 },
    { ticker: 'TATAMOTORS', qty: 25, buyPrice: 480.00 },
    { ticker: 'PAYTM', qty: 10, buyPrice: 1450.00 }
  ];

  let totalPortfolioValue = 0;
  const diagnosedHoldings = [];

  holdings.forEach(h => {
    const stockInfo = (window.LIVE_STOCKS || STOCKS_DB).find(s => s.ticker === h.ticker) || {
      ticker: h.ticker,
      name: h.ticker,
      sector: 'Diversified',
      price: h.buyPrice || 100,
      changePct: 0,
      pe: 25,
      high52: (h.buyPrice || 100) * 1.2,
      low52: (h.buyPrice || 100) * 0.8
    };

    const currentPrice = stockInfo.price || h.buyPrice;
    const val = currentPrice * h.qty;
    totalPortfolioValue += val;

    const diag = calculateStockDoctorScore(stockInfo);
    diagnosedHoldings.push({
      ...h,
      ...diag,
      currentValue: val,
      gainLoss: (currentPrice - h.buyPrice) * h.qty,
      gainLossPct: ((currentPrice - h.buyPrice) / h.buyPrice) * 100
    });
  });

  let weightedScore = 0;
  diagnosedHoldings.forEach(h => {
    h.weightPct = totalPortfolioValue > 0 ? (h.currentValue / totalPortfolioValue) * 100 : 0;
    weightedScore += (h.overallScore * (h.weightPct / 100));
  });

  weightedScore = Math.round(weightedScore);

  const sortedByScore = [...diagnosedHoldings].sort((a, b) => a.overallScore - b.overallScore);
  const weakestHoldings = sortedByScore.slice(0, 3);

  let aggVerdict = 'BALANCED & RESILIENT (HOLD / ACCUMULATE)';
  let aggColor = '#4edea3';
  if (weightedScore >= 75) {
    aggVerdict = 'EXCELLENT (STRONG BUY / CORE COMPOUNDER)';
    aggColor = '#4edea3';
  } else if (weightedScore >= 60) {
    aggVerdict = 'HEALTHY & RESILIENT (ACCUMULATE ON DIPS)';
    aggColor = '#22c55e';
  } else if (weightedScore >= 45) {
    aggVerdict = 'MODERATE HEALTH (HOLD WITH SELECTIVE TRIM)';
    aggColor = '#f59e0b';
  } else {
    aggVerdict = 'VULNERABLE (REBALANCE / DEFENSIVE ROTATION)';
    aggColor = '#ef4444';
  }

  return {
    totalValue: totalPortfolioValue,
    weightedScore,
    verdict: aggVerdict,
    badgeColor: aggColor,
    holdings: diagnosedHoldings,
    weakestHoldings,
    fundamentalAvg: Math.round(diagnosedHoldings.reduce((acc, h) => acc + h.fundamental, 0) / diagnosedHoldings.length),
    technicalAvg: Math.round(diagnosedHoldings.reduce((acc, h) => acc + h.technical, 0) / diagnosedHoldings.length),
    sentimentAvg: Math.round(diagnosedHoldings.reduce((acc, h) => acc + h.sentiment, 0) / diagnosedHoldings.length),
    macroAvg: Math.round(diagnosedHoldings.reduce((acc, h) => acc + h.macro, 0) / diagnosedHoldings.length)
  };
}

// ── 6. Broker Deep-Link & Order Bridge ─────────────────────────
function generateBrokerOrderLink({ broker = 'zerodha', symbol = 'RELIANCE', qty = 1, price = 0, orderType = 'LIMIT' }) {
  const sym = encodeURIComponent(symbol.toUpperCase());
  const q = encodeURIComponent(qty || 1);
  const p = encodeURIComponent(price || 0);

  const links = {
    zerodha: `https://kite.zerodha.com/quick-order?symbol=${sym}&exchange=NSE&type=${orderType}&qty=${q}&price=${p}`,
    groww: `https://groww.in/stocks/${sym.toLowerCase()}`,
    upstox: `https://pro.upstox.com/order?symbol=NSE_EQ%7C${sym}&qty=${q}&price=${p}`,
    angelone: `https://trade.angelone.in/trade/trading/symbol/${sym}`,
    fyers: `https://trade.fyers.in/web/order?symbol=NSE:${sym}-EQ&qty=${q}&price=${p}`
  };

  return links[broker] || links.zerodha;
}

function openOrderBridgeModal({ symbol = 'RELIANCE', defaultPrice = 1328.80, defaultQty = 10 }) {
  if (typeof document === 'undefined') return;
  const modalId = 'saarthi-order-bridge-modal';
  let modal = document.getElementById(modalId);
  if (!modal) {
    modal = document.createElement('div');
    modal.id = modalId;
    document.body.appendChild(modal);
  }

  modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50';
  modal.innerHTML = `
    <div class="bg-surface-container-high border border-white/15 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-on-surface">
      <button onclick="document.getElementById('${modalId}').remove()" class="absolute top-4 right-4 text-on-surface-variant hover:text-white p-1 rounded-lg">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>

      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
          <span class="material-symbols-outlined">launch</span>
        </div>
        <div>
          <h3 class="text-base font-bold">Broker Order Deep-Link</h3>
          <p class="text-xs text-on-surface-variant">Pre-fill order on your registered broker</p>
        </div>
      </div>

      <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs mb-4 flex items-start gap-2">
        <span class="material-symbols-outlined text-[16px] text-amber-400 mt-0.5 flex-shrink-0">gavel</span>
        <span><strong>SEBI Compliance Notice:</strong> SaarthiX does <em>not</em> execute auto-trades. Clicking below opens a pre-filled ticket in your broker's official app/site for your manual verification.</span>
      </div>

      <div class="space-y-3 text-xs mb-5">
        <div>
          <label class="block text-on-surface-variant font-medium mb-1">Select Broker</label>
          <select id="bridge-broker-select" class="w-full bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-on-surface">
            <option value="zerodha">Zerodha (Kite)</option>
            <option value="groww">Groww</option>
            <option value="upstox">Upstox Pro</option>
            <option value="angelone">Angel One (SmartAPI)</option>
            <option value="fyers">Fyers Web</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-on-surface-variant font-medium mb-1">Symbol</label>
            <input type="text" id="bridge-symbol" value="${symbol}" readonly class="w-full bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-on-surface font-mono font-bold" />
          </div>
          <div>
            <label class="block text-on-surface-variant font-medium mb-1">Quantity (Qty)</label>
            <input type="number" id="bridge-qty" value="${defaultQty}" class="w-full bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-on-surface font-mono" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-on-surface-variant font-medium mb-1">Trigger / Target Price (₹)</label>
            <input type="number" step="0.05" id="bridge-price" value="${defaultPrice}" class="w-full bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-on-surface font-mono" />
          </div>
          <div>
            <label class="block text-on-surface-variant font-medium mb-1">Order Type</label>
            <select id="bridge-type" class="w-full bg-surface-container border border-white/10 rounded-lg px-3 py-2 text-on-surface">
              <option value="LIMIT">LIMIT (Recommended)</option>
              <option value="MARKET">MARKET</option>
            </select>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button onclick="document.getElementById('${modalId}').remove()" class="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold hover:bg-white/5 transition-colors">
          Cancel
        </button>
        <button onclick="window.confirmBrokerBridgeLaunch()" class="flex-1 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
          <span>Proceed to Broker</span>
          <span class="material-symbols-outlined text-[16px]">open_in_new</span>
        </button>
      </div>
    </div>
  `;

  window.confirmBrokerBridgeLaunch = function() {
    const broker = document.getElementById('bridge-broker-select').value;
    const sym = document.getElementById('bridge-symbol').value;
    const qty = document.getElementById('bridge-qty').value;
    const price = document.getElementById('bridge-price').value;
    const orderType = document.getElementById('bridge-type').value;

    const url = generateBrokerOrderLink({ broker, symbol: sym, qty, price, orderType });
    document.getElementById(modalId).remove();
    window.open(url, '_blank', 'noopener,noreferrer');
  };
}

// ── 7. "What Changed Since Yesterday" Daily Digest ───────────
function generateDailyDigest() {
  const stocks = window.LIVE_STOCKS || STOCKS_DB;
  const gainers = getTopGainers(3);
  const losers = getTopLosers(2);
  const breadth = getMarketBreadth();

  const bullets = [
    {
      type: 'up',
      icon: 'trending_up',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      title: `${gainers[0]?.ticker || 'RELIANCE'} (+${gainers[0]?.changePct || '1.22'}%)`,
      text: `Surged on heavy institutional volume and margin expansion tailwinds in core business units.`
    },
    {
      type: breadth.advances >= breadth.declines ? 'up' : 'down',
      icon: breadth.advances >= breadth.declines ? 'check_circle' : 'warning',
      badgeClass: breadth.advances >= breadth.declines ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20',
      title: `Market Breadth (${breadth.advances} Adv / ${breadth.declines} Dec)`,
      text: `Broad-based sentiment remains ${breadth.advances >= breadth.declines ? 'constructive' : 'cautious'} with ${Math.round((breadth.advances/breadth.total)*100)}% of NIFTY Universe trading in positive territory.`
    },
    {
      type: 'down',
      icon: 'trending_down',
      badgeClass: 'bg-red-500/10 text-red-400 border-red-500/20',
      title: `${losers[0]?.ticker || 'TATAMOTORS'} (${losers[0]?.changePct || '-1.15'}%)`,
      text: `Witnessed mild pullback after failing to hold 50 DMA resistance zone; consolidating support.`
    },
    {
      type: 'neutral',
      icon: 'auto_graph',
      badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      title: `Macro Regime: FY2025-26 Tax & RBI Policy Neutral`,
      text: `STCG at 20%, LTCG 12.5% (>₹1.25L exemption) intact. High liquidity keeps risk premiums tight.`
    }
  ];

  return bullets;
}

// ── 8. SEBI Compliance Modal Helper ───────────────────────────
function openComplianceModal() {
  if (typeof document === 'undefined') return;
  const modalId = 'saarthi-compliance-modal';
  let modal = document.getElementById(modalId);
  if (!modal) {
    modal = document.createElement('div');
    modal.id = modalId;
    document.body.appendChild(modal);
  }

  modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50';
  modal.innerHTML = `
    <div class="bg-surface-container-high border border-white/15 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-on-surface">
      <button onclick="document.getElementById('${modalId}').remove()" class="absolute top-4 right-4 text-on-surface-variant hover:text-white p-1 rounded-lg">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>

      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <span class="material-symbols-outlined">verified_user</span>
        </div>
        <div>
          <h3 class="text-base font-bold">SEBI Regulatory Disclosures</h3>
          <p class="text-xs text-on-surface-variant">Statutory Compliance & Risk Information</p>
        </div>
      </div>

      <div class="space-y-3 text-xs text-on-surface-variant/90 max-h-72 overflow-y-auto pr-2">
        <p><strong>1. Informational & Simulated Nature:</strong> SaarthiX AI Terminal provides algorithmic analytics, technical indicators, and educational research syntheses. None of the verdicts (BUY / HOLD / SELL / AVOID) constitute guaranteed financial recommendations or SEBI-registered portfolio management advice.</p>
        
        <p><strong>2. Indian Tax Law Alignment:</strong> Capital gain calculations adhere to Union Budget FY2025-26 (Short Term Capital Gains at 20%, Long Term Capital Gains at 12.5% above ₹1,25,000 threshold). Consult a qualified Chartered Accountant for personal tax assessment.</p>

        <p><strong>3. Market Risk Warning:</strong> Investments in securities market are subject to market risks. Read all scheme and offer documents carefully before investing.</p>

        <p><strong>4. No Automated Execution:</strong> SaarthiX does not initiate or execute automated orders on stock exchanges. Any broker bridge link operates solely as a deep-link convenience requiring direct manual authorization in your broker app.</p>
      </div>

      <div class="mt-6 pt-4 border-t border-white/10 flex justify-end">
        <button onclick="document.getElementById('${modalId}').remove()" class="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90">
          Understood & Acknowledged
        </button>
      </div>
    </div>
  `;
}

// ── Market Breadth & Aggregators ──────────────────────────────
function getMarketBreadth() {
  const stocks = window.LIVE_STOCKS || STOCKS_DB;
  const adv = stocks.filter(s => (s.changePct || s.change || 0) > 0).length;
  const dec = stocks.filter(s => (s.changePct || s.change || 0) < 0).length;
  return { advances: adv, declines: dec, unchanged: stocks.length - adv - dec, total: stocks.length };
}

function getTopGainers(limit = 5) {
  const stocks = [...(window.LIVE_STOCKS || STOCKS_DB)];
  stocks.sort((a, b) => (b.changePct || 0) - (a.changePct || 0));
  return stocks.slice(0, limit);
}

function getTopLosers(limit = 5) {
  const stocks = [...(window.LIVE_STOCKS || STOCKS_DB)];
  stocks.sort((a, b) => (a.changePct || 0) - (b.changePct || 0));
  return stocks.slice(0, limit);
}

function getSectorSummary() {
  const stocks = window.LIVE_STOCKS || STOCKS_DB;
  const map = {};
  stocks.forEach(s => {
    const sec = s.sector || 'Other';
    if (!map[sec]) map[sec] = { sector: sec, totalChg: 0, count: 0 };
    map[sec].totalChg += (s.changePct || 0);
    map[sec].count++;
  });
  return Object.values(map).map(m => ({
    sector: m.sector,
    avgChangePct: parseFloat((m.totalChg / m.count).toFixed(2)),
    count: m.count
  })).sort((a, b) => b.avgChangePct - a.avgChangePct);
}

function isMarketOpen() {
  const now = new Date();
  const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const istDate = new Date(istString);
  const day = istDate.getDay(); // 0 = Sunday, 6 = Saturday
  if (day === 0 || day === 6) return false;
  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  // NSE/BSE Trading Hours: 09:15 to 15:30 IST
  return timeInMinutes >= 555 && timeInMinutes <= 930;
}

// Expose globally
window.buildNav = buildNav;
window.renderScoreBreakdown = renderScoreBreakdown;
window.calculateStockDoctorScore = calculateStockDoctorScore;
window.runPortfolioDiagnosis = runPortfolioDiagnosis;
window.generateBrokerOrderLink = generateBrokerOrderLink;
window.openOrderBridgeModal = openOrderBridgeModal;
window.generateDailyDigest = generateDailyDigest;
window.openComplianceModal = openComplianceModal;
window.getMarketBreadth = getMarketBreadth;
window.getTopGainers = getTopGainers;
window.getTopLosers = getTopLosers;
window.getSectorSummary = getSectorSummary;
window.isMarketOpen = isMarketOpen;

