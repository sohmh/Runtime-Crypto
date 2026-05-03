import { useState } from "react";
import { NEWS, green, red } from "../data.js";

const CATEGORIES = ["All","BTC","ETH","SOL","BNB","XRP","ADA","MKT"];

export default function NewsPage({ T, card }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = NEWS.filter(n =>
    (filter==="All" || n.tag===filter) &&
    (search===""    || n.title.toLowerCase().includes(search.toLowerCase()))
  );

  const bull = (b) => ({
    display:"inline-flex", alignItems:"center", gap:3,
    padding:"2px 8px", borderRadius:4, fontSize:10, fontWeight:700,
    background: b?"rgba(16,185,129,0.13)":"rgba(239,68,68,0.13)",
    color: b?green:red,
  });

  return (
    <div style={{padding:24, maxWidth:1920, margin:"0 auto", width:"100%"}}>
      {/* Header row */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24,flexWrap:"wrap"}}>
        <div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:T.tx}}>News Feed</div>
          <div style={{color:T.mu,fontSize:11,marginTop:2}}>Live crypto news &amp; market sentiment</div>
        </div>
        <div style={{flex:1}}/>
        <input
          placeholder="Search news…"
          value={search}
          onChange={e=>setSearch(e.target.value)}
          style={{
            background:T.surf, border:`1px solid ${T.bd}`, borderRadius:8,
            padding:"8px 14px", color:T.tx, fontSize:12, outline:"none",
            fontFamily:"inherit", width:220
          }}
        />
      </div>

      {/* Category pills */}
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {CATEGORIES.map(c=>(
          <button key={c} onClick={()=>setFilter(c)} style={{
            padding:"5px 14px", borderRadius:20, border:"none", cursor:"pointer",
            fontSize:11, fontWeight:600, transition:"all 0.18s",
            background: filter===c ? T.ac+"22" : T.surf,
            color: filter===c ? T.ac : T.mu,
            outline: filter===c ? `1px solid ${T.ac}55` : `1px solid ${T.bd}`,
          }}>{c}</button>
        ))}
      </div>

      {/* News grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
        {filtered.map((n,i)=>(
          <div key={i} style={{
            ...card(), cursor:"pointer", transition:"transform 0.18s, box-shadow 0.18s",
            borderLeft:`3px solid ${n.bull?green:red}`
          }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 8px 32px rgba(0,0,0,0.18)`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}
          >
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
              <span style={{
                padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:700,
                background:`${n.bull?"rgba(16,185,129,0.18)":"rgba(239,68,68,0.18)"}`,
                color:n.bull?green:red
              }}>{n.tag}</span>
              <span style={{fontSize:10,color:T.mu}}>{n.source}</span>
              <span style={{marginLeft:"auto",fontSize:10,color:T.mu}}>{n.time}</span>
            </div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:T.tx,marginBottom:8,lineHeight:1.4}}>
              {n.title}
            </div>
            <div style={{fontSize:11,color:T.mu,lineHeight:1.6}}>{n.body}</div>
            <div style={{marginTop:12,display:"flex",justifyContent:"flex-end"}}>
              <span style={bull(n.bull)}>{n.bull?"▲ Bullish":"▼ Bearish"}</span>
            </div>
          </div>
        ))}
        {filtered.length===0 && (
          <div style={{gridColumn:"1/-1",textAlign:"center",color:T.mu,padding:60,fontSize:14}}>
            No articles match your filter.
          </div>
        )}
      </div>
    </div>
  );
}
