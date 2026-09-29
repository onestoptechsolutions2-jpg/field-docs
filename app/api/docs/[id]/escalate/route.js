import {NextResponse} from 'next/server';import {q,log} from '@/lib/db';import {getUser,canSee} from '@/lib/auth';import {mail} from '@/lib/mail';
const load=async id=>[await getUser(),(await q('select * from docs where id=$1',[id]))[0]];
export async function POST(r,{params}){const [u,d]=await load(params.id);
 if(!u||!d||!canSee(u,d))return NextResponse.json({},{status:403});
 const {to,reason,note}=await r.json();
 const sup=(await q("select * from users where id=$1 and role in ('supervisor','admin')",[to]))[0];
 if(!sup||!reason)return NextResponse.json({error:'Choose a supervisor and a reason'},{status:400});
 await q("update docs set esc_to=$1,esc_reason=$2,esc_note=$3,esc_status='open',esc_at=now(),esc_by=$4,esc_response=null where id=$5",[sup.id,reason,(note||'').slice(0,2000),u.id,d.id]);
 await log(d.id,`Escalated to ${sup.name}: ${reason}`);
 const link=(process.env.APP_URL||'http://'+r.headers.get('host'))+'/docs/'+d.id;
 try{await mail(sup.email,`Escalation: ${d.num} – ${reason}`,`${u.name} escalated ${d.num}.\nReason: ${reason}\n${note||''}\n\nOpen: ${link}`)}catch(e){}
 return NextResponse.json({ok:1,toName:sup.name})}
export async function PATCH(r,{params}){const [u,d]=await load(params.id);
 if(!u||!d||u.role==='tech'||!d.esc_status)return NextResponse.json({},{status:403});
 const {action,response}=await r.json();const st=action==='resolve'?'resolved':'acknowledged';
 await q('update docs set esc_status=$1,esc_response=$2 where id=$3',[st,(response||'').slice(0,2000),d.id]);
 await log(d.id,`Escalation ${st} by ${u.name}`);return NextResponse.json({ok:1,status:st})}
