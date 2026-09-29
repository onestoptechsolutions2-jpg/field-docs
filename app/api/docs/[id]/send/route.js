import {NextResponse} from 'next/server';import {q,log} from '@/lib/db';import {getUser,canSee} from '@/lib/auth';import {mail} from '@/lib/mail';
export async function POST(r,{params}){const u=await getUser();const d=(await q('select * from docs where id=$1',[params.id]))[0];
 if(!u||!d||!canSee(u,d))return NextResponse.json({},{status:403});
 if(d.status==='signed')return NextResponse.json({error:'Already signed'},{status:409});
 const {channel,email,phone}=await r.json();
 const link=(process.env.APP_URL||'http://'+r.headers.get('host'))+'/s/'+d.token;
 if(channel==='email'){if(!email)return NextResponse.json({error:'Enter client email'},{status:400});
  try{await mail(email,`Please review and sign ${d.num}`,`Hello,\n\nPlease review and sign your ${({sr:'site report',ho:'handover',wt:'work ticket'})[d.type]} (${d.num}) here:\n${link}\n\nNanosoft Technologies Limited`)}catch(e){return NextResponse.json({error:'Email failed: '+e.message},{status:500})}}
 await q("update docs set status=case when status='viewed' then status else 'sent' end,sent_at=coalesce(sent_at,now()),token_expires=now()+interval '30 days',client_email=coalesce($1,client_email),client_phone=coalesce($2,client_phone) where id=$3",[email||null,phone||null,d.id]);
 await log(d.id,'Link shared via '+channel+(channel==='email'?' to '+email:''));
 return NextResponse.json({link})}
