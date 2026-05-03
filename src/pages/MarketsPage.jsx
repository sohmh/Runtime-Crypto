import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, ComposedChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { COINS, ALL_HISTORY, fp, fc, green, red } from "../data.js";

export default function MarketsPage({ T, card, prices }) {
  const [sort, setSort]     = useState("cap");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null); // expanded coin
  const [chartType, setChartType] = useState("area");

  const sorted = [...COINS]
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>{
      if(sort==="cap")    return parseFloat(b.cap)  - parseFloat(a.cap);
      if(sort==="price")  return b.price - a.price;
      if(sort==="change") return b.change - a.change;
      if(sort==="vol")    return parseFloat(b.vol) - parseFloat(a.vol);
      return 0;
    });

  const badge = (bull) => ({
    display:"inline-flex",alignItems:"center",gap:3,
    padding:"2px 7px",borderRadius:4,fontSize:10,fontWeight:700,
    background:bull?"rgba(16,185,129,0.13)":"rgba(239,68,68,0.13)",
    color:bull?green:red,
  });

  const SortBtn = ({k,label})=>(
    <button onClick={()=>setSort(k)} style={{
      padding:"4px 12px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,
      fontWeight:600,background:sort===k?T.ac+"22":"transparent",
      color:sort===k?T.ac:T.mu,outline:sort===k?`1px solid ${T.ac}55`:"none"
    }}>{label}</button>
  );

  const activeCoin = active ? COINS.find(c=>c.id===active) : null;
  const history    = active ? ALL_HISTORY[active].slice(-30) : [];

  return (
    <div style={{padding:24,maxWidth:1380,margin:"0 auto"}}>
      {/* Title */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24,flexWrap:"wrap"}}>
        <div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:T.tx}}>All Markets</div>
          <div style={{color:T.mu,fontSize:11,marginTop:2}}>Live prices &amp; market data for all tracked assets</div>
        </div>
        <div style={{flex:1}}/>
        <input placeholder="Search asset…" value={search} onChange={e=>setSearch(e.target.value)} style={{
          background:T.surf,border:`1px solid ${T.bd}`,borderRadius:8,
          padding:"8px 14px",color:T.tx,fontSize:12,outline:"none",fontFamily:"inherit",width:200
        }}/>
      </div>

      {/* Sort controls */}
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <span style={{color:T.mu,fontSize:11}}>Sort by:</span>
        <SortBtn k="cap"    label="Market Cap"/>
        <SortBtn k="price"  label="Price"/>
        <SortBtn k="change" label="24H Change"/>
        <SortBtn k="vol"    label="Volume"/>
      </div>

      {/* Coins grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14,marginBottom:20}}>
        {sorted.map(c=>{
          const bull=c.change>=0;
          const isActive=active===c.id;
          return (
            <div key={c.id} onClick={()=>setActive(isActive?null:c.id)} style={{
              ...card(), cursor:"pointer", transition:"all 0.2s",
              outline: isActive?`2px solid ${c.color}`:undefined,
              transform: isActive?"translateY(-2px)":undefined,
            }}
              onMouseEnter={e=>{if(!isActive)e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{if(!isActive)e.currentTarget.style.transform="";}}
            >
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{
                  width:40,height:40,borderRadius:"50%",
                  background:`${c.color}18`,border:`2px solid ${c.color}55`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:11,color:c.color,fontWeight:700
                }}>{c.symbol.slice(0,2)}</div>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:T.tx}}>{c.symbol}</div>
                  <div style={{color:T.mu,fontSize:10}}>{c.name}</div>
                </div>
                <div style={{marginLeft:"auto",textAlign:"right"}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:T.tx}}>{fp(prices[c.id])}</div>
                  <span style={badge(bull)}>{bull?"▲":"▼"} {Math.abs(c.change).toFixed(2)}%</span>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[["Market Cap","$"+c.cap],["24H Vol","$"+c.vol],["52W High",fp(c.price*1.19)]].map(([l,v])=>(
                  <div key={l}>
                    <div style={{color:T.mu,fontSize:9,marginBottom:2}}>{l}</div>
                    <div style={{fontSize:11,fontWeight:600,color:T.tx}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded chart panel */}
      {activeCoin && (
        <div style={{...card(),marginTop:4}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,color:activeCoin.color}}>
              {activeCoin.name} — 30D Chart
            </div>
            <div style={{flex:1}}/>
            {[["area","Line"],["bar","Volume"]].map(([k,l])=>(
              <button key={k} onClick={()=>setChartType(k)} style={{
                padding:"4px 12px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,
                background:chartType===k?T.ac+"22":"transparent",color:chartType===k?T.ac:T.mu,
                outline:chartType===k?`1px solid ${T.ac}55`:"none"
              }}>{l}</button>
            ))}
            <button onClick={()=>setActive(null)} style={{
              padding:"4px 12px",borderRadius:6,border:`1px solid ${T.bd}`,
              background:"transparent",color:T.mu,cursor:"pointer",fontSize:11
            }}>✕ Close</button>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            {chartType==="area"?(
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="mcg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={activeCoin.color} stopOpacity={0.3}/>
                    <stop offset="100%" stopColor={activeCoin.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke={T.bd} vertical={false}/>
                <XAxis dataKey="date" tick={{fill:T.mu,fontSize:9}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                <YAxis tick={{fill:T.mu,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={fp} width={70}/>
                <Tooltip contentStyle={{background:T.surf,border:`1px solid ${T.bd}`,borderRadius:8,color:T.tx,fontSize:11}} formatter={v=>[fp(v),"Price"]}/>
                <Area type="monotone" dataKey="price" stroke={activeCoin.color} fill="url(#mcg)" strokeWidth={2} dot={false}/>
              </AreaChart>
            ):(
              <BarChart data={history}>
                <CartesianGrid strokeDasharray="2 4" stroke={T.bd} vertical={false}/>
                <XAxis dataKey="date" tick={{fill:T.mu,fontSize:9}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                <YAxis tick={{fill:T.mu,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1e9).toFixed(1)}B`} width={60}/>
                <Tooltip contentStyle={{background:T.surf,border:`1px solid ${T.bd}`,borderRadius:8,color:T.tx,fontSize:11}} formatter={v=>[`$${(v/1e9).toFixed(2)}B`,"Volume"]}/>
                <Bar dataKey="volume" fill={activeCoin.color} opacity={0.8} radius={[3,3,0,0]}/>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* Full table */}
      <div style={{...card(),marginTop:16}}>
        <div style={{fontSize:10,color:T.mu,fontWeight:600,marginBottom:10,letterSpacing:"0.1em"}}>FULL MARKET TABLE</div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 90px",gap:6,
          padding:"0 8px 10px",borderBottom:`1px solid ${T.bd}`,color:T.mu,fontSize:9,letterSpacing:"0.07em"}}>
          {["ASSET","PRICE","24H","MARKET CAP","VOLUME","SIGNAL"].map((h,i)=>(
            <span key={i} style={{textAlign:i>0?"right":"left"}}>{h}</span>
          ))}
        </div>
        {sorted.map(c=>{
          const bull=c.change>=0;
          return (
            <div key={c.id} onClick={()=>setActive(active===c.id?null:c.id)}
              style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 90px",gap:6,
                padding:"10px 8px",borderRadius:7,borderBottom:`1px solid ${T.bd}`,
                alignItems:"center",cursor:"pointer",transition:"background 0.15s",
                background:active===c.id?`${c.color}10`:undefined}}
              onMouseEnter={e=>{e.currentTarget.style.background=`rgba(255,255,255,0.04)`;}}
              onMouseLeave={e=>{e.currentTarget.style.background=active===c.id?`${c.color}10`:"";}}
            >
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:`${c.color}18`,
                  border:`1.5px solid ${c.color}55`,display:"flex",alignItems:"center",
                  justifyContent:"center",fontSize:9,color:c.color,fontWeight:700}}>
                  {c.symbol.slice(0,2)}
                </div>
                <div>
                  <div style={{fontWeight:600,fontSize:12}}>{c.symbol}</div>
                  <div style={{color:T.mu,fontSize:9}}>{c.name}</div>
                </div>
              </div>
              <div style={{textAlign:"right",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12}}>{fp(prices[c.id])}</div>
              <div style={{textAlign:"right",color:bull?green:red,fontWeight:600,fontSize:12}}>{fc(c.change)}</div>
              <div style={{textAlign:"right",color:T.mu,fontSize:11}}>${c.cap}</div>
              <div style={{textAlign:"right",color:T.mu,fontSize:11}}>${c.vol}</div>
              <div style={{textAlign:"right"}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 7px",borderRadius:4,
                  fontSize:9,fontWeight:700,
                  background:bull?"rgba(16,185,129,0.13)":"rgba(239,68,68,0.13)",
                  color:bull?green:red}}>{bull?"▲ BULL":"▼ BEAR"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
