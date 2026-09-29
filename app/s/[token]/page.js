import {notFound} from 'next/navigation';import {notify} from '@/lib/push';import {q,log} from '@/lib/db';import SignPage from '@/components/SignPage';
export const dynamic='force-dynamic';
export default async function S({params}){const d=(await q('select * from docs where token=$1',[params.token]))[0];
 if(!d||d.status==='draft')notFound();
 if(d.status!=='signed'&&d.token_expires&&+new Date(d.token_expires)<Date.now())return <div className="wrap" style={{maxWidth:640}}><div className="card err">This link has expired. Ask for a new one to be sent.</div></div>;
 if(d.status==='sent'){await q("update docs set status='viewed',viewed_at=now() where id=$1",[d.id]);await log(d.id,'Opened by client');notify([d.owner],{title:'Client opened '+d.num,body:'Waiting for their signature',url:'/docs/'+d.id,tag:'doc'+d.id})}
 const safe={id:d.id,num:d.num,type:d.type,status:d.status,data:d.data,client_name:d.client_name,client_comment:d.client_comment,client_sig:d.client_sig,signed_at:d.signed_at,doc_hash:d.doc_hash};
 return <SignPage token={params.token} doc={JSON.parse(JSON.stringify(safe))}/>}
