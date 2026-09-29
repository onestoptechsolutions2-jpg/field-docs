import {NextResponse} from 'next/server';import {q} from '@/lib/db';import {getUser,canSee} from '@/lib/auth';
export async function PUT(r,{params}){const u=await getUser();const d=(await q('select * from docs where id=$1',[params.id]))[0];
 if(!u||!d||!canSee(u,d))return NextResponse.json({},{status:403});
 if(d.status==='signed')return NextResponse.json({error:'Locked'},{status:409});
 await q('update docs set data=$1,updated_at=now() where id=$2',[JSON.stringify(await r.json()),d.id]);return NextResponse.json({ok:1})}
