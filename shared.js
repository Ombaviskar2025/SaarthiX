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

// ── Stocks Database (50 NSE/BSE stocks) ──────────────────────
const STOCKS_DB = [
  { ticker:'RELIANCE',   name:'Reliance Industries Ltd.',      exchange:'NSE', sector:'Energy',        price:1328.80,  change:34.20,   changePct:1.22,  volume:8234567,  mktCap:'19.3L Cr', pe:24.5, high52:3024.90,  low52:2180.45 },
  { ticker:'ONGC',       name:'Oil & Natural Gas Corp.',       exchange:'NSE', sector:'Energy',        price:247.27,   change:-2.15,   changePct:-0.75, volume:12456789, mktCap:'3.6L Cr',  pe:8.2,  high52:345.20,   low52:197.50  },
  { ticker:'BPCL',       name:'Bharat Petroleum Corp.',        exchange:'BSE', sector:'Energy',        price:315.00,   change:4.80,    changePct:1.56,  volume:5678901,  mktCap:'1.4L Cr',  pe:11.4, high52:376.50,   low52:224.80  },
  { ticker:'TCS',        name:'Tata Consultancy Services',     exchange:'NSE', sector:'IT',            price:2266.00,  change:-28.35,  changePct:-0.72, volume:2134892,  mktCap:'14.2L Cr', pe:31.2, high52:4592.25,  low52:3311.80 },
  { ticker:'INFY',       name:'Infosys Ltd.',                  exchange:'NSE', sector:'IT',            price:1094.20,  change:18.90,   changePct:1.18,  volume:4523781,  mktCap:'6.8L Cr',  pe:27.4, high52:1992.25,  low52:1356.20 },
  { ticker:'WIPRO',      name:'Wipro Ltd.',                    exchange:'NSE', sector:'IT',            price:175.90,   change:-3.45,   changePct:-0.64, volume:3892456,  mktCap:'2.8L Cr',  pe:22.1, high52:648.80,   low52:424.15  },
  { ticker:'HCLTECH',    name:'HCL Technologies Ltd.',         exchange:'NSE', sector:'IT',            price:1203.90,  change:22.10,   changePct:1.30,  volume:2345678,  mktCap:'4.7L Cr',  pe:25.8, high52:1980.70,  low52:1244.60 },
  { ticker:'TECHM',      name:'Tech Mahindra Ltd.',            exchange:'NSE', sector:'IT',            price:1572.90,  change:15.30,   changePct:1.01,  volume:1234567,  mktCap:'1.5L Cr',  pe:38.5, high52:1765.90,  low52:1097.45 },
  { ticker:'HDFCBANK',   name:'HDFC Bank Ltd.',                exchange:'NSE', sector:'Banking',       price:820.80,  change:-12.40,  changePct:-0.69, volume:9876543,  mktCap:'13.6L Cr', pe:21.3, high52:1979.90,  low52:1363.55 },
  { ticker:'ICICIBANK',  name:'ICICI Bank Ltd.',               exchange:'NSE', sector:'Banking',       price:1454.00,  change:14.25,   changePct:1.16,  volume:11234567, mktCap:'8.7L Cr',  pe:18.7, high52:1388.35,  low52:945.75  },
  { ticker:'KOTAKBANK',  name:'Kotak Mahindra Bank Ltd.',      exchange:'NSE', sector:'Banking',       price:390.70,  change:-8.90,   changePct:-0.47, volume:3456789,  mktCap:'3.8L Cr',  pe:19.8, high52:2196.50,  low52:1620.00 },
  { ticker:'AXISBANK',   name:'Axis Bank Ltd.',                exchange:'NSE', sector:'Banking',       price:1329.40,  change:9.75,    changePct:0.85,  volume:7654321,  mktCap:'3.6L Cr',  pe:16.4, high52:1339.65,  low52:895.45  },
  { ticker:'SBIN',       name:'State Bank of India',           exchange:'NSE', sector:'Banking',       price:1043.20,   change:6.20,    changePct:0.76,  volume:18234567, mktCap:'7.4L Cr',  pe:12.1, high52:912.10,   low52:543.20  },
  { ticker:'INDUSINDBK', name:'IndusInd Bank Ltd.',            exchange:'NSE', sector:'Banking',       price:1026.10,  change:-18.30,  changePct:-1.78, volume:4321098,  mktCap:'0.8L Cr',  pe:14.2, high52:1694.50,  low52:853.60  },
  { ticker:'BAJFINANCE', name:'Bajaj Finance Ltd.',            exchange:'NSE', sector:'NBFC',          price:1055.30,  change:45.80,   changePct:0.67,  volume:1234567,  mktCap:'4.2L Cr',  pe:35.4, high52:8192.45,  low52:6186.70 },
  { ticker:'BAJAJFINSV', name:'Bajaj Finserv Ltd.',            exchange:'NSE', sector:'NBFC',          price:1854.00,  change:12.35,   changePct:0.73,  volume:987654,   mktCap:'2.7L Cr',  pe:28.6, high52:1990.30,  low52:1419.25 },
  { ticker:'HINDUNILVR', name:'Hindustan Unilever Ltd.',       exchange:'NSE', sector:'FMCG',          price:2140.00,  change:-15.20,  changePct:-0.62, volume:2345678,  mktCap:'5.8L Cr',  pe:55.2, high52:2964.60,  low52:2183.40 },
  { ticker:'ITC',        name:'ITC Ltd.',                      exchange:'NSE', sector:'FMCG',          price:280.50,   change:3.40,    changePct:0.73,  volume:15678901, mktCap:'5.9L Cr',  pe:27.8, high52:528.55,   low52:399.35  },
  { ticker:'NESTLEIND',  name:'Nestle India Ltd.',             exchange:'BSE', sector:'FMCG',          price:1427.80,  change:18.45,   changePct:0.80,  volume:456789,   mktCap:'2.2L Cr',  pe:78.4, high52:2778.00,  low52:2104.90 },
  { ticker:'BRITANNIA',  name:'Britannia Industries Ltd.',     exchange:'NSE', sector:'FMCG',          price:5415.00,  change:-22.45,  changePct:-0.41, volume:234567,   mktCap:'1.3L Cr',  pe:56.7, high52:6012.00,  low52:4512.10 },
  { ticker:'TATACONSUM', name:'Tata Consumer Products Ltd.',   exchange:'NSE', sector:'FMCG',          price:1088.80,  change:8.90,    changePct:0.74,  volume:1234567,  mktCap:'1.1L Cr',  pe:64.2, high52:1388.75,  low52:947.30  },
  { ticker:'MARUTI',     name:'Maruti Suzuki India Ltd.',      exchange:'NSE', sector:'Auto',          price:13824.00, change:124.35,  changePct:1.12,  volume:456789,   mktCap:'3.4L Cr',  pe:28.9, high52:13680.00, low52:9862.50 },
  { ticker:'TATAMOTORS', name:'Tata Motors Ltd.',              exchange:'NSE', sector:'Auto',          price:912.45,   change:-9.80,   changePct:-1.19, volume:9876543,  mktCap:'3.0L Cr',  pe:14.2, high52:1179.00,  low52:738.40  },
  { ticker:'HEROMOTOCO', name:'Hero MotoCorp Ltd.',            exchange:'NSE', sector:'Auto',          price:4906.00,  change:38.20,   changePct:0.80,  volume:345678,   mktCap:'0.96L Cr', pe:22.4, high52:5916.00,  low52:3990.55 },
  { ticker:'EICHERMOT',  name:'Eicher Motors Ltd.',            exchange:'NSE', sector:'Auto',          price:7556.00,  change:45.30,   changePct:0.84,  volume:234567,   mktCap:'1.5L Cr',  pe:32.8, high52:5828.00,  low52:3804.20 },
  { ticker:'M&M',        name:'Mahindra & Mahindra Ltd.',      exchange:'NSE', sector:'Auto',          price:3178.90,  change:28.65,   changePct:1.03,  volume:2345678,  mktCap:'3.5L Cr',  pe:26.7, high52:3222.90,  low52:1694.90 },
  { ticker:'BAJAJ-AUTO', name:'Bajaj Auto Ltd.',               exchange:'NSE', sector:'Auto',          price:10439.50,  change:56.40,   changePct:0.64,  volume:345678,   mktCap:'2.6L Cr',  pe:30.5, high52:12774.35, low52:7408.80 },
  { ticker:'SUNPHARMA',  name:'Sun Pharmaceutical Ind.',       exchange:'NSE', sector:'Pharma',        price:1934.00,  change:14.20,   changePct:0.76,  volume:2345678,  mktCap:'4.5L Cr',  pe:38.2, high52:2175.00,  low52:1375.75 },
  { ticker:'DRREDDY',    name:"Dr. Reddy's Laboratories",      exchange:'NSE', sector:'Pharma',        price:1210.30,  change:-34.15,  changePct:-0.50, volume:456789,   mktCap:'1.1L Cr',  pe:24.6, high52:7645.00,  low52:5231.45 },
  { ticker:'CIPLA',      name:'Cipla Ltd.',                    exchange:'NSE', sector:'Pharma',        price:1419.50,  change:12.45,   changePct:0.78,  volume:1234567,  mktCap:'1.3L Cr',  pe:31.4, high52:1765.00,  low52:1148.80 },
  { ticker:'DIVISLAB',   name:"Divi's Laboratories Ltd.",      exchange:'NSE', sector:'Pharma',        price:7247.50,  change:-22.30,  changePct:-0.46, volume:234567,   mktCap:'1.3L Cr',  pe:68.4, high52:5390.00,  low52:3360.25 },
  { ticker:'APOLLOHOSP', name:'Apollo Hospitals Enterprise',   exchange:'NSE', sector:'Healthcare',    price:8820.00,  change:45.80,   changePct:0.64,  volume:234567,   mktCap:'1.0L Cr',  pe:102.4,high52:7265.00,  low52:4846.50 },
  { ticker:'TATASTEEL',  name:'Tata Steel Ltd.',               exchange:'NSE', sector:'Metals',        price:185.75,   change:-2.80,   changePct:-1.69, volume:34567890, mktCap:'2.0L Cr',  pe:22.4, high52:184.60,   low52:120.60  },
  { ticker:'JSWSTEEL',   name:'JSW Steel Ltd.',                exchange:'NSE', sector:'Metals',        price:1235.00,   change:-8.45,   changePct:-0.91, volume:4567890,  mktCap:'2.3L Cr',  pe:26.8, high52:1062.00,  low52:782.10  },
  { ticker:'HINDALCO',   name:'Hindalco Industries Ltd.',      exchange:'NSE', sector:'Metals',        price:945.05,   change:6.80,    changePct:0.96,  volume:5678901,  mktCap:'1.6L Cr',  pe:18.2, high52:770.40,   low52:452.85  },
  { ticker:'COALINDIA',  name:'Coal India Ltd.',               exchange:'NSE', sector:'Mining',        price:427.60,   change:4.15,    changePct:0.80,  volume:7890123,  mktCap:'3.2L Cr',  pe:9.8,  high52:543.55,   low52:382.65  },
  { ticker:'LT',         name:'Larsen & Toubro Ltd.',          exchange:'NSE', sector:'Infrastructure',price:3817.90,  change:28.40,   changePct:0.84,  volume:1234567,  mktCap:'4.9L Cr',  pe:34.2, high52:3994.00,  low52:2727.50 },
  { ticker:'POWERGRID',  name:'Power Grid Corp. of India',     exchange:'NSE', sector:'Utilities',     price:283.20,   change:2.80,    changePct:0.82,  volume:9876543,  mktCap:'3.2L Cr',  pe:19.4, high52:366.25,   low52:205.40  },
  { ticker:'NTPC',       name:'NTPC Ltd.',                     exchange:'NSE', sector:'Utilities',     price:341.90,   change:3.45,    changePct:0.84,  volume:12345678, mktCap:'4.0L Cr',  pe:16.2, high52:448.45,   low52:213.05  },
  { ticker:'ADANIENT',   name:'Adani Enterprises Ltd.',        exchange:'NSE', sector:'Conglomerate',  price:3155.00,  change:-34.20,  changePct:-1.16, volume:2345678,  mktCap:'3.3L Cr',  pe:98.4, high52:3743.90,  low52:2014.55 },
  { ticker:'ADANIPORTS', name:'Adani Ports & SEZ Ltd.',        exchange:'NSE', sector:'Logistics',     price:1836.50,  change:12.45,   changePct:0.89,  volume:3456789,  mktCap:'3.0L Cr',  pe:28.6, high52:1621.35,  low52:869.65  },
  { ticker:'BHARTIARTL', name:'Bharti Airtel Ltd.',            exchange:'NSE', sector:'Telecom',       price:1908.00,  change:18.60,   changePct:1.15,  volume:5678901,  mktCap:'9.8L Cr',  pe:82.4, high52:1779.00,  low52:977.15  },
  { ticker:'ULTRACEMCO', name:'UltraTech Cement Ltd.',         exchange:'NSE', sector:'Cement',        price:11685.00, change:124.30,  changePct:1.06,  volume:345678,   mktCap:'3.4L Cr',  pe:46.8, high52:12684.85, low52:8894.55 },
  { ticker:'GRASIM',     name:'Grasim Industries Ltd.',        exchange:'NSE', sector:'Cement',        price:3111.50,  change:18.40,   changePct:0.66,  volume:456789,   mktCap:'1.9L Cr',  pe:22.4, high52:2889.75,  low52:1885.45 },
  { ticker:'SHREECEM',   name:'Shree Cement Ltd.',             exchange:'BSE', sector:'Cement',        price:25412.30, change:-124.30, changePct:-0.46, volume:56789,    mktCap:'0.97L Cr', pe:48.6, high52:29449.00, low52:21217.15},
  { ticker:'ASIANPAINT', name:'Asian Paints Ltd.',             exchange:'NSE', sector:'Consumer',      price:2690.00,  change:-14.30,  changePct:-0.62, volume:1234567,  mktCap:'2.2L Cr',  pe:52.4, high52:3394.00,  low52:2174.00 },
  { ticker:'TITAN',      name:'Titan Company Ltd.',            exchange:'NSE', sector:'Consumer',      price:4632.00,  change:28.45,   changePct:0.84,  volume:987654,   mktCap:'3.0L Cr',  pe:92.4, high52:3887.00,  low52:3054.35 },
  { ticker:'HDFCLIFE',   name:'HDFC Life Insurance Co.',       exchange:'NSE', sector:'Insurance',     price:564.00,   change:4.80,    changePct:0.67,  volume:2345678,  mktCap:'1.6L Cr',  pe:82.4, high52:791.90,   low52:511.40  },
  { ticker:'SBILIFE',    name:'SBI Life Insurance Co.',        exchange:'NSE', sector:'Insurance',     price:1828.80,  change:8.90,    changePct:0.55,  volume:1234567,  mktCap:'1.6L Cr',  pe:64.2, high52:1921.85,  low52:1199.00 },
  { ticker:'UPL',        name:'UPL Ltd.',                      exchange:'NSE', sector:'Agro Chem',     price:614.20,   change:-4.20,   changePct:-0.80, volume:3456789,  mktCap:'0.4L Cr',  pe:28.4, high52:660.15,   low52:378.85  },
];

// ── Live copies that fluctuate ────────────────────────────────
let LIVE_STOCKS = JSON.parse(JSON.stringify(STOCKS_DB));
let LIVE_INDICES = JSON.parse(JSON.stringify(INDICES));
window.LIVE_STOCKS = LIVE_STOCKS;
window.LIVE_INDICES = LIVE_INDICES;


function tickMarket() {
  LIVE_STOCKS.forEach(s => {
    const delta = s.price * (Math.random() * 0.006 - 0.003);
    const base  = STOCKS_DB.find(b => b.ticker === s.ticker);
    s.price     = parseFloat((s.price + delta).toFixed(2));
    s.change    = parseFloat((s.price - base.price + base.change).toFixed(2));
    s.changePct = parseFloat(((s.change / base.price) * 100).toFixed(2));
    s.volume   += Math.floor(Math.random() * 5000 - 2500);
  });
  Object.keys(LIVE_INDICES).forEach(k => {
    const delta = LIVE_INDICES[k].value * (Math.random() * 0.004 - 0.002);
    LIVE_INDICES[k].value    = parseFloat((LIVE_INDICES[k].value + delta).toFixed(2));
    const base = INDICES[k];
    LIVE_INDICES[k].change   = parseFloat((LIVE_INDICES[k].value - base.value + base.change).toFixed(2));
    LIVE_INDICES[k].changePct= parseFloat(((LIVE_INDICES[k].change / base.value) * 100).toFixed(2));
  });
  document.dispatchEvent(new CustomEvent('market:tick'));
}

let marketInterval = setInterval(tickMarket, 5000);

window.stopSimulation = function() {
  if (marketInterval) {
    clearInterval(marketInterval);
    marketInterval = null;
    console.log("SaarthiX: Local market simulation paused. Switched to Groww Live Data.");
  }
};

window.restartSimulation = function() {
  if (!marketInterval) {
    marketInterval = setInterval(tickMarket, 5000);
    console.log("SaarthiX: Local market simulation resumed.");
  }
};


// ── Utilities ─────────────────────────────────────────────────
function fmtPrice(n) {
  if (n == null) return '—';
  return '\u20B9' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtINR(n) {
  if (n == null) return '—';
  const a = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (a >= 1e7) return sign + '\u20B9' + (a / 1e7).toFixed(2) + ' Cr';
  if (a >= 1e5) return sign + '\u20B9' + (a / 1e5).toFixed(2) + ' L';
  return sign + '\u20B9' + a.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtVol(n) {
  if (n >= 1e7) return (n / 1e7).toFixed(2) + ' Cr';
  if (n >= 1e5) return (n / 1e5).toFixed(2) + ' L';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}
function changeClass(v)  { return v >= 0 ? 'text-secondary' : 'text-error'; }
function changeBg(v)     { return v >= 0 ? 'bg-secondary/10 border-secondary/20' : 'bg-error/10 border-error/20'; }
function changeIcon(v)   { return v >= 0 ? 'trending_up' : 'trending_down'; }
function changeSign(v)   { return v >= 0 ? '+' : ''; }
function getTopGainers(n=5) { return [...LIVE_STOCKS].sort((a,b)=>b.changePct-a.changePct).slice(0,n); }
function getTopLosers(n=5)  { return [...LIVE_STOCKS].sort((a,b)=>a.changePct-b.changePct).slice(0,n); }

function getSectorSummary() {
  const map = {};
  LIVE_STOCKS.forEach(s => {
    if (!map[s.sector]) map[s.sector] = { stocks:0, total:0 };
    map[s.sector].stocks++;
    map[s.sector].total += s.changePct;
  });
  return Object.entries(map)
    .map(([sector,d]) => ({ sector, stocks:d.stocks, avgChangePct: parseFloat((d.total/d.stocks).toFixed(2)) }))
    .sort((a,b) => b.avgChangePct - a.avgChangePct);
}

function getMarketBreadth() {
  const adv = LIVE_STOCKS.filter(s => s.changePct > 0).length;
  const dec = LIVE_STOCKS.filter(s => s.changePct < 0).length;
  return { advances: adv, declines: dec, unchanged: LIVE_STOCKS.length - adv - dec, total: LIVE_STOCKS.length };
}

function isMarketOpen() {
  const ist = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const d = ist.getDay(), h = ist.getHours(), m = ist.getMinutes();
  if (d === 0 || d === 6) return false;
  const mins = h * 60 + m;
  return mins >= 555 && mins <= 930;
}

// ── Shared Nav ─────────────────────────────────────────────────
function buildNav(activePage) {
  const links = [
    { id:'dashboard',    label:'Dashboard',    icon:'dashboard',             href:'dashboard.html' },
    { id:'portfolio',    label:'Portfolio',    icon:'account_balance_wallet', href:'portfolio.html' },
    { id:'market-watch', label:'Market Watch', icon:'show_chart',            href:'market-watch.html' },
    { id:'ai-insights',  label:'AI Insights',  icon:'psychology',            href:'ai-insights.html' },
    { id:'news',         label:'News',         icon:'newspaper',             href:'news.html' },
    { id:'settings',     label:'Settings',     icon:'settings',              href:'#' },
  ];
  const navLinks = links.map(l => {
    const a = l.id === activePage;
    const fill = a ? `style="font-variation-settings:'FILL' 1;"` : '';
    const cls  = a ? 'text-primary font-bold border-r-2 border-primary bg-white/5' : 'text-on-surface-variant font-medium hover:bg-white/5 hover:text-on-surface transition-all duration-200';
    return `<a class="flex items-center gap-3 px-4 py-3 rounded-lg ${cls} active:scale-[0.98] transition-transform" href="${l.href}" ${a?'aria-current="page"':''}><span class="material-symbols-outlined" ${fill}>${l.icon}</span><span class="font-label-md text-label-md">${l.label}</span></a>`;
  }).join('');
  const mobileLinks = links.slice(0,5).map(l => {
    const a = l.id === activePage;
    const fill = a ? `style="font-variation-settings:'FILL' 1;"` : '';
    return `<a href="${l.href}" class="flex flex-col items-center gap-0.5 ${a?'text-primary':'text-on-surface-variant hover:text-primary'} transition-colors px-2"><span class="material-symbols-outlined text-[22px]" ${fill}>${l.icon}</span><span style="font-size:10px;" class="font-label-sm">${l.label}</span></a>`;
  }).join('');
  const open = isMarketOpen();
  const statusDot = open
    ? `<span class="w-2 h-2 rounded-full bg-secondary inline-block animate-pulse mr-1"></span><span class="text-secondary">Live</span>`
    : `<span class="w-2 h-2 rounded-full bg-error inline-block mr-1"></span><span class="text-error">Closed</span>`;
  return { navLinks, mobileLinks, statusDot };
}

// ── News Data ─────────────────────────────────────────────────
const NEWS_DATA = [
  { id:1, headline:'Sensex surges 312 pts; RELIANCE & BHARTIARTL lead broad-based rally', summary:'Strong FII buying and positive global cues drove markets higher. Reliance Industries surged 1.2%, contributing the most to Sensex gains.', category:'BSE', sentiment:'bullish', time:'2h ago', ticker:'RELIANCE', tag:'Large Cap' },
  { id:2, headline:'RBI keeps repo rate unchanged at 6.5%; signals accommodative stance', summary:'The RBI MPC unanimously held repo rate steady, maintaining focus on withdrawal of accommodation to align inflation with target while supporting growth.', category:'Economy', sentiment:'neutral', time:'4h ago', ticker:null, tag:'Macro' },
  { id:3, headline:'INFY Q1 results beat estimates; revenue guidance raised to 4.5%–7%', summary:'Infosys reported 12% jump in net profit for Q1FY26, beating analyst estimates. Full-year revenue guidance raised citing strong deal wins in BFSI and manufacturing.', category:'NSE', sentiment:'bullish', time:'5h ago', ticker:'INFY', tag:'IT' },
  { id:4, headline:'TATAMOTORS EV sales hit record 15,000 units in June; stock rises 2%', summary:'Tata Motors reported record EV sales driven by Nexon EV and Punch EV. Company now holds 60% market share in India passenger EV segment.', category:'NSE', sentiment:'bullish', time:'6h ago', ticker:'TATAMOTORS', tag:'Auto' },
  { id:5, headline:'HDFCBANK NPAs rise marginally; analysts maintain BUY with revised target', summary:'HDFC Bank gross NPA ratio rose to 1.42% for Q1FY26 vs 1.33% in Q4FY25. Most analysts maintain BUY with revised 12-month target of Rs 2,100.', category:'NSE', sentiment:'neutral', time:'8h ago', ticker:'HDFCBANK', tag:'Banking' },
  { id:6, headline:"India's GDP growth pegged at 7.2% for FY26 by IMF; markets cheer", summary:"IMF raised India GDP growth forecast for FY2025-26 to 7.2% from 6.8%, citing strong domestic consumption and robust government capex.", category:'Economy', sentiment:'bullish', time:'10h ago', ticker:null, tag:'Macro' },
  { id:7, headline:'SUNPHARMA gets USFDA approval for generic drug; stock jumps 3%', summary:'Sun Pharma received tentative USFDA approval for generic cardiovascular drug. US market opportunity estimated at Rs 800 crore annually.', category:'NSE', sentiment:'bullish', time:'12h ago', ticker:'SUNPHARMA', tag:'Pharma' },
  { id:8, headline:'Coal India production at record high; Q1 EBITDA up 18% YoY', summary:'Coal India reported record quarterly production of 175 MT in Q1FY26. EBITDA grew 18% YoY driven by higher realisations and controlled costs.', category:'NSE', sentiment:'bullish', time:'1d ago', ticker:'COALINDIA', tag:'Mining' },
  { id:9, headline:'ADANIENT facing FPI selling; stock down 1.2% this week', summary:'Adani Enterprises has seen sustained FPI selling amid concerns about promoter debt levels and global commodity market headwinds.', category:'NSE', sentiment:'bearish', time:'1d ago', ticker:'ADANIENT', tag:'Conglomerate' },
  { id:10, headline:'Nifty IT index hits 52-week high; TCS and HCLTECH lead the charge', summary:'Nifty IT index touched fresh 52-week high of Rs 39,200 as global risk appetite improved and rupee depreciation benefited export-oriented tech firms.', category:'NSE', sentiment:'bullish', time:'1d ago', ticker:'HCLTECH', tag:'IT' },
  { id:11, headline:'MARUTI to hike prices by 2% from August; supply constraints ease', summary:'Maruti Suzuki announced 2% price hike across its lineup from August 1st. Analysts note easing semiconductor supply should boost volumes in H2FY26.', category:'NSE', sentiment:'neutral', time:'2d ago', ticker:'MARUTI', tag:'Auto' },
  { id:12, headline:'ITC Hotels demerger approved; 1 share for every 10 ITC shares held', summary:"ITC board approved demerger of hotels business. Shareholders get 1 ITC Hotels share per 10 ITC shares. Listing expected within 9-12 months.", category:'BSE', sentiment:'bullish', time:'2d ago', ticker:'ITC', tag:'FMCG' },
];

// ── AI Picks ──────────────────────────────────────────────────
const AI_PICKS = [
  { ticker:'BHARTIARTL', name:'Bharti Airtel Ltd.',    signal:'BUY',  targetPrice:1850, upside:13.2,  sector:'Telecom',  rationale:'5G subscriber additions accelerating; ARPU expansion intact. Strong institutional buying.', rsi:58, pe:82.4 },
  { ticker:'HCLTECH',    name:'HCL Technologies Ltd.', signal:'BUY',  targetPrice:1980, upside:14.8,  sector:'IT',       rationale:'Strong Q1 revenue visibility; new $500M manufacturing deal. Valuation discount to TCS unjustified.', rsi:62, pe:25.8 },
  { ticker:'SBIN',       name:'State Bank of India',   signal:'BUY',  targetPrice:950,  upside:15.2,  sector:'Banking',  rationale:'Healthy credit growth of 14% YoY; NPA cycle bottomed. RoE expansion expected in FY26.', rsi:55, pe:12.1 },
  { ticker:'ASIANPAINT', name:'Asian Paints Ltd.',     signal:'HOLD', targetPrice:2500, upside:9.4,   sector:'Consumer', rationale:'Margin recovery underway but volume growth muted at 5%. Await Q2 for trend confirmation.', rsi:48, pe:52.4 },
  { ticker:'DRREDDY',    name:"Dr. Reddy's Labs",      signal:'HOLD', targetPrice:7200, upside:5.5,   sector:'Pharma',   rationale:'USFDA resolution of key plant could be a catalyst. Short-term generic pricing headwinds.', rsi:45, pe:24.6 },
  { ticker:'ADANIENT',   name:'Adani Enterprises Ltd.',signal:'SELL', targetPrice:2600, upside:-10.7, sector:'Conglom.', rationale:'High promoter leverage remains a concern. Execution risk on new energy projects. Premium hard to sustain.', rsi:38, pe:98.4 },
];
