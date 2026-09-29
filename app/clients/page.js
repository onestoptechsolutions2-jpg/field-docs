import {redirect} from 'next/navigation';import {q} from '@/lib/db';import {need} from '@/lib/auth';import Shell from '@/components/Shell';import ClientAdmin from '@/components/ClientAdmin';import Pager from '@/components/Pager';
export const dynamic='force-dynamic';
const PS=50;
export default async function C({searchParams}){const u=await need();if(u.role==='tech')redirect('/');
 const s=searchParams.q||'',page=Math.max(1,+searchParams.page||1);
 const clients=await q(`select id,name,contact,email,phone from clients where ($1='' or name ilike '%'||$1||'%' or contact ilike '%'||$1||'%' or email ilike '%'||$1||'%' or phone ilike '%'||$1||'%') order by lower(name) limit $2 offset $3`,[s,PS+1,(page-1)*PS]);
 const hasNext=clients.length>PS,show=clients.slice(0,PS);
 return <Shell u={u}><h2 style={{marginTop:0}}>Clients</h2><form className="row" style={{marginBottom:10}}><input name="q" defaultValue={s} placeholder="Search client, contact, email or phone…"/><button className="btn">Search</button></form>
  <ClientAdmin clients={JSON.parse(JSON.stringify(show))}/>
  <Pager page={page} hasNext={hasNext} makeHref={p=>'/clients?'+new URLSearchParams({...(s?{q:s}:{}),page:p})}/></Shell>}
