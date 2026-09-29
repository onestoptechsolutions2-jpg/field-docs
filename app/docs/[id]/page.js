import {notFound} from 'next/navigation';import {q} from '@/lib/db';import {need,canSee} from '@/lib/auth';import Shell from '@/components/Shell';import Doc from '@/components/Doc';
export const dynamic='force-dynamic';
export default async function P({params}){const u=await need();const d=(await q('select d.*,e.name esc_to_name from docs d left join users e on e.id=d.esc_to where d.id=$1',[params.id]))[0];
 if(!d||!canSee(u,d))notFound();
 const ev=await q('select at,what from events where doc_id=$1 order by at desc',[d.id]);
 const sups=await q("select id,name from users where role in ('supervisor','admin') order by name");
 const clients=await q('select id,name,contact,email,phone from clients order by lower(name)');
 const products=(await q('select name from products where active order by sort,lower(name)')).map(x=>x.name);
 return <Shell u={u}><Doc doc={JSON.parse(JSON.stringify(d))} ev={JSON.parse(JSON.stringify(ev))} sups={sups} clients={clients} products={products} me={{id:u.id,role:u.role}}/></Shell>}
