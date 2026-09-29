import {redirect} from 'next/navigation';import {q} from '@/lib/db';import {need} from '@/lib/auth';import Shell from '@/components/Shell';import ClientAdmin from '@/components/ClientAdmin';
export const dynamic='force-dynamic';
export default async function C(){const u=await need();if(u.role==='tech')redirect('/');
 const clients=await q('select id,name,contact,email,phone from clients order by lower(name)');
 return <Shell u={u}><h2 style={{marginTop:0}}>Clients</h2><ClientAdmin clients={JSON.parse(JSON.stringify(clients))}/></Shell>}
