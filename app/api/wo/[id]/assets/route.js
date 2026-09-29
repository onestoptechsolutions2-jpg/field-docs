import {NextResponse} from 'next/server';import {getUser} from '@/lib/auth';import {evt,visible} from '@/lib/wo';import {q} from '@/lib/db';
export async function POST(r,{params}){const u=await getUser();if(!u)return NextResponse.json({error:'Unauthorized'},{status:401});
 const id=+params.id;if(!(await visible(u,id)))return NextResponse.json({error:'Not found'},{status:404});
 const b=await r.json(),name=(b.name||'').trim(),serial=(b.serial||'').trim();if(!name)return NextResponse.json({error:'Enter the asset name'},{status:400});
 const wo=(await q('select client_id,client,site from work_orders where id=$1',[id]))[0];
 let a=serial?(await q('select * from assets where lower(serial)=lower($1) and coalesce(client_id,0)=coalesce($2,0)',[serial,wo.client_id]))[0]:null;
 if(!a)a=(await q('insert into assets(client_id,client,name,serial,model,site) values($1,$2,$3,$4,$5,$6) returning *',[wo.client_id,wo.client,name,serial||null,(b.model||'').trim()||null,wo.site]))[0];
 await q('insert into wo_assets(wo_id,asset_id) values($1,$2) on conflict do nothing',[id,a.id]);await evt(id,null,u,'asset','Asset linked: '+a.name+(a.serial?' ('+a.serial+')':''));
 return NextResponse.json({ok:1})}
