export default async function start(){
 const {q,getSet,setSet}=await import('./lib/db');
 const tick=async()=>{try{const now=new Date();if(now.getDate()!==1||now.getHours()<7)return;
  const {monthData,curYm,summaryText}=await import('./lib/report');const ym=curYm(-1),key='report_sent_'+ym;
  if(await getSet(key))return;await setSet(key,'1');
  const r=await monthData(ym,null),link=(process.env.APP_URL||'')+'/reports?m='+ym;
  const to=await q("select id,email from users where role in ('admin','supervisor')");
  const {notify}=await import('./lib/push'),{mail}=await import('./lib/mail');
  notify(to.map(x=>x.id),{title:'Monthly report ready',body:`${ym}: ${r.total} documents, ${r.signed} signed, ${r.esc} escalations`,url:'/reports?m='+ym,tag:'monthly',nomail:true});
  for(const x of to){try{await mail(x.email,'Field Docs monthly report '+ym,summaryText(r)+'\n\nFull report: '+link)}catch(e){}}
 }catch(e){}};
 setInterval(tick,30*60*1000);setTimeout(tick,20000);
 const due=async()=>{try{const {notify}=await import('./lib/push');
  const ids=async(t)=>(await q('select id from users where team=$1',[t.team])).map(x=>x.id),ad=async()=>(await q("select id from users where role in ('admin','supervisor')")).map(x=>x.id);
  const base="select t.*,w.num,w.id woid from tasks t join work_orders w on w.id=t.wo_id where w.status='open' and t.status in ('ready','assigned','accepted','in_progress','waiting') and t.due_at is not null";
  for(const t of await q(base+" and not t.warned and t.due_at>=now() and t.due_at<now()+interval '1 hour'")){await q('update tasks set warned=true where id=$1',[t.id]);
   notify(t.assignee?[t.assignee]:await ids(t),{title:'Due within 1 hour · '+t.num,body:t.title+' is due soon. Owner: '+(t.assignee_name||t.team)+'. Next: '+(t.next||'complete the task'),url:'/workorders/'+t.woid,tag:'due'+t.id})}
  for(const t of await q(base+" and not t.late_notified and t.due_at<now()")){await q('update tasks set late_notified=true where id=$1',[t.id]);
   notify([...new Set([...(t.assignee?[t.assignee]:await ids(t)),...(t.supervisor?[t.supervisor]:await ad())])],{title:'OVERDUE · '+t.num,body:t.title+' is overdue. Owner: '+(t.assignee_name||t.team),url:'/workorders/'+t.woid,tag:'due'+t.id})}
 }catch(e){}};
 setInterval(due,10*60*1000);setTimeout(due,30000);
 const escalate=async()=>{try{const {notify}=await import('./lib/push');
  const ad=(await q("select id from users where role='admin'")).map(x=>x.id);
  const rows=await q("select t.*,w.num,w.id woid from tasks t join work_orders w on w.id=t.wo_id where w.status='open' and t.status in ('ready','assigned','accepted','in_progress','waiting','pending_approval') and t.due_at is not null and t.late_notified and not t.escalated and t.due_at<now()-interval '24 hours'");
  for(const t of rows){await q('update tasks set escalated=true where id=$1',[t.id]);
   notify([...new Set([...(t.supervisor?[t.supervisor]:[]),...ad])],{title:'ESCALATED · severely overdue · '+t.num,body:t.title+' is more than a day overdue. Owner: '+(t.assignee_name||t.team),url:'/workorders/'+t.woid,tag:'esc'+t.id})}
 }catch(e){}};
 setInterval(escalate,30*60*1000);setTimeout(escalate,50000);
 const chase=async()=>{try{const {notify}=await import('./lib/push');
  const ap=await q("select a.*,w.num from approvals a join work_orders w on w.id=a.wo_id where a.status='pending' and a.created_at<now()-interval '3 days' and (a.reminded_at is null or a.reminded_at<now()-interval '3 days')");
  for(const a of ap){await q('update approvals set reminded_at=now() where id=$1',[a.id]);
   notify(a.created_by?[a.created_by]:[],{title:"Client hasn't responded · "+a.num,body:'"'+a.title+'" has been waiting '+Math.floor((Date.now()-+new Date(a.created_at))/864e5)+' day(s). Follow up with the client.',url:'/workorders/'+a.wo_id,tag:'chase'+a.id})}
  const dc=await q("select * from docs where status in ('sent','viewed') and sent_at<now()-interval '3 days' and (reminded_at is null or reminded_at<now()-interval '3 days')");
  for(const d of dc){await q('update docs set reminded_at=now() where id=$1',[d.id]);
   notify([d.owner],{title:"Client hasn't signed · "+d.num,body:'Sent '+Math.floor((Date.now()-+new Date(d.sent_at))/864e5)+' day(s) ago. Follow up with the client.',url:'/docs/'+d.id,tag:'chase'+d.id})}
 }catch(e){}};
 setInterval(chase,6*60*60*1000);setTimeout(chase,60000);
 const gen=async()=>{try{const {runDue}=await import('./lib/sched');await runDue()}catch(e){}};
 setInterval(gen,60*60*1000);setTimeout(gen,45000)}
