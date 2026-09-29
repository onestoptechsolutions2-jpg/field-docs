import {q} from './db';import {cal,woClocks,taskClock,summarize} from './wo';
const kind=d=>d.type==='wt'?'Work Ticket':d.type==='ho'?'Handover':d.data?.f?.jobtype||'Site Report';
export const curYm=(off=0)=>{const d=new Date();d.setMonth(d.getMonth()+off,1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')};
export async function monthData(ym,u){
 const docs=await q(`select d.id,d.num,d.type,d.status,d.data,d.owner,d.client_name,d.created_at,d.sent_at,d.signed_at,d.esc_status,d.esc_reason,u.name tech from docs d join users u on u.id=d.owner where d.created_at>=($1::text||'-01')::date and d.created_at<(($1::text||'-01')::date+interval '1 month') and ($2::boolean or d.owner=$3) order by d.created_at`,[ym,!u||u.role!=='tech',u?.id||0]);
 const cnt=(a,fn)=>{const m={};a.forEach(x=>{const k=fn(x)||'—';m[k]=(m[k]||0)+1});return m};
 const mins=d=>(d.data?.rows||[]).reduce((a,r)=>a+(+r.n||0),0);
 const signed=docs.filter(d=>d.status==='signed'),hrs=signed.filter(d=>d.sent_at).map(d=>(new Date(d.signed_at)-new Date(d.sent_at))/36e5);
 const tech={},client={};
 docs.forEach(d=>{const s=d.status==='signed'?1:0,e=d.esc_status?1:0,m=mins(d);
  const t=tech[d.tech]||(tech[d.tech]={docs:0,signed:0,esc:0,mins:0});t.docs++;t.signed+=s;t.esc+=e;t.mins+=m;
  const c=d.data?.f?.client||'—',k=client[c]||(client[c]={docs:0,signed:0,esc:0});k.docs++;k.signed+=s;k.esc+=e});
 return {ym,docs:docs.map(d=>({...d,kind:kind(d),client:d.data?.f?.client||'—',outcome:d.data?.f?.outcome||'',mins:mins(d)})),total:docs.length,signed:signed.length,
  pending:docs.filter(d=>['sent','viewed'].includes(d.status)).length,drafts:docs.filter(d=>d.status==='draft').length,esc:docs.filter(d=>d.esc_status).length,escResolved:docs.filter(d=>d.esc_status==='resolved').length,
  avgHrs:hrs.length?hrs.reduce((a,b)=>a+b,0)/hrs.length:null,minutes:docs.reduce((a,d)=>a+mins(d),0),
  byKind:cnt(docs,kind),byProduct:cnt(docs.filter(d=>d.data?.f?.product),d=>d.data.f.product),byOutcome:cnt(docs.filter(d=>d.data?.f?.outcome),d=>d.data.f.outcome),byReason:cnt(docs.filter(d=>d.esc_status),d=>d.esc_reason),tech,client}}
export const summaryText=r=>`Monthly report ${r.ym}\nDocuments: ${r.total}\nSigned: ${r.signed}\nAwaiting signature: ${r.pending}\nDrafts: ${r.drafts}\nEscalations: ${r.esc} (${r.escResolved} resolved)\nAvg time to sign: ${r.avgHrs==null?'n/a':r.avgHrs.toFixed(1)+' h'}\nTicket hours: ${(r.minutes/60).toFixed(1)}`;

export async function woStats(ym,u){
 await cal();const tech=u&&u.role==='tech',args=[ym];if(tech)args.push(u.id,u.team||'Technical');
 const wos=await q(`select w.* from work_orders w where w.created_at>=($1::text||'-01')::date and w.created_at<(($1::text||'-01')::date+interval '1 month')${tech?' and (w.created_by=$2 or exists(select 1 from tasks t where t.wo_id=w.id and (t.assignee=$2 or t.team=$3)) or exists(select 1 from subtasks s where s.wo_id=w.id and s.assignee=$2))':''} order by w.created_at`,args);
 const ids=wos.map(w=>w.id),tasks=ids.length?await q('select * from tasks where wo_id=any($1::int[])',[ids]):[],spans=ids.length?await q('select task_id,wo_id,state,party,t_start,t_end from task_spans where wo_id=any($1::int[])',[ids]):[];
 const now=Date.now(),byOwner={},st={},list=[];let ageSum=0,ageN=0,sla=0,done=0;
 for(const w of wos){const ts=tasks.filter(t=>t.wo_id===w.id),c=woClocks(w,ts,spans.filter(s=>s.wo_id===w.id),now),S=summarize(w,ts,now);
  Object.entries(c.byOwner).forEach(([k,v])=>byOwner[k]=(byOwner[k]||0)+v);
  if(w.status!=='open'){done++;ageSum+=c.age;ageN++;if(w.completed_at&&w.due_at&&+new Date(w.completed_at)<=+new Date(w.due_at))sla++}
  list.push({num:w.num,client:w.client,service:w.service,status:w.status,created:w.created_at,due:w.due_at,completed:w.completed_at,why:S.why,planned:w.planned_min*6e4,age:c.age,active:c.active,assign:c.assign,client_wait:c.ext.Client||0,supplier_wait:c.ext.Supplier||0,other_ext:Object.entries(c.ext).filter(([k])=>!['Client','Supplier'].includes(k)).reduce((a,[,v])=>a+v,0)})}
 for(const t of tasks.filter(t=>t.status==='done')){const c=taskClock(t,spans.filter(s=>s.task_id===t.id),now),x=st[t.title]||(st[t.title]={title:t.title,team:t.team,n:0,plan:0,work:0,ext:0});x.n++;x.plan+=t.planned_min*6e4;x.work+=c.work;x.ext+=Object.values(c.waitExt).reduce((a,b)=>a+b,0)}
 return {created:wos.length,done,sla,slaPct:done?Math.round(sla/done*100):null,avgAge:ageN?ageSum/ageN:null,byOwner,stages:Object.values(st).sort((a,b)=>b.n-a.n),list}}
