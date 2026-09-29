import Link from 'next/link';import {need} from '@/lib/auth';import Shell from '@/components/Shell';import {loadWOs,FILTERS} from '@/lib/wolist';import {dur} from '@/lib/time';import Pager from '@/components/Pager';
export const dynamic='force-dynamic';
const PS=50;
export default async function L({searchParams}){const u=await need();const st=['open','completed','closed','cancelled','all'].includes(searchParams.st)?searchParams.st:'open';
 let rows=await loadWOs(u,{st,search:searchParams.q||''});const f=FILTERS[searchParams.f];if(f)rows=rows.filter(w=>f[1](w.S));if(searchParams.b)rows=rows.filter(w=>w.S.bucket===searchParams.b);
 const page=Math.max(1,+searchParams.page||1),hasNext=rows.length>page*PS,show=rows.slice((page-1)*PS,page*PS);
 const pageHref=p=>'/workorders?'+new URLSearchParams({...(searchParams.q?{q:searchParams.q}:{}),st,...(searchParams.f?{f:searchParams.f}:{}),...(searchParams.b?{b:searchParams.b}:{}),page:p});
 const tag=(w)=>w.status==='cancelled'?<span className="badge over">Cancelled</span>:w.status!=='open'?<span className="badge done">{w.status}</span>:w.S.overdue?<span className="badge over">Overdue</span>:w.S.atRisk?<span className="badge risk">At risk</span>:<span className="badge ready">On track</span>;
 return <Shell u={u}><div className="row"><h2 style={{margin:0}}>Work orders{f?' · '+f[0]:''}{searchParams.b?' · '+searchParams.b:''}</h2><span className="grow"/><Link className="btn p" href="/workorders/new">+ New work order</Link></div>
  <form className="row" style={{margin:'10px 0'}}><input name="q" defaultValue={searchParams.q||''} placeholder="Search client, site, WO, technician, serial, reference…"/><select name="st" defaultValue={st} style={{width:150}}><option value="open">Open</option><option value="completed">Completed</option><option value="closed">Closed</option><option value="cancelled">Cancelled</option><option value="all">All</option></select><button className="btn">Search</button></form>
  <p className="mut" style={{marginTop:0}}>{rows.length} match{rows.length===1?'':'es'}</p>
  <div className="tw"><table className="list"><thead><tr><th>WO</th><th>Client / service</th><th>Owner · task</th><th>Why not complete?</th><th>Waiting</th><th>Progress</th></tr></thead><tbody>
  {show.map(w=><tr key={w.id}><td><Link href={'/workorders/'+w.id}>{w.num}</Link></td><td>{w.client}<br/><span className="mut">{w.service}</span></td><td>{w.S.owner}<br/><span className="mut">{w.S.task||'—'}</span></td><td style={{maxWidth:340}}>{w.S.why.slice(0,150)}</td><td>{w.S.since&&w.status==='open'?dur(w.S.waited):'—'}</td><td>{tag(w)}<br/><span className="mut">{w.S.done}/{w.S.total} tasks</span></td></tr>)}
  {!show.length&&<tr><td colSpan={6} className="mut">No work orders match.</td></tr>}</tbody></table></div>
  <Pager page={page} hasNext={hasNext} makeHref={pageHref}/></Shell>}
