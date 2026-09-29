import {redirect} from 'next/navigation';import {q} from '@/lib/db';import {need} from '@/lib/auth';import Shell from '@/components/Shell';
export const dynamic='force-dynamic';
export default async function Audit(){const u=await need();if(u.role!=='admin')redirect('/');
 const rows=await q('select * from audit_log order by at desc limit 500');
 return <Shell u={u}><h2 style={{marginTop:0}}>Audit log</h2><p className="mut">Admin and account-security actions — most recent 500.</p>
  <table className="list"><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Target</th><th>Detail</th></tr></thead><tbody>
   {rows.map(x=><tr key={x.id}><td className="mut">{new Date(x.at).toLocaleString()}</td><td>{x.user_name}</td><td>{x.action}</td><td>{x.target||'—'}</td><td className="mut">{x.detail||''}</td></tr>)}
   {!rows.length&&<tr><td colSpan={5} className="mut">No audited actions yet.</td></tr>}</tbody></table></Shell>}
