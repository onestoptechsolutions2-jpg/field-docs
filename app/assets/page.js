import Link from 'next/link';import {q} from '@/lib/db';import {need} from '@/lib/auth';import Shell from '@/components/Shell';
export const dynamic='force-dynamic';
export default async function A({searchParams}){const u=await need(),s=searchParams.q||'';
 const rows=await q(`select a.*,coalesce(json_agg(json_build_object('id',w.id,'num',w.num,'service',w.service,'status',w.status) order by w.created_at) filter (where w.id is not null),'[]') wos from assets a left join wo_assets x on x.asset_id=a.id left join work_orders w on w.id=x.wo_id where ($1='' or a.name ilike '%'||$1||'%' or a.serial ilike '%'||$1||'%' or a.client ilike '%'||$1||'%' or a.model ilike '%'||$1||'%') group by a.id order by a.created_at desc limit 200`,[s]);
 return <Shell u={u}><h2 style={{marginTop:0}}>Asset history</h2><form className="row" style={{marginBottom:10}}><input name="q" defaultValue={s} placeholder="Search asset, serial, model or client…"/><button className="btn">Search</button></form>
  <table className="list"><thead><tr><th>Asset</th><th>Client</th><th>Serial / model</th><th>Service history</th></tr></thead><tbody>
  {rows.map(a=><tr key={a.id}><td>{a.name}</td><td>{a.client}<br/><span className="mut">{a.site}</span></td><td>{a.serial||'—'}<br/><span className="mut">{a.model}</span></td><td>{a.wos.map(w=><div key={w.id}><Link href={'/workorders/'+w.id}>{w.num}</Link> <span className="mut">{w.service} · {w.status}</span></div>)}</td></tr>)}
  {!rows.length&&<tr><td colSpan={4} className="mut">No assets yet. Link them from a work order.</td></tr>}</tbody></table></Shell>}
