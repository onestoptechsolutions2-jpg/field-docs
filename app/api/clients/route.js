import {NextResponse} from 'next/server';import {q} from '@/lib/db';import {getUser} from '@/lib/auth';
export async function POST(r){const u=await getUser();if(!u)return NextResponse.json({error:'Unauthorized'},{status:401});
 const b=await r.json(),name=(b.name||'').trim();if(!name)return NextResponse.json({error:'Client name is required'},{status:400});
 const v=[name,(b.contact||'').trim()||null,(b.email||'').trim()||null,(b.phone||'').trim()||null];
 const c=(await q('insert into clients(name,contact,email,phone) values($1,$2,$3,$4) on conflict (lower(name)) do nothing returning id,name,contact,email,phone',v))[0]
  ||(await q('select id,name,contact,email,phone from clients where lower(name)=lower($1)',[name]))[0];
 return NextResponse.json(c)}
