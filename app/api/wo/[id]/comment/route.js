import {NextResponse} from 'next/server';import {getUser} from '@/lib/auth';import {evt,visible} from '@/lib/wo';import {q} from '@/lib/db';
export async function POST(r,{params}){const u=await getUser();if(!u)return NextResponse.json({error:'Unauthorized'},{status:401});
 const id=+params.id;if(!(await visible(u,id)))return NextResponse.json({error:'Not found'},{status:404});
 const f=await r.formData(),text=(f.get('comment')||'').toString().trim().slice(0,4000),tid=+f.get('task_id')||null,files=f.getAll('files').filter(x=>x&&x.size>0);
 if(!text&&!files.length)return NextResponse.json({error:'Write a note or attach a file'},{status:400});
 if(files.some(x=>x.size>15e6))return NextResponse.json({error:'Files must be under 15 MB'},{status:400});
 const eid=await evt(id,tid,u,files.length?'attachment':'comment',text||files.map(x=>x.name).join(', '));
 for(const x of files)await q('insert into attachments(wo_id,task_id,event_id,name,mime,size,data,by_name) values($1,$2,$3,$4,$5,$6,$7,$8)',[id,tid,eid,x.name,x.type||'application/octet-stream',x.size,Buffer.from(await x.arrayBuffer()),u.name]);
 return NextResponse.json({ok:1})}
