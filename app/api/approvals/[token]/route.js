import {NextResponse} from 'next/server';import {createHash} from 'crypto';import {q} from '@/lib/db';import {evt,act} from '@/lib/wo';import {notify} from '@/lib/push';
const bad=(m,s=400)=>NextResponse.json({error:m},{status:s});
export async function POST(r,{params}){
 const a=(await q('select * from approvals where token=$1',[params.token]))[0];if(!a)return bad('Not found',404);if(a.status!=='pending')return bad('This request has already been answered',409);
 const {decision,name,comment,sig}=await r.json(),nm=(name||'').trim(),cm=(comment||'').trim().slice(0,4000);
 if(!['approved','changes','declined'].includes(decision))return bad('Choose a response');if(!nm)return bad('Please enter your name');
 if(decision==='approved'&&!(sig?.startsWith('data:image/png')&&sig.length<400000))return bad('Please sign to approve');
 if(decision!=='approved'&&!cm)return bad('Please tell us what needs to change');
 const ip=(r.headers.get('x-forwarded-for')||'').split(',')[0].trim()||'unknown',hash=createHash('sha256').update(JSON.stringify([a.token,a.title,a.file_ids,decision,nm,cm,sig||''])).digest('hex');
 if(!(await q("update approvals set status=$1,client_name=$2,comment=$3,sig=$4,ip=$5,doc_hash=$6,decided_at=now() where id=$7 and status='pending' returning id",[decision,nm,cm,decision==='approved'?sig:null,ip,hash,a.id])).length)return bad('Already answered',409);
 const t=(await q('select * from tasks where id=$1',[a.task_id]))[0],wo=(await q('select * from work_orders where id=$1',[a.wo_id]))[0];
 await evt(a.wo_id,a.task_id,{name:nm+' (client)'},'client-'+decision,`${nm} ${{approved:'approved',changes:'requested changes to',declined:'declined'}[decision]} “${a.title}”`+(cm?': '+cm:''));
 const team=(await q('select id from users where team=$1',[t.team])).map(x=>x.id);
 notify([...(t.assignee?[t.assignee]:team),t.supervisor,wo.created_by],{title:`Client ${decision==='approved'?'approved':decision==='changes'?'requested changes':'declined'} · ${wo.num}`,body:`${nm}: ${a.title}${cm?'. '+cm:''}`,url:'/workorders/'+wo.id,tag:'ap'+a.id});
 if(decision==='approved'){try{await act({id:null,name:'Client approval',role:'admin',team:t.team},t.id,'complete',{note:'Approved online by '+nm})}catch(e){await evt(a.wo_id,t.id,null,'note','Client approved online. The task can now be completed ('+e.message+')')}}
 return NextResponse.json({ok:1})}
