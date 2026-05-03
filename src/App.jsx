import { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { COINS, ALL_HISTORY, PORTFOLIO, TRANSACTIONS, NEWS, fp, fc, green, red } from "./data.js";
import NewsPage from "./pages/NewsPage.jsx";
import MarketsPage from "./pages/MarketsPage.jsx";
import PortfolioPage from "./pages/PortfolioPage.jsx";


const Sk = ({ w="100%", h=20, r=6, style={} }) => (
  <div style={{ width:w, height:h, borderRadius:r, background:"linear-gradient(90deg,#1a1d2a 25%,#222538 50%,#1a1d2a 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.6s infinite", ...style }} />
);

const ChartTip = ({ active, payload, label, dark }) => {
  if (!active || !payload?.length) return null;
  const bg = dark?"#141520":"#fff", bd = dark?"#252840":"#dde2f0", tx = dark?"#e2e4f0":"#1a1d30";
  return (
    <div style={{ background:bg, border:`1px solid ${bd}`, borderRadius:8, padding:"8px 12px", fontSize:11, color:tx }}>
      <div style={{ marginBottom:4, fontWeight:600 }}>{label}</div>
      {payload.map((p,i) => <div key={i} style={{ color:p.color||tx }}>{p.name}: <b>{typeof p.value==="number"&&p.value>1e6?`$${(p.value/1e9).toFixed(2)}B`:fp(p.value)}</b></div>)}
    </div>
  );
};

const PAGES = ["Dashboard","Portfolio","Markets","News"];

export default function App() {
  const [dark, setDark]     = useState(true);
  const [page, setPage]     = useState("Dashboard");
  const [coin, setCoin]     = useState(COINS[0]);
  const [chart, setChart]   = useState("area");
  const [range, setRange]   = useState("30D");
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState(() => Object.fromEntries(COINS.map(c=>[c.id,c.price])));
  const [flash, setFlash]   = useState({});

  useEffect(() => { const t = setTimeout(()=>setLoading(false),1400); return ()=>clearTimeout(t); }, []);
  useEffect(() => {
    const id = setInterval(() => {
      setPrices(prev => {
        const next={...prev}, fl={};
        COINS.forEach(c => { const d=(Math.random()-0.499)*c.price*0.0008; next[c.id]=+(prev[c.id]+d).toFixed(c.price>10?2:4); fl[c.id]=d>=0?"up":"dn"; });
        setFlash(fl); setTimeout(()=>setFlash({}),400);
        return next;
      });
    }, 2200);
    return ()=>clearInterval(id);
  }, []);

  const history = ALL_HISTORY[coin.id]||[];
  const sliced  = history.slice(range==="7D"?-7:range==="30D"?-30:-90);
  const ptotal  = PORTFOLIO.reduce((s,p)=>s+p.value,0);
  const ppnl    = PORTFOLIO.reduce((s,p)=>s+p.pnl,0);

  const T = {
    bg:   dark?"#080a12":"#eef0f8",
    surf: dark?"#0e1020":"#ffffff",
    bd:   dark?"#1c1f35":"#dde2f0",
    tx:   dark?"#dde2ef":"#1a1d30",
    mu:   dark?"#5a5f80":"#8892a8",
    ac:   "#ffffff",
    gold: "#f0b429",
  };
  const card  = (e={}) => ({ background:T.surf, border:`1px solid ${T.bd}`, borderRadius:12, padding:16, ...e });
  const btn   = (on, color=T.ac) => ({ padding:"4px 11px", borderRadius:6, border:"none", cursor:"pointer", fontSize:11, fontWeight:600, letterSpacing:"0.04em", transition:"all 0.18s", background:on?color+"22":"transparent", color:on?color:T.mu, outline:on?`1px solid ${color}55`:"none" });
  const badge = (bull) => ({ display:"inline-flex", alignItems:"center", gap:3, padding:"2px 7px", borderRadius:4, fontSize:10, fontWeight:700, background:bull?"rgba(16,185,129,0.13)":"rgba(239,68,68,0.13)", color:bull?green:red });

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#080a12", color:"#dde2ef", fontFamily:"'DM Mono','Courier New',monospace" }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 24px", borderBottom:"1px solid #1c1f35", background:"#0e1020" }}>
        <Sk w={140} h={22}/><div style={{flex:1}}/><Sk w={70} h={28}/>
      </div>
      <div style={{ padding:20 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}><Sk h={56}/><Sk h={290}/><div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>{[0,1,2,3].map(i=><Sk key={i} h={72}/>)}</div><Sk h={200}/></div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}><Sk h={280}/><Sk h={160}/><Sk h={200}/></div>
        </div>
      </div>
    </div>
  );

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');
    @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    @keyframes flashG{0%,100%{background:transparent}50%{background:rgba(16,185,129,0.18)}}
    @keyframes flashR{0%,100%{background:transparent}50%{background:rgba(239,68,68,0.18)}}
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:3px;height:3px}
    ::-webkit-scrollbar-thumb{background:#252840;border-radius:2px}
    .flash-up{animation:flashG 0.4s ease}
    .flash-dn{animation:flashR 0.4s ease}
    .hov:hover{opacity:0.75!important;cursor:pointer}
    .row:hover{background:${dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)"}!important;cursor:pointer}
  `;

  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.tx, fontFamily:"'DM Mono','Courier New',monospace", fontSize:12 }}>
      <style>{globalStyles}</style>

      {/* HEADER */}
      <div style={{ display:"flex", alignItems:"center", padding:"10px 22px", borderBottom:`1px solid #000`, background:"#000000", gap:14, position:"sticky", top:0, zIndex:200 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:800, color:T.ac, letterSpacing:"-0.5px", cursor:"pointer" }} onClick={()=>setPage("Dashboard")}>◈ RUNTIME CRYPTO</div>

        {/* NAV TABS */}
        <div style={{ display:"flex", gap:2, marginLeft:24 }}>
          {PAGES.map(p => (
            <button key={p} onClick={()=>setPage(p)} style={{
              padding:"6px 16px", borderRadius:8, border:"none", cursor:"pointer",
              fontSize:11, fontWeight:600, letterSpacing:"0.04em", transition:"all 0.2s",
              background: page===p ? T.ac+"22" : "transparent",
              color: page===p ? T.ac : T.mu,
              borderBottom: page===p ? `2px solid ${T.ac}` : "2px solid transparent",
            }}>{p}</button>
          ))}
        </div>

        <div style={{ flex:1 }}/>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:green, display:"inline-block", boxShadow:`0 0 7px ${green}` }}/>
          <span style={{ color:T.mu, fontSize:10, letterSpacing:"0.1em" }}>LIVE</span>
        </div>
        <div style={{ width:1, height:18, background:T.bd, margin:"0 4px" }}/>
        <div style={{ color:T.mu, fontSize:10 }}>{new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>
        <button onClick={()=>setDark(!dark)} style={{ ...btn(false), border:`1px solid ${T.bd}`, color:T.tx, padding:"5px 14px" }}>{dark?"☀ Light":"☾ Dark"}</button>
      </div>

      {/* TICKER */}
      <div style={{ overflow:"hidden", borderBottom:`1px solid ${T.bd}`, background:dark?"#090b14":T.surf, padding:"7px 0" }}>
        <div style={{ display:"flex", animation:"ticker 28s linear infinite", whiteSpace:"nowrap" }}>
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

      {/* PAGE ROUTER */}
      {page==="News"      && <NewsPage      T={T} card={card} />}
      {page==="Markets"   && <MarketsPage   T={T} card={card} prices={prices} />}
      {page==="Portfolio" && <PortfolioPage T={T} card={card} />}

      {/* DASHBOARD */}
      {page==="Dashboard" && (
        <div style={{ padding:18, maxWidth:1920, margin:"0 auto", width:"100%" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16 }}>

            {/* LEFT */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* Coin selector */}
              <div style={{ ...card(), display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {COINS.map(c => (
                    <button key={c.id} onClick={()=>setCoin(c)} style={{
                      padding:"5px 11px", borderRadius:7, border:`1.5px solid ${coin.id===c.id?c.color:T.bd}`,
                      background:coin.id===c.id?`${c.color}15`:"transparent",
                      color:coin.id===c.id?c.color:T.mu, cursor:"pointer", fontSize:11, fontWeight:600, transition:"all 0.18s"
                    }}>{c.symbol}</button>
                  ))}
                </div>
                <div style={{ flex:1 }}/>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:30, fontWeight:800, letterSpacing:"-1.5px", color:T.tx }}>{fp(prices[coin.id])}</div>
                  <span style={{ ...badge(coin.change>=0), marginTop:4 }}>{coin.change>=0?"▲":"▼"} {Math.abs(coin.change).toFixed(2)}% 24H</span>
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
                  {chart==="area"?(
                    <AreaChart data={sliced}>
                      <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={coin.color} stopOpacity={0.28}/><stop offset="100%" stopColor={coin.color} stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="2 4" stroke={T.bd} vertical={false}/>
                      <XAxis dataKey="date" tick={{fill:T.mu,fontSize:9}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                      <YAxis tick={{fill:T.mu,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={fp} width={68}/>
                      <Tooltip content={<ChartTip dark={dark}/>}/>
                      <Area type="monotone" dataKey="price" name="Price" stroke={coin.color} fill="url(#cg)" strokeWidth={2} dot={false} activeDot={{r:4,fill:coin.color}}/>
                    </AreaChart>
                  ):chart==="bar"?(
                    <BarChart data={sliced}>
                      <CartesianGrid strokeDasharray="2 4" stroke={T.bd} vertical={false}/>
                      <XAxis dataKey="date" tick={{fill:T.mu,fontSize:9}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                      <YAxis tick={{fill:T.mu,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1e9).toFixed(1)}B`} width={52}/>
                      <Tooltip content={<ChartTip dark={dark}/>}/>
                      <Bar dataKey="volume" name="Volume" fill={coin.color} opacity={0.75} radius={[3,3,0,0]}/>
                    </BarChart>
                  ):(
                    <ComposedChart data={sliced}>
                      <CartesianGrid strokeDasharray="2 4" stroke={T.bd} vertical={false}/>
                      <XAxis dataKey="date" tick={{fill:T.mu,fontSize:9}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                      <YAxis tick={{fill:T.mu,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={fp} width={68}/>
                      <Tooltip content={<ChartTip dark={dark}/>}/>
                      <Bar dataKey="high" name="High" fill={coin.color} opacity={0.22} radius={[2,2,0,0]}/>
                      <Bar dataKey="low"  name="Low"  fill={red}        opacity={0.18} radius={[2,2,0,0]}/>
                      <Line type="monotone" dataKey="close" name="Close" stroke={coin.color} dot={false} strokeWidth={2}/>
                      <Line type="monotone" dataKey="open"  name="Open"  stroke={T.gold}    dot={false} strokeWidth={1.5} strokeDasharray="4 3"/>
                    </ComposedChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Stats */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
                {[{lbl:"MARKET CAP",val:`$${coin.cap}`,ic:"◎"},{lbl:"24H VOLUME",val:`$${coin.vol}`,ic:"⟳"},{lbl:"CIRCULATING",val:"19.7M BTC",ic:"◈"},{lbl:"52W HIGH",val:fp(coin.price*1.19),ic:"△"}].map((s,i)=>(
                  <div key={i} style={{ ...card({padding:12}) }}>
                    <div style={{ color:T.mu, fontSize:9, marginBottom:5, letterSpacing:"0.08em" }}>{s.ic} {s.lbl}</div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:T.tx }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Markets table (clickable → Markets page) */}
              <div style={{ ...card() }}>
                <div style={{ display:"flex", alignItems:"center", marginBottom:10 }}>
                  <div style={{ fontSize:10, color:T.mu, fontWeight:600, letterSpacing:"0.1em" }}>ALL MARKETS</div>
                  <button onClick={()=>setPage("Markets")} style={{ marginLeft:"auto", ...btn(false), fontSize:10, border:`1px solid ${T.bd}` }}>View All →</button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"2.2fr 1fr 1fr 1fr 90px", gap:6, padding:"0 8px 8px", borderBottom:`1px solid ${T.bd}`, color:T.mu, fontSize:9, letterSpacing:"0.07em" }}>
                  {["ASSET","PRICE","24H","MARKET CAP","SIGNAL"].map((h,i)=><span key={i} style={{textAlign:i>0?"right":"left"}}>{h}</span>)}
                </div>
                {COINS.map(c => {
                  const bull=c.change>=0;
                  return (
                    <div key={c.id} className="row" onClick={()=>setCoin(c)} style={{ display:"grid", gridTemplateColumns:"2.2fr 1fr 1fr 1fr 90px", gap:6, padding:"9px 8px", borderRadius:7, borderBottom:`1px solid ${T.bd}`, alignItems:"center", transition:"background 0.15s" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                        <div style={{ width:26,height:26,borderRadius:"50%",background:`${c.color}18`,border:`1.5px solid ${c.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:c.color,fontWeight:700 }}>{c.symbol.slice(0,2)}</div>
                        <div><div style={{ fontWeight:600, fontSize:12 }}>{c.symbol}</div><div style={{ color:T.mu, fontSize:9 }}>{c.name}</div></div>
                      </div>
                      <div style={{ textAlign:"right", fontWeight:500, fontFamily:"'Syne',sans-serif", fontSize:12 }}>{fp(prices[c.id])}</div>
                      <div style={{ textAlign:"right", color:bull?green:red, fontWeight:600 }}>{fc(c.change)}</div>
                      <div style={{ textAlign:"right", color:T.mu }}>${c.cap}</div>
                      <div style={{ textAlign:"right" }}><span style={{ ...badge(bull), fontSize:9 }}>{bull?"▲ BULL":"▼ BEAR"}</span></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* Portfolio (clickable) */}
              <div style={{ ...card(), cursor:"pointer" }} onClick={()=>setPage("Portfolio")}>
                <div style={{ fontSize:9, color:T.mu, letterSpacing:"0.1em", marginBottom:4 }}>TOTAL PORTFOLIO VALUE</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:32, fontWeight:800, letterSpacing:"-1.5px" }}>${ptotal.toLocaleString()}</div>
                <div style={{ display:"flex", gap:10, marginTop:6, alignItems:"center", marginBottom:12 }}>
                  <span style={{ ...badge(ppnl>=0), fontSize:11 }}>{ppnl>=0?"+":" "} ${ppnl.toLocaleString()} all time</span>
                  <span style={{ marginLeft:"auto", fontSize:10, color:T.ac }}>View Details →</span>
                </div>
                <ResponsiveContainer width="100%" height={148}>
                  <PieChart>
                    <Pie data={PORTFOLIO} dataKey="alloc" cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={3} strokeWidth={0}>
                      {PORTFOLIO.map((p,i)=><Cell key={i} fill={p.color}/>)}
                    </Pie>
                    <Tooltip contentStyle={{background:T.surf,border:`1px solid ${T.bd}`,borderRadius:8,color:T.tx,fontSize:11}} formatter={(v,_,props)=>[`${v}%`,props.payload.coin]}/>
                  </PieChart>
                </ResponsiveContainer>
                {PORTFOLIO.map((p,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 0", borderBottom:i<PORTFOLIO.length-1?`1px solid ${T.bd}`:"none" }}>
                    <div style={{ width:8,height:8,borderRadius:2,background:p.color,flexShrink:0 }}/>
                    <span style={{ flex:1, color:T.mu, fontSize:10 }}>{p.coin}</span>
                    <span style={{ fontSize:10 }}>{p.alloc}%</span>
                    <span style={{ fontSize:10, color:p.pnl>=0?green:red, minWidth:56, textAlign:"right" }}>{p.pnl>=0?"+":"-"}${Math.abs(p.pnl).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Watchlist */}
              <div style={{ ...card() }}>
                <div style={{ fontSize:9, color:T.mu, letterSpacing:"0.1em", marginBottom:10 }}>◈ WATCHLIST</div>
                {COINS.slice(0,5).map(c=>(
                  <div key={c.id} className="row" onClick={()=>setCoin(c)} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 4px", borderRadius:6, transition:"background 0.15s" }}>
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
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 0", borderBottom:i<TRANSACTIONS.length-1?`1px solid ${T.bd}`:"none" }}>
                    <span style={{ padding:"3px 7px", borderRadius:4, fontSize:9, fontWeight:700, background:t.type==="buy"?"rgba(16,185,129,0.15)":"rgba(239,68,68,0.15)", color:t.type==="buy"?green:red, flexShrink:0 }}>{t.type.toUpperCase()}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11, fontWeight:500 }}>{t.amount} {t.coin}</div>
                      <div style={{ fontSize:9, color:T.mu }}>@ {fp(t.price)} · {t.time}</div>
                    </div>
                    <div style={{ textAlign:"right", fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:600 }}>${t.total.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full-width News Feed */}
          <div style={{ ...card(), marginTop:16 }}>
            <div style={{ display:"flex", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontSize:9, color:T.mu, letterSpacing:"0.1em" }}>◎ NEWS FEED</div>
              <button onClick={()=>setPage("News")} style={{ marginLeft:"auto", ...btn(false), fontSize:10, border:`1px solid ${T.bd}` }}>View All →</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:10 }}>
              {NEWS.slice(0,6).map((n,i)=>(
                <div key={i} className="hov" onClick={()=>setPage("News")} style={{ padding:"10px 12px", borderRadius:8, transition:"opacity 0.15s", border:`1px solid ${T.bd}`, cursor:"pointer" }}>
                  <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:6 }}>
                    <span style={{ padding:"1px 6px", borderRadius:3, fontSize:9, fontWeight:700, background:`${n.bull?"rgba(16,185,129,0.2)":"rgba(239,68,68,0.2)"}`, color:n.bull?green:red }}>{n.tag}</span>
                    <span style={{ fontSize:9, color:T.mu }}>{n.time}</span>
                    <span style={{ fontSize:9, color:n.bull?green:red, marginLeft:"auto" }}>{n.bull?"▲ Bullish":"▼ Bearish"}</span>
                  </div>
                  <div style={{ fontSize:11, lineHeight:1.5, color:T.tx }}>{n.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}