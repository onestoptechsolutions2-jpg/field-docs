import {NextResponse} from 'next/server';import {q} from '@/lib/db';import {getUser,canSee} from '@/lib/auth';
export async function POST(r,{params}){const u=await getUser();if(!u)return NextResponse.json({error:'Unauthorized'},{status:401});
 const d=(await q('select * from docs where id=$1',[params.id]))[0];if(!d||!canSee(u,d))return NextResponse.json({error:'Not found'},{status:404});
 if(d.status==='signed')return NextResponse.json({error:'This document is locked'},{status:400});
 const f=await r.formData(),files=f.getAll('photos').filter(x=>x&&x.size>0);
 if(!files.length)return NextResponse.json({error:'Choose at least one photo'},{status:400});
 if(files.some(x=>x.size>15e6))return NextResponse.json({error:'Photos must be under 15 MB each'},{status:400});
 const out=[];
 for(const x of files){const row=(await q('insert into attachments(wo_id,task_id,doc_id,name,mime,size,data,by_name) values($1,$2,$3,$4,$5,$6,$7,$8) returning id,name,size',
  [d.wo_id||null,d.task_id||null,d.id,x.name,x.type||'application/octet-stream',x.size,Buffer.from(await x.arrayBuffer()),u.name]))[0];out.push(row)}
 return NextResponse.json({photos:out})}
