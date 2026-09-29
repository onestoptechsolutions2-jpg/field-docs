import {NextResponse} from 'next/server';import {q} from '@/lib/db';import {getUser,canSee} from '@/lib/auth';import {evt} from '@/lib/wo';
export async function PUT(r,{params}){const u=await getUser();const d=(await q('select * from docs where id=$1',[params.id]))[0];
 if(!u||!d||!canSee(u,d))return NextResponse.json({},{status:403});
 if(d.status==='signed')return NextResponse.json({error:'Locked'},{status:409});
 const b=await r.json();await q('update docs set data=$1,updated_at=now() where id=$2',[JSON.stringify(b),d.id]);
 if(b.fin&&!d.data?.fin&&d.wo_id)await evt(d.wo_id,d.task_id,u,'document','Field document '+d.num+' completed');
 return NextResponse.json({ok:1})}
