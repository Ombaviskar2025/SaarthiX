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
  { ticker:'LTIM',       name:'LTIMindtree Ltd.',              exchange:'NSE', sector:'IT',            price:5890.00,  change:45.00,   changePct:0.77,  volume:876543,   mktCap:'1.7L Cr',  pe:36.4, high52:6750.00,  low52:4500.00 },
  { ticker:'PERSISTENT', name:'Persistent Systems Ltd.',       exchange:'NSE', sector:'IT',            price:5210.00,  change:68.00,   changePct:1.32,  volume:654321,   mktCap:'0.8L Cr',  pe:48.2, high52:5900.00,  low52:3200.00 },
  { ticker:'COFORGE',    name:'Coforge Ltd.',                  exchange:'NSE', sector:'IT',            price:7850.00,  change:-34.00,  changePct:-0.43, volume:432109,   mktCap:'0.5L Cr',  pe:42.1, high52:8400.00,  low52:4800.00 },
  { ticker:'MPHASIS',    name:'Mphasis Ltd.',                  exchange:'NSE', sector:'IT',            price:2940.00,  change:24.00,   changePct:0.82,  volume:543210,   mktCap:'0.5L Cr',  pe:32.6, high52:3300.00,  low52:2100.00 },
  { ticker:'TATAELXSI',  name:'Tata Elxsi Ltd.',               exchange:'NSE', sector:'IT',            price:6820.00,  change:-45.00,  changePct:-0.65, volume:321098,   mktCap:'0.4L Cr',  pe:52.4, high52:8900.00,  low52:6200.00 },
  { ticker:'KPITTECH',   name:'KPIT Technologies Ltd.',        exchange:'NSE', sector:'IT',            price:1640.00,  change:18.50,   changePct:1.14,  volume:1234567,  mktCap:'0.4L Cr',  pe:58.2, high52:1900.00,  low52:1100.00 },

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
  { ticker:'UPL',        name:'UPL Ltd.',                      exchange:'NSE', sector:'Agro Chem',     price:614.20,   change:-4.20,   changePct:-0.80, volume:3456789,  mktCap:'0.4L Cr',  pe:28.4, high52:660.15,   low52:378.85  }
];

// Search helper across all stocks
function searchStocksDB(query) {
  if (!query) return STOCKS_DB.slice(0, 15);
  const q = query.trim().toLowerCase();
  return STOCKS_DB.filter(s => 
    s.ticker.toLowerCase().includes(q) || 
    s.name.toLowerCase().includes(q) ||
    s.sector.toLowerCase().includes(q)
  );
}

// Global live copies
let LIVE_STOCKS = JSON.parse(JSON.stringify(STOCKS_DB));
let LIVE_INDICES = JSON.parse(JSON.stringify(INDICES));
window.LIVE_STOCKS = LIVE_STOCKS;
window.LIVE_INDICES = LIVE_INDICES;
window.STOCKS_DB = STOCKS_DB;
window.searchStocksDB = searchStocksDB;

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

function buildNav(activePageId) {
  const pages = [
    { id:'dashboard',    label:'Dashboard',    icon:'dashboard',         href:'dashboard.html' },
    { id:'market-watch', label:'Market Watch', icon:'show_chart',        href:'market-watch.html' },
    { id:'portfolio',    label:'Portfolio',    icon:'account_balance_wallet', href:'portfolio.html' },
    { id:'ai-insights',  label:'AI Insights',  icon:'auto_awesome',      href:'ai-insights.html' },
    { id:'news',         label:'Market News',  icon:'newspaper',         href:'news.html' }
  ];

  let navLinks = '';
  let mobileLinks = '';

  pages.forEach(p => {
    const isActive = p.id === activePageId;
    const activeCls = isActive 
      ? 'bg-primary-container text-on-primary-container font-semibold' 
      : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5';
    
    navLinks += `
      <a href="${p.href}" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${activeCls}">
        <span class="material-symbols-outlined text-[20px]">${p.icon}</span>
        <span>${p.label}</span>
      </a>
    `;

    const mobActive = isActive ? 'text-primary' : 'text-on-surface-variant';
    mobileLinks += `
      <a href="${p.href}" class="flex flex-col items-center gap-1 ${mobActive}">
        <span class="material-symbols-outlined text-[22px]">${p.icon}</span>
        <span class="text-[10px] font-medium">${p.label}</span>
      </a>
    `;
  });

  const statusDot = `
    <span class="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
    <span class="text-xs text-secondary font-medium">NSE/BSE Live</span>
  `;

  return { navLinks, mobileLinks, statusDot };
}

function getMarketBreadth() {
  const adv = LIVE_STOCKS.filter(s => (s.change || 0) > 0).length;
  const dec = LIVE_STOCKS.filter(s => (s.change || 0) < 0).length;
  return { advances: adv, declines: dec, unchanged: LIVE_STOCKS.length - adv - dec, total: LIVE_STOCKS.length };
}
