import Link from 'next/link';
import {notFound} from 'next/navigation';
import DashboardContent from '@/components/DashboardContent';

export const dynamic='force-dynamic';

export default function DashboardPreview(){
 if(process.env.NODE_ENV!=='development')notFound();

 const dueSoon=new Date(Date.now()+2*60*60*1000).toISOString();
 const dueTomorrow=new Date(Date.now()+24*60*60*1000).toISOString();
 const metrics=[
  ['open',{label:'Open work orders',count:18}],
  ['overdue',{label:'Overdue',count:3}],
  ['today',{label:'Due today',count:5}],
  ['risk',{label:'At risk',count:2}]
 ];
 const extraFilters=[
  ['accept','Awaiting acceptance',2],['approval','Awaiting approval',1],['client','Awaiting client',3],
  ['supplier','Awaiting supplier',2],['procurement','Awaiting procurement',4],['ts','Awaiting technical sales',1],
  ['supervisor','Awaiting supervisor',2],['blocked','Blocked',2]
 ];
 const done={completed:42,closed:16};
 const buckets=[
  ['Client',{n:3,ms:72*60*60*1000}],['Supplier',{n:2,ms:44*60*60*1000}],
  ['Procurement',{n:4,ms:31*60*60*1000}],['Technical Sales',{n:1,ms:15*60*60*1000}],
  ['Management',{n:2,ms:8*60*60*1000}]
 ];
 const mine=[
  {id:1,title:'Verify camera coverage and blind spots',status:'in_progress',due_at:dueSoon,wo_id:421,num:'WO-2026-00421',client:'Northwind Health'},
  {id:2,title:'Replace NVR storage drive',status:'accepted',due_at:dueTomorrow,wo_id:427,num:'WO-2026-00427',client:'Meridian Offices'},
  {id:3,title:'Confirm rack access with site contact',status:'waiting',due_at:null,wo_id:430,num:'WO-2026-00430',client:'Kite & Harbor Logistics'}
 ];
 const mySubs=[
  {id:1,title:'Label patch panel ports',status:'todo',wo_id:427,num:'WO-2026-00427',client:'Meridian Offices',task:'Network commissioning'}
 ];
 const sv=[
  {id:1,title:'Install door access reader',status:'assigned',assignee_name:'Amina K.',team:'Technical',due_at:dueTomorrow,wo_id:433,num:'WO-2026-00433',client:'Cedar Point School'},
  {id:2,title:'Run post-installation test',status:'in_progress',assignee_name:'Joel M.',team:'Technical',due_at:dueSoon,wo_id:434,num:'WO-2026-00434',client:'Orchid Medical Centre'}
 ];
 const maxWait=Math.max(...buckets.map(([,value])=>value.ms),1);

 return <><div className="preview-notice"><span><b>DEMO PREVIEW</b> Synthetic records only; no live data or actions.</span><Link href="/login">Back to sign in</Link></div><div className="wrap wide"><DashboardContent metrics={metrics} extraFilters={extraFilters} done={done} buckets={buckets} mine={mine} mySubs={mySubs} sv={sv} maxWait={maxWait} preview/></div></>
}