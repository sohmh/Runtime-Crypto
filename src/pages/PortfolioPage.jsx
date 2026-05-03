import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from "recharts";
import { PORTFOLIO, TRANSACTIONS, PORTFOLIO_HISTORY, fp, fc, green, red } from "../data.js";

const RANGES = [["7D",7],["30D",30],["90D",90]];

export default function PortfolioPage({ T, card }) {
  const [range, setRange]   = useState(30);
  const [metric, setMetric] = useState("total"); // total | breakdown

  const ptotal = PORTFOLIO.reduce((s,p)=>s+p.value,0);
  const ppnl   = PORTFOLIO.reduce((s,p)=>s+p.pnl,0);
  const sliced = PORTFOLIO_HISTORY.slice(-range);

  const badge = (b) => ({
    display:"inline-flex",alignItems:"center",gap:3,
    padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:700,
    background:b?"rgba(16,185,129,0.13)":"rgba(239,68,68,0.13)",
    color:b?green:red,
  });

  const Btn = ({active,onClick,children})=>(
    <button onClick={onClick} style={{
      padding:"4px 12px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,
      background:active?T.ac+"22":"transparent",color:active?T.ac:T.mu,
      outline:active?`1px solid ${T.ac}55`:"none",transition:"all 0.18s"
    }}>{children}</button>
  );

  const COIN_COLORS = ["#f7931a","#627eea","#9945ff","#f3ba2f","#00aae4"];

  // Compute all-time high from history
  const athTotal = Math.max(...PORTFOLIO_HISTORY.map(d=>d.total));
  const low30    = Math.min(...sliced.map(d=>d.total));

  return (
    <div style={{padding:24,maxWidth:1920,margin:"0 auto",width:"100%"}}>

      {/* Page header */}
      <div style={{marginBottom:28}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:T.tx}}>Portfolio</div>
        <div style={{color:T.mu,fontSize:11,marginTop:2}}>Track your holdings, performance &amp; history</div>
      </div>

      {/* KPI row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14,marginBottom:24}}>
        {[
          {lbl:"Total Value",  val:`$${ptotal.toLocaleString()}`, sub:null,         ic:"◈", pos:true},
          {lbl:"All-Time PnL", val:(ppnl>=0?"+":"")+`$${ppnl.toLocaleString()}`,   sub:"since avg buy", ic:"△", pos:ppnl>=0},
          {lbl:"All-Time High",val:`$${athTotal.toLocaleString()}`,                 sub:"portfolio peak", ic:"▲", pos:true},
          {lbl:"30D Low",      val:`$${low30.toLocaleString()}`,                    sub:"range floor",   ic:"▽", pos:false},
        ].map((k,i)=>(
          <div key={i} style={{...card({padding:18})}}>
            <div style={{color:T.mu,fontSize:9,letterSpacing:"0.08em",marginBottom:6}}>{k.ic} {k.lbl}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,
              color:k.pos?green:red}}>{k.val}</div>
            {k.sub&&<div style={{color:T.mu,fontSize:10,marginTop:4}}>{k.sub}</div>}
          </div>
        ))}
      </div>

      {/* Main chart */}
      <div style={{...card(),marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:T.tx}}>
            Portfolio Value Over Time
          </span>
          <div style={{flex:1}}/>
          <span style={{color:T.mu,fontSize:10,letterSpacing:"0.06em"}}>VIEW</span>
          <Btn active={metric==="total"}     onClick={()=>setMetric("total")}>Total</Btn>
          <Btn active={metric==="breakdown"} onClick={()=>setMetric("breakdown")}>Breakdown</Btn>
          <div style={{width:1,height:18,background:T.bd,margin:"0 4px"}}/>
          <span style={{color:T.mu,fontSize:10,letterSpacing:"0.06em"}}>RANGE</span>
          {RANGES.map(([l,v])=>(
            <Btn key={l} active={range===v} onClick={()=>setRange(v)}>{l}</Btn>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={300}>
          {metric==="total"?(
            <AreaChart data={sliced}>
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={T.ac} stopOpacity={0.3}/>
                  <stop offset="100%" stopColor={T.ac} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke={T.bd} vertical={false}/>
              <XAxis dataKey="date" tick={{fill:T.mu,fontSize:9}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
              <YAxis tick={{fill:T.mu,fontSize:9}} axisLine={false} tickLine={false}
                tickFormatter={v=>`$${(v/1000).toFixed(0)}k`} width={58}/>
              <Tooltip contentStyle={{background:T.surf,border:`1px solid ${T.bd}`,borderRadius:8,color:T.tx,fontSize:11}}
                formatter={v=>[`$${v.toLocaleString()}`,"Total Value"]}/>
              <Area type="monotone" dataKey="total" stroke={T.ac} fill="url(#pg)" strokeWidth={2.5} dot={false}
                activeDot={{r:5,fill:T.ac}}/>
            </AreaChart>
          ):(
            <AreaChart data={sliced}>
              <CartesianGrid strokeDasharray="2 4" stroke={T.bd} vertical={false}/>
              <XAxis dataKey="date" tick={{fill:T.mu,fontSize:9}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
              <YAxis tick={{fill:T.mu,fontSize:9}} axisLine={false} tickLine={false}
                tickFormatter={v=>`$${(v/1000).toFixed(0)}k`} width={58}/>
              <Tooltip contentStyle={{background:T.surf,border:`1px solid ${T.bd}`,borderRadius:8,color:T.tx,fontSize:11}}
                formatter={v=>[`$${v.toLocaleString()}`]}/>
              <Legend wrapperStyle={{fontSize:10,color:T.mu}}/>
              {["btc","eth","sol","bnb","xrp"].map((k,i)=>(
                <Area key={k} type="monotone" dataKey={k} stackId="1"
                  stroke={COIN_COLORS[i]} fill={COIN_COLORS[i]} fillOpacity={0.7}
                  strokeWidth={1.5} dot={false} name={k.toUpperCase()}/>
              ))}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Holdings + Donut row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:16,marginBottom:20}}>

        {/* Holdings table */}
        <div style={{...card()}}>
          <div style={{fontSize:10,color:T.mu,letterSpacing:"0.1em",marginBottom:14,fontWeight:600}}>HOLDINGS</div>
          <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 1fr 1fr",gap:6,
            padding:"0 4px 8px",borderBottom:`1px solid ${T.bd}`,color:T.mu,fontSize:9,letterSpacing:"0.07em"}}>
            {["ASSET","AMOUNT","VALUE","AVG BUY","PnL"].map((h,i)=>(
              <span key={i} style={{textAlign:i>0?"right":"left"}}>{h}</span>
            ))}
          </div>
          {PORTFOLIO.map((p,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 1fr 1fr",gap:6,
              padding:"11px 4px",borderBottom:i<PORTFOLIO.length-1?`1px solid ${T.bd}`:"none",
              alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:8,height:8,borderRadius:2,background:p.color,flexShrink:0}}/>
                <span style={{fontWeight:600,fontSize:12}}>{p.coin}</span>
              </div>
              <div style={{textAlign:"right",color:T.mu,fontSize:11}}>{p.amount}</div>
              <div style={{textAlign:"right",fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:12}}>${p.value.toLocaleString()}</div>
              <div style={{textAlign:"right",color:T.mu,fontSize:11}}>${p.avgBuy.toLocaleString()}</div>
              <div style={{textAlign:"right"}}>
                <span style={{...badge(p.pnl>=0),fontSize:10}}>
                  {p.pnl>=0?"+":"-"}${Math.abs(p.pnl).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Donut */}
        <div style={{...card(),display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{fontSize:10,color:T.mu,letterSpacing:"0.1em",marginBottom:8,fontWeight:600,alignSelf:"flex-start"}}>ALLOCATION</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={PORTFOLIO} dataKey="alloc" cx="50%" cy="50%"
                innerRadius={48} outerRadius={72} paddingAngle={3} strokeWidth={0}>
                {PORTFOLIO.map((p,i)=><Cell key={i} fill={p.color}/>)}
              </Pie>
              <Tooltip contentStyle={{background:T.surf,border:`1px solid ${T.bd}`,borderRadius:8,color:T.tx,fontSize:11}}
                formatter={(v,_,props)=>[`${v}%`,props.payload.coin]}/>
            </PieChart>
          </ResponsiveContainer>
          {PORTFOLIO.map((p,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,width:"100%",
              padding:"5px 0",borderBottom:i<PORTFOLIO.length-1?`1px solid ${T.bd}`:"none"}}>
              <div style={{width:8,height:8,borderRadius:2,background:p.color,flexShrink:0}}/>
              <span style={{flex:1,color:T.mu,fontSize:10}}>{p.coin}</span>
              <span style={{fontSize:11,fontWeight:600}}>{p.alloc}%</span>
              <span style={{fontSize:10,color:p.pnl>=0?green:red,minWidth:52,textAlign:"right"}}>
                {p.pnl>=0?"+":""}{p.pnl<0?"-":""}${Math.abs(p.pnl).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily PnL bar chart */}
      <div style={{...card(),marginBottom:20}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:T.tx,marginBottom:16}}>
          Daily Change (Last 30 Days)
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={PORTFOLIO_HISTORY.slice(-30).map((d,i,arr)=>({
            date:d.date,
            change: i===0?0:+(d.total-arr[i-1].total).toFixed(0)
          }))}>
            <CartesianGrid strokeDasharray="2 4" stroke={T.bd} vertical={false}/>
            <XAxis dataKey="date" tick={{fill:T.mu,fontSize:9}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
            <YAxis tick={{fill:T.mu,fontSize:9}} axisLine={false} tickLine={false}
              tickFormatter={v=>`${v>=0?"+":""}$${(v/1000).toFixed(1)}k`} width={64}/>
            <Tooltip contentStyle={{background:T.surf,border:`1px solid ${T.bd}`,borderRadius:8,color:T.tx,fontSize:11}}
              formatter={v=>[`${v>=0?"+":""}$${v.toLocaleString()}`,"Daily Change"]}/>
            <Bar dataKey="change" radius={[3,3,0,0]}
              fill={green}
              label={false}>
              {PORTFOLIO_HISTORY.slice(-30).map((d,i,arr)=>{
                const chg = i===0?0:d.total-arr[i-1].total;
                return <Cell key={i} fill={chg>=0?green:red}/>;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent transactions */}
      <div style={{...card()}}>
        <div style={{fontSize:10,color:T.mu,letterSpacing:"0.1em",marginBottom:12,fontWeight:600}}>⟳ RECENT TRANSACTIONS</div>
        {TRANSACTIONS.map((t,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",
            borderBottom:i<TRANSACTIONS.length-1?`1px solid ${T.bd}`:"none"}}>
            <span style={{padding:"3px 9px",borderRadius:4,fontSize:10,fontWeight:700,
              background:t.type==="buy"?"rgba(16,185,129,0.15)":"rgba(239,68,68,0.15)",
              color:t.type==="buy"?green:red}}>{t.type.toUpperCase()}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:500}}>{t.amount} {t.coin}</div>
              <div style={{fontSize:10,color:T.mu}}>@ {fp(t.price)} · {t.time}</div>
            </div>
            <div style={{textAlign:"right",fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:T.tx}}>
              ${t.total.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
