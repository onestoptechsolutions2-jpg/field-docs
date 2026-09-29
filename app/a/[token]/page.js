import {notFound} from 'next/navigation';import {q} from '@/lib/db';import {evt} from '@/lib/wo';import ApprovalPage from '@/components/ApprovalPage';
export const dynamic='force-dynamic';
export const metadata={title:'Please review and respond'};
export default async function A({params}){
 const a=(await q('select * from approvals where token=$1',[params.token]))[0];if(!a)notFound();
 if(a.status==='pending'&&a.expires_at&&+new Date(a.expires_at)<Date.now())return <div className="wrap" style={{maxWidth:640}}><div className="card err">This link has expired. Ask for a new one to be sent.</div></div>;
 const wo=(await q('select num,client,site,requirement from work_orders where id=$1',[a.wo_id]))[0],files=a.file_ids.length?await q('select id,name,size from attachments where id=any($1::int[]) order by id',[a.file_ids]):[];
 if(!a.viewed_at){await q('update approvals set viewed_at=now() where id=$1',[a.id]);await evt(a.wo_id,a.task_id,null,'client-viewed','Client opened “'+a.title+'”')}
 return <ApprovalPage token={params.token} a={JSON.parse(JSON.stringify({title:a.title,message:a.message,status:a.status,client_name:a.client_name,comment:a.comment,decided_at:a.decided_at}))} wo={wo} files={files}/>}
