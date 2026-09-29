import {NextResponse} from 'next/server';import {randomBytes} from 'crypto';import {getUser} from '@/lib/auth';import {evt,visible} from '@/lib/wo';import {q} from '@/lib/db';import {mail} from '@/lib/mail';
const bad=(m,s=400)=>NextResponse.json({error:m},{status:s});
export async function POST(r,{params}){const u=await getUser();if(!u)return bad('Unauthorized',401);
 const t=(await q('select * from tasks where id=$1',[params.id]))[0];if(!t||!(await visible(u,t.wo_id)))return bad('Not found',404);
 const wo=(await q('select * from work_orders where id=$1',[t.wo_id]))[0];if(wo.status!=='open')return bad('Work order is '+wo.status);
 const b=await r.json(),ids=(b.file_ids||[]).map(Number).filter(Boolean),ok=ids.length?(await q('select id from attachments where wo_id=$1 and id=any($2::int[])',[wo.id,ids])).map(x=>x.id):[];
 const token=randomBytes(18).toString('hex'),title=(b.title||t.title).trim(),link=(process.env.APP_URL||'http://'+r.headers.get('host'))+'/a/'+token;
 if(b.channel==='email'){if(!b.email)return bad('Enter the client email');
  try{await mail(b.email,`Please review and respond: ${title} (${wo.num})`,`Hello,\n\nPlease review and respond here:\n${link}\n\n${b.message||''}\n\nNanosoft Technologies Limited`)}catch(e){return bad('Email failed: '+e.message,500)}}
 await q('insert into approvals(wo_id,task_id,token,title,message,file_ids,email,phone,created_by) values($1,$2,$3,$4,$5,$6::int[],$7,$8,$9)',[wo.id,t.id,token,title,(b.message||'').slice(0,2000),ok,b.email||null,b.phone||null,u.id]);
 await evt(wo.id,t.id,u,'approval-request',`Client approval requested (${b.channel||'link'}): ${title}`);return NextResponse.json({link})}
