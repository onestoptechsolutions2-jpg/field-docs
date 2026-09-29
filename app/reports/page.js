import Link from 'next/link';import {need} from '@/lib/auth';import Shell from '@/components/Shell';import PrintBtn from '@/components/PrintBtn';import {monthData,curYm,woStats,trend} from '@/lib/report';import {dur} from '@/lib/time';
export const dynamic='force-dynamic';
const shift=(ym,n)=>{const [y,m]=ym.split('-').map(Number),d=new Date(y,m-1+n,1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')};
const srt=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]);
const Tbl=({h,rows})=><table className="list" style={{marginBottom:16}}><thead><tr>{h.map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{rows.length?rows.map((c,i)=><tr key={i}>{c.map((v,j)=><td key={j}>{v}</td>)}</tr>):<tr><td colSpan={h.length} className="mut">No data</td></tr>}</tbody></table>;
const K=({l,v,s})=><div className="card" style={{flex:'1 1 140px',marginBottom:0}}><div className="mut">{l}</div><div style={{fontSize:26,fontWeight:700}}>{v}</div>{s&&<div className="mut">{s}</div>}</div>;
export default async function R({searchParams}){const u=await need();const m=/^\d{4}-\d\d$/.test(searchParams.m||'')?searchParams.m:curYm();const canWo=u.role!=='tech';const tab=canWo&&searchParams.tab!=='docs'?'wo':'docs';
 const r=await monthData(m,u),W=tab==='wo'?await woStats(m,u):null,Tr=tab==='wo'?await trend(u,6):null;
 const [y,mo]=m.split('-').map(Number),label=new Date(y,mo-1,1).toLocaleString('en',{month:'long',year:'numeric'}),rate=r.total?Math.round(r.signed/r.total*100):0;
 const tabUrl=t=>'/reports?'+new URLSearchParams({m,tab:t});
 return <Shell u={u}><div className="row noprint"><h2 style={{margin:0}}>Monthly report</h2><span className="grow"/><Link className="btn" href={'/reports?'+new URLSearchParams({m:shift(m,-1),tab})}>‹ Prev</Link><Link className="btn" href={'/reports?'+new URLSearchParams({m:shift(m,1),tab})}>Next ›</Link><a className="btn" href={'/api/report?m='+m}>Export to Excel</a><PrintBtn/></div>
  <h2 style={{margin:'10px 0'}}>Nanosoft Field Services · {label}</h2>
  {canWo&&<div className="tabs noprint"><Link href={tabUrl('wo')} className={tab==='wo'?'on':''}>Work orders &amp; pipeline</Link><Link href={tabUrl('docs')} className={tab==='docs'?'on':''}>Documents</Link></div>}

  {tab==='wo'?<>
   <div className="row" style={{alignItems:'stretch',marginBottom:12}}><K l="Work orders created" v={W.created}/><K l="Started" v={W.started}/><K l="Completed / closed" v={W.done}/><K l="Cancelled" v={W.cancelled}/><K l="Within planned time" v={W.slaPct==null?'—':W.slaPct+'%'} s="SLA compliance"/></div>
   <div className="row" style={{alignItems:'stretch',marginBottom:16}}><K l="Request → assignment" v={W.avgReqToAssign==null?'—':dur(W.avgReqToAssign)} s="avg time a task waits to be assigned"/><K l="Assignment → acceptance" v={W.avgAssignToAccept==null?'—':dur(W.avgAssignToAccept)} s="avg time to accept once assigned"/><K l="Rejected assignments" v={W.rejections}/><K l="Returned / reopened tasks" v={W.reopened}/></div>
   <h3>Pipeline funnel (tasks created this month)</h3><Tbl h={['Stage','Tasks','% of created']} rows={W.funnel.map(f=>[f.stage,f.n,f.pct==null?'—':f.pct+'%'])}/>
   <h3>Trend — last 6 months</h3><Tbl h={['Month','Created','Started','Done','Cancelled','SLA %','Avg cycle time','Rejected','Reopened']} rows={Tr.map(t=>[t.ym,t.created,t.started,t.done,t.cancelled,t.slaPct==null?'—':t.slaPct+'%',t.avgCycle==null?'—':dur(t.avgCycle),t.rejections,t.reopened])}/>
   <h3>Technician scorecard</h3><Tbl h={['Technician','Team','Assigned','Done','On time %','Avg cycle time','Active time','Rejected','Reopened']} rows={W.scorecards.map(c=>[c.key,c.team,c.assigned,c.done,c.onTimePct==null?'—':c.onTimePct+'%',c.avgCycle==null?'—':dur(c.avgCycle),dur(c.activeMs),c.rejections,c.reopened])}/>
   <h3>Department scorecard</h3><Tbl h={['Department','Assigned','Done','On time %','Avg cycle time','Rejected','Reopened']} rows={W.teamCards.map(c=>[c.key,c.assigned,c.done,c.onTimePct==null?'—':c.onTimePct+'%',c.avgCycle==null?'—':dur(c.avgCycle),c.rejections,c.reopened])}/>
   <h3>SLA by workflow</h3><Tbl h={['Service','Created','Done','On time %','Avg planned','Avg actual age']} rows={W.bySvc.map(s=>[s.service,s.n,s.done,s.slaPct==null?'—':s.slaPct+'%',dur(s.avgPlanned),s.avgAge==null?'—':dur(s.avgAge)])}/>
   <h3>Time waiting, by owner / party</h3><Tbl h={['Owner / waiting party','Total time']} rows={Object.entries(W.byOwner).sort((a,b)=>b[1]-a[1]).map(([k,v])=>[k,dur(v)])}/>
   <h3>Time by client (active work)</h3><Tbl h={['Client','Total time']} rows={Object.entries(W.byClient).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([k,v])=>[k,dur(v)])}/>
   <h3>Rejected / reopened by team</h3><Tbl h={['Team','Rejected assignments','Returned / reopened']} rows={W.byTeamRR.map(x=>[x.team,x.rejections,x.reopened])}/>
   <h3>Stage performance (completed tasks)</h3><Tbl h={['Task','Team','Done','Avg plan','Avg actual (working)','Avg client/supplier wait']} rows={W.stages.map(s=>[s.title,s.team,s.n,dur(s.plan/s.n),dur(s.work/s.n),dur(s.ext/s.n)])}/>
  </>:<>
   <div className="row" style={{alignItems:'stretch',marginBottom:16}}><K l="Documents" v={r.total}/><K l="Signed" v={rate+'%'} s={r.signed+' of '+r.total}/><K l="Awaiting signature" v={r.pending}/><K l="Escalations" v={r.esc} s={r.escResolved+' resolved'}/><K l="Avg time to sign" v={r.avgHrs==null?'—':r.avgHrs.toFixed(1)+' h'}/><K l="Ticket hours" v={(r.minutes/60).toFixed(1)}/></div>
   <h3>By job type</h3><Tbl h={['Type','Count']} rows={srt(r.byKind)}/>
   <h3>By system / product</h3><Tbl h={['System / product','Count']} rows={srt(r.byProduct)}/>
   <h3>Outcomes</h3><Tbl h={['Outcome','Count']} rows={srt(r.byOutcome)}/>
   <h3>By technician</h3><Tbl h={['Technician','Docs','Signed','Escalations','Ticket hrs']} rows={Object.entries(r.tech).sort((a,b)=>b[1].docs-a[1].docs).map(([n,t])=>[n,t.docs,t.signed,t.esc,(t.mins/60).toFixed(1)])}/>
   <h3>Top clients</h3><Tbl h={['Client','Docs','Signed','Escalations']} rows={Object.entries(r.client).sort((a,b)=>b[1].docs-a[1].docs).slice(0,15).map(([n,c])=>[n,c.docs,c.signed,c.esc])}/>
   <h3>Escalation reasons</h3><Tbl h={['Reason','Count']} rows={srt(r.byReason)}/>
  </>}</Shell>}
