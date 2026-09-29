import {notFound} from 'next/navigation';import {q,log} from '@/lib/db';import SignPage from '@/components/SignPage';
export const dynamic='force-dynamic';
export default async function S({params}){const d=(await q('select * from docs where token=$1',[params.token]))[0];
 if(!d||d.status==='draft')notFound();
 if(d.status==='sent'){await q("update docs set status='viewed',viewed_at=now() where id=$1",[d.id]);await log(d.id,'Opened by client')}
 const safe={id:d.id,num:d.num,type:d.type,status:d.status,data:d.data,client_name:d.client_name,client_comment:d.client_comment,client_sig:d.client_sig,signed_at:d.signed_at,doc_hash:d.doc_hash};
 return <SignPage token={params.token} doc={JSON.parse(JSON.stringify(safe))}/>}
