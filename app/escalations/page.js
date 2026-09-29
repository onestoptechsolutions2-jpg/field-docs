import Link from 'next/link';import {q} from '@/lib/db';import {need} from '@/lib/auth';import Shell from '@/components/Shell';
export const dynamic='force-dynamic';
export default async function E(){const u=await need();
 const rows=await q(`select d.id,d.num,d.data,d.esc_status,d.esc_reason,d.esc_at,u.name tech,e.name esc_to from docs d join users u on u.id=d.owner left join users e on e.id=d.esc_to where d.esc_status is not null and ($1::boolean or d.owner=$2) order by (d.esc_status='open') desc,d.esc_at desc`,[u.role!=='tech',u.id]);
 return <Shell u={u}><div className="row"><h2 style={{margin:0}}>Escalations</h2><span className="grow"/><a className="btn" href="/api/export?esc=1">Export to Excel</a></div>
  <table className="list" style={{marginTop:12}}><thead><tr><th>No.</th><th>Client</th><th>Reason</th><th>From</th><th>To</th><th>Status</th><th>Raised</th></tr></thead><tbody>
  {rows.map(r=><tr key={r.id}><td><Link href={'/docs/'+r.id}>{r.num}</Link></td><td>{r.data?.f?.client||'—'}</td><td>{r.esc_reason}</td><td>{r.tech}</td><td>{r.esc_to}</td><td><span className={'badge esc-'+r.esc_status}>{r.esc_status}</span></td><td className="mut">{new Date(r.esc_at).toLocaleDateString()}</td></tr>)}
  {!rows.length&&<tr><td colSpan={7} className="mut">No escalations.</td></tr>}</tbody></table></Shell>}
