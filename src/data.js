export const COINS = [
  { id:"btc", name:"Bitcoin",  symbol:"BTC", price:67420, change:2.34,  cap:"1.32T", vol:"28.4B", color:"#f7931a" },
  { id:"eth", name:"Ethereum", symbol:"ETH", price:3842,  change:-1.12, cap:"461B",  vol:"15.2B", color:"#627eea" },
  { id:"sol", name:"Solana",   symbol:"SOL", price:178.4, change:5.67,  cap:"82B",   vol:"4.1B",  color:"#9945ff" },
  { id:"bnb", name:"BNB",      symbol:"BNB", price:612.3, change:0.88,  cap:"89B",   vol:"2.3B",  color:"#f3ba2f" },
  { id:"xrp", name:"XRP",      symbol:"XRP", price:0.618, change:-2.10, cap:"34B",   vol:"1.8B",  color:"#00aae4" },
  { id:"ada", name:"Cardano",  symbol:"ADA", price:0.487, change:3.21,  cap:"17B",   vol:"0.9B",  color:"#0088cc" },
];

export function genHistory(base, days=90, vol=0.028) {
  let p = base * 0.82;
  return Array.from({ length: days+1 }, (_,i) => {
    p = Math.max(p + (Math.random()-0.478)*vol*p, base*0.45);
    const o=p, c=p+(Math.random()-0.5)*vol*p*0.5;
    const h=Math.max(o,c)+(Math.random()*vol*p*0.25);
    const l=Math.min(o,c)-(Math.random()*vol*p*0.25);
    const d=new Date(); d.setDate(d.getDate()-(days-i));
    return { date:d.toLocaleDateString("en-US",{month:"short",day:"numeric"}),
      price:+p.toFixed(4), open:+o.toFixed(4), close:+c.toFixed(4),
      high:+h.toFixed(4), low:+l.toFixed(4),
      volume:Math.floor(Math.random()*5e9+8e8) };
  });
}

export const ALL_HISTORY = Object.fromEntries(COINS.map(c=>[c.id, genHistory(c.price)]));

export const PORTFOLIO = [
  { coin:"BTC", amount:0.42, value:28316, alloc:42, avgBuy:61000, pnl:7316,  color:"#f7931a" },
  { coin:"ETH", amount:4.8,  value:18441, alloc:27, avgBuy:3200,  pnl:3081,  color:"#627eea" },
  { coin:"SOL", amount:68,   value:12131, alloc:18, avgBuy:145,   pnl:2267,  color:"#9945ff" },
  { coin:"BNB", amount:12,   value:7347,  alloc:11, avgBuy:580,   pnl:387,   color:"#f3ba2f" },
  { coin:"XRP", amount:2400, value:1483,  alloc:2,  avgBuy:0.72,  pnl:-259,  color:"#00aae4" },
];

export const TRANSACTIONS = [
  { type:"buy",  coin:"BTC", amount:0.05, price:66800, time:"2h ago",  total:3340 },
  { type:"sell", coin:"ETH", amount:1.2,  price:3900,  time:"5h ago",  total:4680 },
  { type:"buy",  coin:"SOL", amount:15,   price:172,   time:"1d ago",  total:2580 },
  { type:"buy",  coin:"BNB", amount:3,    price:605,   time:"2d ago",  total:1815 },
  { type:"sell", coin:"XRP", amount:500,  price:0.64,  time:"3d ago",  total:320  },
];

export const NEWS = [
  { title:"Bitcoin ETF inflows hit record $1.2B in a single session",         time:"1h ago",  tag:"BTC", bull:true,  source:"CoinDesk",    body:"Institutional demand for Bitcoin ETFs continues to surge. BlackRock's IBIT led the charge with over $680M in net inflows, pushing the total single-day record past $1.2 billion. Analysts attribute the spike to improving macro sentiment and anticipated Fed rate cuts." },
  { title:"Ethereum devs green-light next upgrade for Q3 deployment",          time:"3h ago",  tag:"ETH", bull:true,  source:"The Block",   body:"The Ethereum core developer call reached consensus on deploying the next major upgrade targeting Q3 2026. The upgrade includes EIP-7702 and several gas optimisation improvements expected to reduce Layer-2 costs by up to 40%." },
  { title:"SEC delays ruling on Solana spot ETF applications",                  time:"6h ago",  tag:"SOL", bull:false, source:"Reuters",     body:"The U.S. Securities and Exchange Commission extended its review period for multiple Solana spot ETF applications by 90 days, citing the need for additional public comment. Market participants had widely expected an approval decision this quarter." },
  { title:"Global crypto market cap surpasses $2.5 trillion milestone",         time:"8h ago",  tag:"MKT", bull:true,  source:"Bloomberg",   body:"Total cryptocurrency market capitalisation crossed $2.5 trillion for the first time since November 2021, fuelled by record ETF inflows, growing stablecoin adoption, and renewed retail interest heading into the summer." },
  { title:"Binance granted regulatory approval across 12 new markets",          time:"12h ago", tag:"BNB", bull:true,  source:"CryptoSlate", body:"Binance has secured operating licences in 12 additional jurisdictions, including several in Southeast Asia and the Middle East, in what the exchange calls its biggest regulatory milestone. BNB token rose 3% on the news before settling." },
  { title:"On-chain data signals XRP accumulation by large wallets",            time:"18h ago", tag:"XRP", bull:true,  source:"Glassnode",   body:"Blockchain analytics firm Glassnode reports that wallets holding between 1M and 10M XRP have increased their positions by 8% over the past two weeks, a classic accumulation pattern historically associated with pre-rally phases." },
  { title:"Cardano's Chang hard fork activates on mainnet successfully",        time:"22h ago", tag:"ADA", bull:true,  source:"IOHK Blog",   body:"The Chang hard fork, Cardano's first step toward full on-chain governance, activated on mainnet without incident. Community members can now delegate voting power and participate directly in treasury decisions worth over $1.3B in ADA." },
  { title:"Crypto venture funding rebounds to $3.2B in Q1 2026",               time:"1d ago",  tag:"MKT", bull:true,  source:"PitchBook",   body:"Venture capital investment into crypto and Web3 startups rebounded sharply in Q1 2026, reaching $3.2 billion — a 78% increase year-over-year. Infrastructure, DePIN, and AI-blockchain integration were the top funded categories." },
  { title:"Tether mints $2B USDT amid rising demand from Asian markets",        time:"1d ago",  tag:"MKT", bull:true,  source:"Whale Alert", body:"Tether Treasury minted an additional $2 billion USDT over 48 hours, with on-chain flows suggesting heavy demand originating from OTC desks serving Asian institutional clients preparing for large BTC purchases." },
  { title:"US Senate advances Digital Asset Market Structure bill",             time:"2d ago",  tag:"MKT", bull:true,  source:"Politico",    body:"The bipartisan Digital Asset Market Structure Act cleared a key Senate committee vote 14-7, moving closer to a full floor vote. The bill would provide clear jurisdiction guidelines between the SEC and CFTC for crypto assets." },
  { title:"Solana DeFi TVL hits all-time high at $12.4B",                      time:"2d ago",  tag:"SOL", bull:true,  source:"DeFiLlama",   body:"Total Value Locked across Solana-based DeFi protocols reached an all-time high of $12.4 billion, with Jupiter, Marinade, and Kamino collectively accounting for over 60% of the ecosystem's liquidity." },
  { title:"Mt. Gox creditor repayments near completion, selling pressure fades",time:"3d ago",  tag:"BTC", bull:true,  source:"CoinTelegraph",body:"On-chain trackers confirm that approximately 94% of the originally owed 142,000 BTC has now been distributed to Mt. Gox creditors. With selling pressure from remaining coins expected to be minimal, analysts see a structural tailwind for Bitcoin heading into Q3." },
];

export const fp = (n) => n>=1000 ? `$${n.toLocaleString(undefined,{maximumFractionDigits:0})}` : `$${n.toFixed(n<0.1?4:2)}`;
export const fc = (n) => (n>=0?"+":"") + n.toFixed(2) + "%";
export const green = "#10b981", red = "#ef4444";

// Generate portfolio total value history (90 days)
function genPortfolioHistory() {
  const total = PORTFOLIO.reduce((s,p)=>s+p.value,0);
  let v = total * 0.72;
  return Array.from({length:91},(_,i)=>{
    v = Math.max(v+(Math.random()-0.46)*v*0.018, total*0.5);
    const d=new Date(); d.setDate(d.getDate()-(90-i));
    return {
      date: d.toLocaleDateString("en-US",{month:"short",day:"numeric"}),
      total: +v.toFixed(0),
      btc:   +( v*0.42).toFixed(0),
      eth:   +( v*0.27).toFixed(0),
      sol:   +( v*0.18).toFixed(0),
      bnb:   +( v*0.11).toFixed(0),
      xrp:   +( v*0.02).toFixed(0),
    };
  });
}
export const PORTFOLIO_HISTORY = genPortfolioHistory();
