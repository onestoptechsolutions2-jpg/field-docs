import {q} from '@/lib/db';import {need} from '@/lib/auth';import Shell from '@/components/Shell';import NewWO from '@/components/NewWO';
export const dynamic='force-dynamic';
export default async function P(){const u=await need();
 const clients=await q('select id,name,contact,email,phone from clients order by lower(name)'),templates=await q('select id,name,service from templates where active order by service,name'),sups=await q("select id,name from users where role in ('admin','supervisor') order by name");
 return <Shell u={u}><h2 style={{marginTop:0}}>New work order</h2><NewWO clients={clients} templates={templates} sups={sups}/></Shell>}
