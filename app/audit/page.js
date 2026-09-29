import {redirect} from 'next/navigation';import {q} from '@/lib/db';import {need} from '@/lib/auth';import Shell from '@/components/Shell';import Pager from '@/components/Pager';
export const dynamic='force-dynamic';
const PS=50;
export default async function Audit({searchParams}){const u=await need();if(u.role!=='admin')redirect('/');const page=Math.max(1,+searchParams.page||1);
 const rows=await q('select * from audit_log order by at desc limit $1 offset $2',[PS+1,(page-1)*PS]);
 const hasNext=rows.length>PS,show=rows.slice(0,PS);
 return <Shell u={u}><h2 style={{marginTop:0}}>Audit log</h2><p className="mut">Admin and account-security actions.</p>
  <table className="list"><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Target</th><th>Detail</th></tr></thead><tbody>
   {show.map(x=><tr key={x.id}><td className="mut">{new Date(x.at).toLocaleString()}</td><td>{x.user_name}</td><td>{x.action}</td><td>{x.target||'—'}</td><td className="mut">{x.detail||''}</td></tr>)}
   {!show.length&&<tr><td colSpan={5} className="mut">No audited actions yet.</td></tr>}</tbody></table>
  <Pager page={page} hasNext={hasNext} makeHref={p=>'/audit?page='+p}/></Shell>}
