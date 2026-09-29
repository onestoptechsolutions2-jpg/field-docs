import Link from 'next/link';import {q} from '@/lib/db';import {need} from '@/lib/auth';import Shell from '@/components/Shell';import Pager from '@/components/Pager';
export const dynamic='force-dynamic';
const PS=50;
export default async function E({searchParams}){const u=await need();const page=Math.max(1,+searchParams.page||1);
 const rows=await q(`select d.id,d.num,d.data,d.esc_status,d.esc_reason,d.esc_at,u.name tech,e.name esc_to from docs d join users u on u.id=d.owner left join users e on e.id=d.esc_to where d.esc_status is not null and ($1::boolean or d.owner=$2) order by (d.esc_status='open') desc,d.esc_at desc limit $3 offset $4`,[u.role!=='tech',u.id,PS+1,(page-1)*PS]);
 const hasNext=rows.length>PS,show=rows.slice(0,PS);
 return <Shell u={u}><div className="row"><h2 style={{margin:0}}>Escalations</h2><span className="grow"/><a className="btn" href="/api/export?esc=1">Export to Excel</a></div>
  <table className="list" style={{marginTop:12}}><thead><tr><th>No.</th><th>Client</th><th>Reason</th><th>From</th><th>To</th><th>Status</th><th>Raised</th></tr></thead><tbody>
  {show.map(r=><tr key={r.id}><td><Link href={'/docs/'+r.id}>{r.num}</Link></td><td>{r.data?.f?.client||'—'}</td><td>{r.esc_reason}</td><td>{r.tech}</td><td>{r.esc_to}</td><td><span className={'badge esc-'+r.esc_status}>{r.esc_status}</span></td><td className="mut">{new Date(r.esc_at).toLocaleDateString()}</td></tr>)}
  {!show.length&&<tr><td colSpan={7} className="mut">No escalations.</td></tr>}</tbody></table>
  <Pager page={page} hasNext={hasNext} makeHref={p=>'/escalations?page='+p}/></Shell>}
