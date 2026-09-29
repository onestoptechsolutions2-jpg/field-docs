import {NextResponse} from 'next/server';import {createHash} from 'crypto';import {notify} from '@/lib/push';import {q,log} from '@/lib/db';
export async function POST(r,{params}){const d=(await q('select * from docs where token=$1',[params.token]))[0];
 if(!d||d.status==='draft')return NextResponse.json({error:'Not found'},{status:404});
 if(d.status==='signed')return NextResponse.json({error:'Already signed'},{status:409});
 const {name,comment,sig}=await r.json();
 if(!name?.trim()||!sig?.startsWith('data:image/png')||sig.length>400000)return NextResponse.json({error:'Name and signature required'},{status:400});
 const hash=createHash('sha256').update(JSON.stringify([d.data,name,comment,sig])).digest('hex');
 const ip=(r.headers.get('x-forwarded-for')||'').split(',')[0].trim()||'unknown';
 await q("update docs set status='signed',signed_at=now(),client_name=$1,client_comment=$2,client_sig=$3,signed_ip=$4,doc_hash=$5 where id=$6 and status<>'signed'",[name.trim(),(comment||'').slice(0,4000),sig,ip,hash,d.id]);
 await log(d.id,'Signed by '+name.trim()+' (IP '+ip+')');
 notify([d.owner],{title:'Signed ✓ '+d.num,body:name.trim()+' signed'+(comment?' and left a comment':''),url:'/docs/'+d.id,tag:'doc'+d.id});return NextResponse.json({ok:1})}
