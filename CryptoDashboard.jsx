import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ComposedChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const COINS = [
  { id:"btc", name:"Bitcoin",   symbol:"BTC", price:67420,  change:2.34,  cap:"1.32T", vol:"28.4B", color:"#f7931a" },
  { id:"eth", name:"Ethereum",  symbol:"ETH", price:3842,   change:-1.12, cap:"461B",  vol:"15.2B", color:"#627eea" },
  { id:"sol", name:"Solana",    symbol:"SOL", price:178.4,  change:5.67,  cap:"82B",   vol:"4.1B",  color:"#9945ff" },
  { id:"bnb", name:"BNB",       symbol:"BNB", price:612.3,  change:0.88,  cap:"89B",   vol:"2.3B",  color:"#f3ba2f" },
  { id:"xrp", name:"XRP",       symbol:"XRP", price:0.618,  change:-2.10, cap:"34B",   vol:"1.8B",  color:"#00aae4" },
  { id:"ada", name:"Cardano",   symbol:"ADA", price:0.487,  change:3.21,  cap:"17B",   vol:"0.9B",  color:"#0088cc" },
];

function genHistory(base, days = 90, vol = 0.028) {
  let p = base * 0.82;
  return Array.from({ length: days + 1 }, (_, i) => {
    p = Math.max(p + (Math.random() - 0.478) * vol * p, base * 0.45);
    const o = p, c = p + (Math.random()-0.5)*vol*p*0.5;
    const h = Math.max(o,c)+(Math.random()*vol*p*0.25);
    const l = Math.min(o,c)-(Math.random()*vol*p*0.25);
    const d = new Date(); d.setDate(d.getDate()-(days-i));
    return { date:d.toLocaleDateString("en-US",{month:"short",day:"numeric"}),
      price:+p.toFixed(4), open:+o.toFixed(4), close:+c.toFixed(4),
      high:+h.toFixed(4), low:+l.toFixed(4),
      volume:Math.floor(Math.random()*5e9+8e8) };
  });
}

const ALL_HISTORY = Object.fromEntries(COINS.map(c=>[c.id, genHistory(c.price)]));

const PORTFOLIO = [
  { coin:"BTC", amount:0.42,  value:28316, alloc:42, avgBuy:61000, pnl: 7316, color:"#f7931a" },
  { coin:"ETH", amount:4.8,   value:18441, alloc:27, avgBuy:3200,  pnl: 3081, color:"#627eea" },
  { coin:"SOL", amount:68,    value:12131, alloc:18, avgBuy:145,   pnl: 2267, color:"#9945ff" },
  { coin:"BNB", amount:12,    value:7347,  alloc:11, avgBuy:580,   pnl:  387, color:"#f3ba2f" },
  { coin:"XRP", amount:2400,  value:1483,  alloc:2,  avgBuy:0.72,  pnl: -259, color:"#00aae4" },
];

const TRANSACTIONS = [
  { type:"buy",  coin:"BTC", amount:0.05,  price:66800, time:"2h ago",  total:3340  },
  { type:"sell", coin:"ETH", amount:1.2,   price:3900,  time:"5h ago",  total:4680  },
  { type:"buy",  coin:"SOL", amount:15,    price:172,   time:"1d ago",  total:2580  },
  { type:"buy",  coin:"BNB", amount:3,     price:605,   time:"2d ago",  total:1815  },
  { type:"sell", coin:"XRP", amount:500,   price:0.64,  time:"3d ago",  total:320   },
];

const NEWS = [
  { title:"Bitcoin ETF inflows hit record $1.2B in a single session",  time:"1h ago",  tag:"BTC", bull:true  },
  { title:"Ethereum devs green-light next upgrade for Q3 deployment",   time:"3h ago",  tag:"ETH", bull:true  },
  { title:"SEC delays ruling on Solana spot ETF applications",           time:"6h ago",  tag:"SOL", bull:false },
  { title:"Global crypto market cap surpasses $2.5 trillion milestone",  time:"8h ago",  tag:"MKT", bull:true  },
  { title:"Binance granted regulatory approval across 12 new markets",   time:"12h ago", tag:"BNB", bull:true  },
  { title:"On-chain data signals XRP accumulation by large wallets",     time:"18h ago", tag:"XRP", bull:true  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fp = (n) => n >= 1000 ? `$${n.toLocaleString(undefined,{maximumFractionDigits:0})}` : `$${n.toFixed(n<0.1?4:2)}`;
const fc = (n) => (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
const green = "#10b981", red = "#ef4444";

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label, dark }) => {
  if (!active || !payload?.length) return null;
  const card = dark ? "#141520" : "#fff";
  const border = dark ? "#252840" : "#dde2f0";
  const text = dark ? "#e2e4f0" : "#1a1d30";
  return (
    <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 8, padding: "8px 12px", fontSize: 11, color: text }}>
      <div style={{ marginBottom: 4, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || text }}>
          {p.name}: <b>{typeof p.value === "number" && p.value > 1e6 ? `$${(p.value/1e9).toFixed(2)}B` : fp(p.value)}</b>
        </div>
      ))}
    </div>
  );
};

// ─── SKELETON ─────────────────────────────────────────────────────────────────
const Sk = ({ w = "100%", h = 20, r = 6, style = {} }) => (
  <div style={{ width: w, height: h, borderRadius: r, background: "linear-gradient(90deg,#1a1d2a 25%,#222538 50%,#1a1d2a 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.6s infinite", ...style }} />
);

// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [dark, setDark] = useState(true);
  const [coin, setCoin]  = useState(COINS[0]);
  const [chart, setChart] = useState("area");
  const [range, setRange] = useState("30D");
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState(() => Object.fromEntries(COINS.map(c=>[c.id,c.price])));
  const [flash,  setFlash]  = useState({});

  // Simulate skeleton load
  useEffect(() => { const t = setTimeout(()=>setLoading(false), 1400); return ()=>clearTimeout(t); }, []);

  // Simulate live prices
  useEffect(() => {
    const id = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        const fl = {};
        COINS.forEach(c => {
          const delta = (Math.random()-0.499)*c.price*0.0008;
          next[c.id] = +(prev[c.id]+delta).toFixed(c.price>10?2:4);
          fl[c.id] = delta >= 0 ? "up" : "dn";
        });
        setFlash(fl);
        setTimeout(()=>setFlash({}), 400);
        return next;
      });
    }, 2200);
    return ()=>clearInterval(id);
  }, []);

  const history = ALL_HISTORY[coin.id] || [];
  const sliced = history.slice(range==="7D"?-7:range==="30D"?-30:-90);
  const ptotal = PORTFOLIO.reduce((s,p)=>s+p.value, 0);
  const ppnl   = PORTFOLIO.reduce((s,p)=>s+p.pnl, 0);

  // Theme tokens
  const T = {
    bg:   dark?"#080a12":"#eef0f8",
    surf: dark?"#0e1020":"#ffffff",
    bd:   dark?"#1c1f35":"#dde2f0",
    tx:   dark?"#dde2ef":"#1a1d30",
    mu:   dark?"#5a5f80":"#8892a8",
    ac:   "#00d4ff",
    gold: "#f0b429",
  };

  const card = (extra={}) => ({
    background: T.surf, border:`1px solid ${T.bd}`, borderRadius:12, padding:16, ...extra
  });

  const btn = (on, color=T.ac) => ({
    padding:"4px 11px", borderRadius:6, border:"none", cursor:"pointer", fontSize:11,
    fontWeight:600, letterSpacing:"0.04em", transition:"all 0.18s",
    background: on ? color+"22" : "transparent",
    color: on ? color : T.mu,
    outline: on ? `1px solid ${color}55` : "none",
  });

  const badge = (bull) => ({
    display:"inline-flex", alignItems:"center", gap:3,
    padding:"2px 7px", borderRadius:4, fontSize:10, fontWeight:700,
    background: bull?"rgba(16,185,129,0.13)":"rgba(239,68,68,0.13)",
    color: bull ? green : red,
  });

  // ─── LOADING STATE ─────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#080a12", color:"#dde2ef", fontFamily:"'DM Mono','Courier New',monospace" }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 24px", borderBottom:"1px solid #1c1f35", background:"#0e1020" }}>
        <Sk w={100} h={22} />
        <div style={{flex:1}}/>
        <Sk w={70} h={28} />
      </div>
      <div style={{ padding:20 }}>
        <Sk h={36} style={{marginBottom:16}}/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16 }}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Sk h={56}/>
            <Sk h={290}/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
              {[0,1,2,3].map(i=><Sk key={i} h={72}/>)}
            </div>
            <Sk h={200}/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Sk h={280}/><Sk h={160}/><Sk h={200}/><Sk h={180}/>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── MAIN DASHBOARD ────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.tx, fontFamily:"'DM Mono','Courier New',monospace", fontSize:12 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes flashG{0%,100%{background:transparent}50%{background:rgba(16,185,129,0.18)}}
        @keyframes flashR{0%,100%{background:transparent}50%{background:rgba(239,68,68,0.18)}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:#252840;border-radius:2px}
        .row:hover{background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"}!important;cursor:pointer}
        .flash-up{animation:flashG 0.4s ease}
        .flash-dn{animation:flashR 0.4s ease}
        .hov:hover{opacity:0.75!important;cursor:pointer}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ display:"flex", alignItems:"center", padding:"10px 22px", borderBottom:`1px solid ${T.bd}`, background:T.surf, gap:14, position:"sticky", top:0, zIndex:200 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:800, color:T.ac, letterSpacing:"-0.5px" }}>◈ RUNTIME CRYPTO</div>
        <div style={{ flex:1 }}/>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:green, display:"inline-block", boxShadow:`0 0 7px ${green}` }}/>
          <span style={{ color:T.mu, fontSize:10, letterSpacing:"0.1em" }}>LIVE</span>
        </div>
        <div style={{ width:1, height:18, background:T.bd, margin:"0 4px" }}/>
        <div style={{ color:T.mu, fontSize:10 }}>
          {new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
        </div>
        <button onClick={()=>setDark(!dark)} style={{ ...btn(false), border:`1px solid ${T.bd}`, color:T.tx, padding:"5px 14px" }}>
          {dark?"☀ Light":"☾ Dark"}
        </button>
      </div>

      {/* ── TICKER STRIP ── */}
      <div style={{ overflow:"hidden", borderBottom:`1px solid ${T.bd}`, background:dark?"#090b14":T.surf, padding:"7px 0" }}>
        <div style={{ display:"flex", animation:"ticker 28s linear infinite", whiteSpace:"nowrap", gap:0 }}>
          {[...COINS,...COINS].map((c,i) => (
            <span key={i} className={flash[c.id]==="up"?"flash-up":flash[c.id]==="dn"?"flash-dn":""}
              style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"0 22px", borderRight:`1px solid ${T.bd}` }}>
              <span style={{ color:c.color, fontWeight:600, fontSize:11 }}>{c.symbol}</span>
              <span style={{ color:T.tx, fontSize:11 }}>{fp(prices[c.id])}</span>
              <span style={{ color:c.change>=0?green:red, fontSize:10 }}>{fc(c.change)}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ padding:18, maxWidth:1380, margin:"0 auto" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16 }}>

        {/* LEFT */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Coin Selector + Live Price */}
          <div style={{ ...card(), display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {COINS.map(c => (
                <button key={c.id} onClick={()=>setCoin(c)} style={{
                  padding:"5px 11px", borderRadius:7, border:`1.5px solid ${coin.id===c.id?c.color:T.bd}`,
                  background: coin.id===c.id ? `${c.color}15` : "transparent",
                  color: coin.id===c.id ? c.color : T.mu,
                  cursor:"pointer", fontSize:11, fontWeight:600, transition:"all 0.18s"
                }}>{c.symbol}</button>
              ))}
            </div>
            <div style={{ flex:1 }}/>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:30, fontWeight:800, letterSpacing:"-1.5px", color:T.tx }}>
                {fp(prices[coin.id])}
              </div>
              <span style={{ ...badge(coin.change>=0), marginTop:4 }}>
                {coin.change>=0?"▲":"▼"} {Math.abs(coin.change).toFixed(2)}% 24H
              </span>
            </div>
          </div>

          {/* Chart */}
          <div style={{ ...card() }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:14, flexWrap:"wrap" }}>
              <span style={{ color:T.mu, fontSize:10, letterSpacing:"0.08em", marginRight:4 }}>TYPE</span>
              {[["area","Line"],["bar","Volume"],["composed","Candle"]].map(([t,l])=>(
                <button key={t} onClick={()=>setChart(t)} style={btn(chart===t)}>{l}</button>
              ))}
              <div style={{ flex:1 }}/>
              <span style={{ color:T.mu, fontSize:10, letterSpacing:"0.08em" }}>RANGE</span>
              {["7D","30D","90D"].map(r=>(
                <button key={r} onClick={()=>setRange(r)} style={btn(range===r)}>{r}</button>
              ))}
            </div>

            <ResponsiveContainer width="100%" height={255}>
              {chart==="area" ? (
                <AreaChart data={sliced}>
                  <defs>
                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={coin.color} stopOpacity={0.28}/>
                      <stop offset="100%" stopColor={coin.color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke={T.bd} vertical={false}/>
                  <XAxis dataKey="date" tick={{fill:T.mu,fontSize:9}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                  <YAxis tick={{fill:T.mu,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={fp} width={68}/>
                  <Tooltip content={<ChartTip dark={dark}/>}/>
                  <Area type="monotone" dataKey="price" name="Price" stroke={coin.color} fill="url(#cg)" strokeWidth={2} dot={false} activeDot={{r:4,fill:coin.color}}/>
                </AreaChart>
              ) : chart==="bar" ? (
                <BarChart data={sliced}>
                  <CartesianGrid strokeDasharray="2 4" stroke={T.bd} vertical={false}/>
                  <XAxis dataKey="date" tick={{fill:T.mu,fontSize:9}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                  <YAxis tick={{fill:T.mu,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1e9).toFixed(1)}B`} width={52}/>
                  <Tooltip content={<ChartTip dark={dark}/>}/>
                  <Bar dataKey="volume" name="Volume" fill={coin.color} opacity={0.75} radius={[3,3,0,0]}/>
                </BarChart>
              ) : (
                <ComposedChart data={sliced}>
                  <CartesianGrid strokeDasharray="2 4" stroke={T.bd} vertical={false}/>
                  <XAxis dataKey="date" tick={{fill:T.mu,fontSize:9}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                  <YAxis tick={{fill:T.mu,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={fp} width={68}/>
                  <Tooltip content={<ChartTip dark={dark}/>}/>
                  <Bar dataKey="high"  name="High"  fill={coin.color}  opacity={0.22} radius={[2,2,0,0]}/>
                  <Bar dataKey="low"   name="Low"   fill={red}         opacity={0.18} radius={[2,2,0,0]}/>
                  <Line type="monotone" dataKey="close" name="Close" stroke={coin.color} dot={false} strokeWidth={2}/>
                  <Line type="monotone" dataKey="open"  name="Open"  stroke={T.gold}    dot={false} strokeWidth={1.5} strokeDasharray="4 3"/>
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Market Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {[
              { lbl:"MARKET CAP",  val:`$${coin.cap}`,     ic:"◎" },
              { lbl:"24H VOLUME",  val:`$${coin.vol}`,     ic:"⟳" },
              { lbl:"CIRCULATING", val:"19.7M BTC",        ic:"◈" },
              { lbl:"52W HIGH",    val:fp(coin.price*1.19), ic:"△" },
            ].map((s,i)=>(
              <div key={i} style={{ ...card({padding:12}) }}>
                <div style={{ color:T.mu, fontSize:9, marginBottom:5, letterSpacing:"0.08em" }}>{s.ic} {s.lbl}</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:T.tx }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Market Table */}
          <div style={{ ...card() }}>
            <div style={{ fontSize:10, color:T.mu, fontWeight:600, marginBottom:10, letterSpacing:"0.1em" }}>ALL MARKETS</div>
            <div style={{ display:"grid", gridTemplateColumns:"2.2fr 1fr 1fr 1fr 90px", gap:6, padding:"0 8px 8px", borderBottom:`1px solid ${T.bd}`, color:T.mu, fontSize:9, letterSpacing:"0.07em" }}>
              {["ASSET","PRICE","24H","MARKET CAP","SIGNAL"].map((h,i)=>(
                <span key={i} style={{ textAlign:i>0?"right":"left" }}>{h}</span>
              ))}
            </div>
            {COINS.map(c => {
              const p = prices[c.id];
              const bull = c.change >= 0;
              return (
                <div key={c.id} className="row" onClick={()=>setCoin(c)} style={{
                  display:"grid", gridTemplateColumns:"2.2fr 1fr 1fr 1fr 90px", gap:6,
                  padding:"9px 8px", borderRadius:7, borderBottom:`1px solid ${T.bd}`,
                  alignItems:"center", transition:"background 0.15s"
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <div style={{ width:26,height:26,borderRadius:"50%", background:`${c.color}18`, border:`1.5px solid ${c.color}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:c.color, fontWeight:700 }}>
                      {c.symbol.slice(0,2)}
                    </div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:12 }}>{c.symbol}</div>
                      <div style={{ color:T.mu, fontSize:9 }}>{c.name}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:"right", fontWeight:500, fontFamily:"'Syne',sans-serif", fontSize:12 }}>{fp(p)}</div>
                  <div style={{ textAlign:"right", color:bull?green:red, fontWeight:600 }}>{fc(c.change)}</div>
                  <div style={{ textAlign:"right", color:T.mu }}>${c.cap}</div>
                  <div style={{ textAlign:"right" }}>
                    <span style={{ ...badge(bull), fontSize:9 }}>{bull?"▲ BULL":"▼ BEAR"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Portfolio Value */}
          <div style={{ ...card() }}>
            <div style={{ fontSize:9, color:T.mu, letterSpacing:"0.1em", marginBottom:4 }}>TOTAL PORTFOLIO VALUE</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:32, fontWeight:800, letterSpacing:"-1.5px" }}>
              ${ptotal.toLocaleString()}
            </div>
            <div style={{ display:"flex", gap:10, marginTop:6, alignItems:"center" }}>
              <span style={{ ...badge(ppnl>=0), fontSize:11 }}>
                {ppnl>=0?"+":""} ${ppnl.toLocaleString()} all time
              </span>
            </div>

            {/* Donut */}
            <ResponsiveContainer width="100%" height={148}>
              <PieChart>
                <Pie data={PORTFOLIO} dataKey="alloc" cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={3} strokeWidth={0}>
                  {PORTFOLIO.map((p,i)=><Cell key={i} fill={p.color}/>)}
                </Pie>
                <Tooltip
                  contentStyle={{background:T.surf,border:`1px solid ${T.bd}`,borderRadius:8,color:T.tx,fontSize:11}}
                  formatter={(v,_,props)=>[`${v}%`, props.payload.coin]}/>
              </PieChart>
            </ResponsiveContainer>

            {PORTFOLIO.map((p,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 0", borderBottom: i<PORTFOLIO.length-1?`1px solid ${T.bd}`:"none" }}>
                <div style={{ width:8,height:8,borderRadius:2,background:p.color,flexShrink:0 }}/>
                <span style={{ flex:1, color:T.mu, fontSize:10 }}>{p.coin}</span>
                <span style={{ fontSize:10 }}>{p.alloc}%</span>
                <span style={{ fontSize:10, color:p.pnl>=0?green:red, minWidth:56, textAlign:"right" }}>
                  {p.pnl>=0?"+":""}{p.pnl < 0 ? "-" : ""}${Math.abs(p.pnl).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Watchlist */}
          <div style={{ ...card() }}>
            <div style={{ fontSize:9, color:T.mu, letterSpacing:"0.1em", marginBottom:10 }}>◈ WATCHLIST</div>
            {COINS.slice(0,5).map(c=>(
              <div key={c.id} className="row" onClick={()=>setCoin(c)} style={{
                display:"flex", alignItems:"center", gap:8, padding:"7px 4px",
                borderRadius:6, transition:"background 0.15s"
              }}>
                <div style={{ width:7,height:7,borderRadius:"50%",background:c.color,flexShrink:0 }}/>
                <span style={{ fontWeight:600, fontSize:12, flex:1, color:T.tx }}>{c.symbol}</span>
                <span style={{ fontSize:11, fontFamily:"'Syne',sans-serif" }}>{fp(prices[c.id])}</span>
                <span style={{ fontSize:10, color:c.change>=0?green:red, minWidth:44, textAlign:"right" }}>{fc(c.change)}</span>
              </div>
            ))}
          </div>

          {/* Transactions */}
          <div style={{ ...card() }}>
            <div style={{ fontSize:9, color:T.mu, letterSpacing:"0.1em", marginBottom:10 }}>⟳ RECENT TRANSACTIONS</div>
            {TRANSACTIONS.map((t,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 0", borderBottom: i<TRANSACTIONS.length-1?`1px solid ${T.bd}`:"none" }}>
                <span style={{
                  padding:"3px 7px", borderRadius:4, fontSize:9, fontWeight:700,
                  background: t.type==="buy"?"rgba(16,185,129,0.15)":"rgba(239,68,68,0.15)",
                  color: t.type==="buy"?green:red, flexShrink:0
                }}>{t.type.toUpperCase()}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:500 }}>{t.amount} {t.coin}</div>
                  <div style={{ fontSize:9, color:T.mu }}>@ {fp(t.price)} · {t.time}</div>
                </div>
                <div style={{ textAlign:"right", fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:600 }}>
                  ${t.total.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── FULL-WIDTH NEWS FEED ── */}
      <div style={{ ...card(), marginTop:16 }}>
        <div style={{ fontSize:9, color:T.mu, letterSpacing:"0.1em", marginBottom:12 }}>◎ NEWS FEED</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:10 }}>
          {NEWS.map((n,i)=>(
            <div key={i} className="hov" style={{
              padding:"10px 12px", borderRadius:8, transition:"opacity 0.15s",
              border:`1px solid ${T.bd}`, cursor:"pointer"
            }}>
              <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:6 }}>
                <span style={{ padding:"1px 6px", borderRadius:3, fontSize:9, fontWeight:700,
                  background:`${n.bull?"rgba(16,185,129,0.2)":"rgba(239,68,68,0.2)"}`,
                  color: n.bull?green:red }}>{n.tag}</span>
                <span style={{ fontSize:9, color:T.mu }}>{n.time}</span>
                <span style={{ fontSize:9, color:n.bull?green:red, marginLeft:"auto" }}>
                  {n.bull?"▲ Bullish":"▼ Bearish"}
                </span>
              </div>
              <div style={{ fontSize:11, lineHeight:1.5, color:T.tx }}>{n.title}</div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
