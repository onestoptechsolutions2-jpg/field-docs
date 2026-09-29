import {randomBytes} from 'crypto';import {q} from './db';import {notify} from './push';import {workMs,addWork,dur,setCal} from './time';import {parse,critical} from './workflows';import {teamList} from './lists';
export const ACT=['ready','assigned','accepted','in_progress','waiting','pending_approval'];
export const EXT=['Client','Supplier','Third party','Site access','External authority'];
const DONE=['done','skipped'],ago=(a,n)=>+new Date(a)>n?0:n-+new Date(a);
export async function cal(){const v=await q("select value from settings where key='cal'");if(v[0])try{setCal(JSON.parse(v[0].value))}catch(e){}}
export const evt=(wo,task,u,action,comment,meta)=>q('insert into task_events(wo_id,task_id,user_id,user_name,action,comment,meta) values($1,$2,$3,$4,$5,$6,$7) returning id',[wo,task||null,u?.id||null,u?.name||'System',action,comment||null,meta?JSON.stringify(meta):null]).then(r=>r[0].id);
const sups=()=>q("select id from users where role in ('admin','supervisor')").then(r=>r.map(x=>x.id));
const teamIds=t=>q('select id from users where team=$1',[t]).then(r=>r.map(x=>x.id));
async function setState(t,status,x={}){
 const now=new Date();await q('update task_spans set t_end=$2 where task_id=$1 and t_end is null',[t.id,now]);
 const sets=['status=$2','state_since=$3'],vals=[t.id,status,now];
 for(const [k,v] of Object.entries(x)){vals.push(v);sets.push(`${k}=$${vals.length}`)}
 await q(`update tasks set ${sets.join(',')} where id=$1`,vals);
 if(!['done','skipped','blocked'].includes(status))await q('insert into task_spans(task_id,wo_id,state,party,team,t_start) values($1,$2,$3,$4,$5,$6)',[t.id,t.wo_id,status,status==='waiting'?(x.waiting_party||t.waiting_party):null,t.team,now])}
async function activate(t,wo){const now=new Date();
 if(t.wait_default){await setState(t,'waiting',{waiting_party:t.wait_default,waiting_reason:t.why||t.title,waiting_since:now,started_at:now,due_at:addWork(now,t.planned_min*6e4)});
  notify(await teamIds(t.team),{title:'ACTION REQUIRED · '+wo.num,body:`${t.title}. Waiting for: ${t.wait_default}. Owner: ${t.team}. Next: ${t.next||'Follow up'}`,url:'/workorders/'+wo.id,tag:'t'+t.id})}
 else{await setState(t,'ready',{});notify(await teamIds(t.team),{title:'ACTION REQUIRED · '+wo.num,body:`New task ready: ${t.title}. Owner: ${t.team}. Next: assign and start.`,url:'/workorders/'+wo.id,tag:'t'+t.id})}}
async function cascade(wo,u){
 for(let g=0;g<30;g++){let ch=false;
  const ts=await q('select * from tasks where wo_id=$1 order by seq',[wo.id]),st=Object.fromEntries(ts.map(t=>[t.id,t.status]));
  for(const t of ts){if(t.status!=='blocked'||!t.depends.every(d=>DONE.includes(st[d])))continue;
   if(t.opt&&t.depends.length&&t.depends.every(d=>st[d]==='skipped')){await setState(t,'skipped');await evt(wo.id,t.id,null,'skipped','Not required (previous step skipped)')}
   else await activate(t,wo);ch=true;break}
  if(!ch)break}
 const ts=await q('select status from tasks where wo_id=$1',[wo.id]);
 if(ts.length&&ts.every(t=>DONE.includes(t.status))){await q("update work_orders set status='completed',completed_at=now() where id=$1 and status='open'",[wo.id]);await evt(wo.id,null,u,'completed','Work order completed');
  notify([...new Set([wo.created_by,...await sups()])],{title:'Completed · '+wo.num,body:wo.client+' — all tasks finished',url:'/workorders/'+wo.id,tag:'wo'+wo.id})}}
export async function visible(u,id){if(u.role!=='tech')return true;return (await q('select 1 from work_orders w where w.id=$1 and (w.created_by=$2 or exists(select 1 from tasks t where t.wo_id=w.id and (t.assignee=$2 or t.team=$3)) or exists(select 1 from subtasks s where s.wo_id=w.id and s.assignee=$2))',[id,u.id,u.team||'Technical'])).length>0}
export async function evidence(t){
 const c=(await q('select count(*)::int c from attachments where task_id=$1',[t.id]))[0].c,ap=(await q("select count(*)::int c from approvals where task_id=$1 and status='approved'",[t.id]))[0].c,docs=await q('select status,data from docs where wo_id=$1',[t.wo_id]);
 const fin=docs.some(d=>d.data?.fin||d.status==='signed'),signed=docs.some(d=>d.status==='signed'),chk=t.chk||[],m=[];
 for(const e of t.ev){
  if(e==='file'&&!c)m.push('an attachment');
  if(e==='ref'&&!t.ref)m.push('an external reference');
  if(e==='fileref'&&!c&&!t.ref&&!ap)m.push('an attachment or external reference');
  if(e==='doc'&&!fin)m.push('a completed field document');
  if(e==='signed'&&!signed)m.push('a client-signed document');
  if(e==='check'&&(!chk.length||chk.some(x=>!x.done)))m.push(chk.length?'all checklist items ticked':'checklist items (add at least one)')}
 return m}
export async function createWO(u,b){
 await cal();const tpl=(await q('select * from templates where id=$1 and active',[b.template_id]))[0];if(!tpl)throw new Error('Choose a service type');
 if(!(b.client||'').trim())throw new Error('Choose a client');
 const ts=parse(tpl.dsl),cp=critical(ts),now=new Date(),sv=b.supervisor_id?(await q("select id,name from users where id=$1 and role in ('admin','supervisor')",[b.supervisor_id]))[0]:null;
 const wo=(await q('insert into work_orders(client_id,client,site,contact,requirement,priority,requested,service,template_id,ext_ref,created_by,due_at,planned_min) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning *',[b.client_id||null,b.client,b.site||null,b.contact||null,b.requirement||null,b.priority||'Normal',b.requested||null,tpl.name,tpl.id,b.ext_ref||null,u.id,addWork(now,cp*6e4),cp]))[0];
 wo.num='WO-'+now.getFullYear()+'-'+String(wo.id).padStart(6,'0');await q('update work_orders set num=$1 where id=$2',[wo.num,wo.id]);
 const ids={};let seq=0;
 for(const t of ts){const items=t.chk==='@items'?[]:t.chk?t.chk.split('~').map(x=>({t:x,done:false})):[];
  ids[t.key]=(await q('insert into tasks(wo_id,seq,key,title,team,depends,planned_min,ev,doc_hint,chk_mode,chk,opt,next,why,wait_default,supervisor,supervisor_name) values($1,$2,$3,$4,$5,$6::int[],$7,$8::text[],$9,$10,$11,$12,$13,$14,$15,$16,$17) returning id',[wo.id,++seq,t.key,t.title,t.team,t.deps.map(k=>ids[k]),t.mins,t.ev,t.doc,t.chk==='@items'?'items':t.chk?'steps':null,JSON.stringify(items),t.opt,t.next,t.why,t.wait,sv?.id||null,sv?.name||null]))[0].id;
  if(t.sub)for(const [i,x] of t.sub.split('~').entries())await q('insert into subtasks(task_id,wo_id,title,pos) values($1,$2,$3,$4)',[ids[t.key],wo.id,x,i+1])}
 await evt(wo.id,null,u,'created',`Work order created (${tpl.name}). Planned project duration ${dur(cp*6e4)} of working time.`);
 for(const t of await q('select * from tasks where wo_id=$1 and cardinality(depends)=0 order by seq',[wo.id]))await activate(t,wo);
 return wo.id}
export async function act(u,id,action,p={}){
 await cal();const t=(await q('select * from tasks where id=$1',[id]))[0];if(!t)throw new Error('Task not found');
 const wo=(await q('select * from work_orders where id=$1',[t.wo_id]))[0],sup=u.role!=='tech',now=new Date(),E=(a,c,m)=>evt(wo.id,t.id,u,a,c,m);
 if(wo.status!=='open')throw new Error('Work order is '+wo.status);
 let ok=sup||t.assignee===u.id||t.team===u.team;
 if(!ok&&action.startsWith('sub_')&&p.id){const s0=(await q('select assignee from subtasks where id=$1 and task_id=$2',[p.id,t.id]))[0];if(s0?.assignee===u.id)ok=true}
 if(!ok)throw new Error('This task belongs to '+t.team);
 const need=(v,m)=>{if(!v||!String(v).trim())throw new Error(m)},from=(...s)=>{if(!s.includes(t.status))throw new Error('Not possible while the task is “'+t.status+'”')};
 const me={assignee:u.id,assignee_name:u.name};
 switch(action){
  case 'take':from('ready','assigned');await setState(t,'accepted',{...me,assigned_at:now,accepted_at:now});await E('accepted','Took the task');break;
  case 'assign':{from('ready','assigned','accepted');const a=(await q('select id,name from users where id=$1',[p.user]))[0];need(a,'Choose a person');
   await setState(t,'assigned',{assignee:a.id,assignee_name:a.name,assigned_at:now,accepted_at:null});await E('assigned','Assigned to '+a.name);
   notify([a.id],{title:'ACTION REQUIRED · '+wo.num,body:`${t.title} was assigned to you. Accept or reject it.`,url:'/workorders/'+wo.id,tag:'t'+t.id});break}
  case 'accept':from('assigned');await setState(t,'accepted',{accepted_at:now});await E('accepted','Accepted');break;
  case 'reject':from('assigned','accepted');need(p.reason,'Give a reason');await setState(t,'ready',{assignee:null,assignee_name:null,accepted_at:null,rejections:t.rejections+1});await E('rejected',p.reason);
   notify(t.supervisor?[t.supervisor]:await sups(),{title:'Assignment rejected · '+wo.num,body:`${u.name}: ${p.reason}`,url:'/workorders/'+wo.id,tag:'t'+t.id});break;
  case 'start':case 'resume':from('ready','assigned','accepted','waiting');await setState(t,'in_progress',{assignee:t.assignee||u.id,assignee_name:t.assignee_name||u.name,started_at:t.started_at||now,due_at:t.due_at||addWork(now,t.planned_min*6e4),waiting_party:null,waiting_reason:null,waiting_since:null});
   await E(action==='start'?'started':'resumed',action==='start'?'Work started':'Resumed after waiting');break;
  case 'wait':from('ready','assigned','accepted','in_progress');need(p.party,'Who are we waiting for?');need(p.reason,'Why are we waiting?');
   await setState(t,'waiting',{waiting_party:p.party,waiting_reason:p.reason,waiting_since:now,due_at:t.due_at||addWork(now,t.planned_min*6e4)});await E('waiting',`Waiting for ${p.party}: ${p.reason}`);
   notify(t.supervisor?[t.supervisor]:await sups(),{title:'Blocked · waiting on '+p.party+' · '+wo.num,body:`${t.title}: ${p.reason}`,url:'/workorders/'+wo.id,tag:'wait'+t.id});break;
  case 'complete':{from('in_progress','waiting');if(t.status==='waiting'&&!t.wait_default)throw new Error('Resume work first, then complete');
   const os=(await q("select count(*)::int c from subtasks where task_id=$1 and status<>'done'",[t.id]))[0].c;if(os)throw new Error(os+' sub-task'+(os>1?'s are':' is')+' still open');
   const m=await evidence(t);if(m.length)throw new Error('Cannot complete yet. Needs '+m.join(', ')+'.');
   if(t.supervisor){await setState(t,'pending_approval',{waiting_party:'Supervisor',waiting_reason:'Awaiting supervisor approval',waiting_since:now,assignee:t.assignee||u.id,assignee_name:t.assignee_name||u.name});await E('submitted',p.note||'Submitted for supervisor approval');
    notify([t.supervisor],{title:'APPROVAL NEEDED · '+wo.num,body:`${t.title} is ready for your approval.`,url:'/workorders/'+wo.id,tag:'t'+t.id});break}
   await setState(t,'done',{done_at:now,assignee:t.assignee||u.id,assignee_name:t.assignee_name||u.name,waiting_reason:null});await E('completed',p.note||'Task completed');await cascade(wo,u);break}
  case 'approve':{if(!sup)throw new Error('Supervisors only');from('pending_approval');await setState(t,'done',{done_at:now,waiting_reason:null});await E('approved',p.note||'Approved');await cascade(wo,u);break}
  case 'reject_complete':{if(!sup)throw new Error('Supervisors only');from('pending_approval');need(p.reason,'Give a reason');
   await setState(t,'in_progress',{waiting_party:null,waiting_reason:null,waiting_since:null});await E('approval_rejected',p.reason);
   notify(t.assignee?[t.assignee]:await teamIds(t.team),{title:'Sent back · '+wo.num,body:`${t.title}: ${p.reason}`,url:'/workorders/'+wo.id,tag:'t'+t.id});break}
  case 'reassign_team':{if(!sup)throw new Error('Supervisors only');if(['done','skipped'].includes(t.status))throw new Error('Task already finished');
   const team=(p.team||'').trim();need(team,'Choose a department');if(!(await teamList()).includes(team))throw new Error('Unknown department');
   await q('update tasks set team=$2,assignee=null,assignee_name=null,accepted_at=null where id=$1',[t.id,team]);await E('reassigned_team',`Moved to ${team}`+(p.reason?': '+p.reason:''));
   notify(await teamIds(team),{title:'ACTION REQUIRED · '+wo.num,body:`${t.title} was reassigned to your department.`,url:'/workorders/'+wo.id,tag:'t'+t.id});break}
  case 'skip':from('blocked','ready','assigned','accepted','waiting');if(!t.opt)throw new Error('This task is required');await setState(t,'skipped');await E('skipped',p.reason||'Not required');await cascade(wo,u);break;
  case 'return':{if(!sup)throw new Error('Supervisors only');from('done');need(p.reason,'Give a reason');await setState(t,'in_progress',{done_at:null,reopened:t.reopened+1});await E('returned',p.reason);
   for(const d of await q("select * from tasks where wo_id=$1 and $2=any(depends) and status in ('ready','assigned','accepted','waiting')",[wo.id,t.id]))await setState(d,'blocked',{});
   notify(t.assignee?[t.assignee]:await teamIds(t.team),{title:'Returned for correction · '+wo.num,body:`${t.title}: ${p.reason}`,url:'/workorders/'+wo.id,tag:'t'+t.id});break}
  case 'revise':{need(p.due,'Pick the new deadline');need(p.reason,'Give a reason');const nd=new Date(p.due);if(isNaN(+nd))throw new Error('Bad date');
   await q('update tasks set due_at=$2,orig_due_at=coalesce(orig_due_at,due_at),warned=false,late_notified=false,escalated=false where id=$1',[t.id,nd]);
   await E('replanned',p.reason,{from:t.due_at,to:nd,original:t.orig_due_at||t.due_at});break}
  case 'check_add':need(p.text,'Enter the item');await q('update tasks set chk=chk||$2::jsonb where id=$1',[t.id,JSON.stringify([{t:p.text.trim(),done:false}])]);await E('checklist','Added: '+p.text.trim());break;
  case 'check_toggle':{const c=t.chk||[];if(!c[p.i])throw new Error('Not found');c[p.i].done=!c[p.i].done;await q('update tasks set chk=$2::jsonb where id=$1',[t.id,JSON.stringify(c)]);await E('checklist',(c[p.i].done?'Done: ':'Reopened: ')+c[p.i].t);break}
  case 'check_del':{const c=(t.chk||[]).filter((_,i)=>i!==p.i);await q('update tasks set chk=$2::jsonb where id=$1',[t.id,JSON.stringify(c)]);break}
  case 'ref':await q('update tasks set ref=$2 where id=$1',[t.id,(p.ref||'').trim()||null]);await E('reference','External reference: '+(p.ref||'(cleared)'));break;
  case 'set_supervisor':{if(!sup)throw new Error('Supervisors only');let a=null;if(p.user){a=(await q("select id,name from users where id=$1 and role in ('admin','supervisor')",[p.user]))[0];need(a,'Choose a supervisor')}
   await q('update tasks set supervisor=$2,supervisor_name=$3 where id=$1',[t.id,a?.id||null,a?.name||null]);await E('supervisor',a?'Supervisor: '+a.name:'Supervisor cleared');
   if(a)notify([a.id],{title:'Supervising · '+wo.num,body:`You are now the supervisor for “${t.title}”.`,url:'/workorders/'+wo.id,tag:'t'+t.id});break}
  case 'sub_add':{need(p.title,'Enter the sub-task');if(DONE.includes(t.status))throw new Error('Task is already '+t.status);const a=p.user?(await q('select id,name from users where id=$1',[p.user]))[0]:null;
   const pos=(await q('select coalesce(max(pos),0)+1 n from subtasks where task_id=$1',[t.id]))[0].n;
   await q('insert into subtasks(task_id,wo_id,title,assignee,assignee_name,after,planned_min,pos) values($1,$2,$3,$4,$5,$6,$7,$8)',[t.id,wo.id,p.title.trim(),a?.id||null,a?.name||null,p.after||null,+p.mins||null,pos]);
   await E('subtask','Sub-task added: '+p.title.trim()+(a?' → '+a.name:''));if(a&&a.id!==u.id)notify([a.id],{title:'ACTION REQUIRED · '+wo.num,body:`Sub-task “${p.title.trim()}” (${t.title}) was assigned to you.`,url:'/workorders/'+wo.id,tag:'s'+t.id});break}
  case 'sub_assign':{const a=(await q('select id,name from users where id=$1',[p.user]))[0];need(a,'Choose a person');await q('update subtasks set assignee=$2,assignee_name=$3 where id=$1 and task_id=$4',[p.id,a.id,a.name,t.id]);await E('subtask','Sub-task assigned to '+a.name);
   if(a.id!==u.id)notify([a.id],{title:'ACTION REQUIRED · '+wo.num,body:`A sub-task of “${t.title}” was assigned to you.`,url:'/workorders/'+wo.id,tag:'s'+t.id});break}
  case 'sub_start':case 'sub_done':{const s=(await q('select * from subtasks where id=$1 and task_id=$2',[p.id,t.id]))[0];need(s,'Sub-task not found');
   if(s.after){const b=(await q('select title,status,assignee_name from subtasks where id=$1',[s.after]))[0];if(b&&b.status!=='done')throw new Error(`“${s.title}” can't ${action==='sub_start'?'start':'finish'} until “${b.title}”${b.assignee_name?' ('+b.assignee_name+')':''} is done`)}
   await q(action==='sub_start'?"update subtasks set status='in_progress',started_at=coalesce(started_at,now()),assignee=coalesce(assignee,$2),assignee_name=coalesce(assignee_name,$3) where id=$1":"update subtasks set status='done',done_at=now(),started_at=coalesce(started_at,now()),assignee=coalesce(assignee,$2),assignee_name=coalesce(assignee_name,$3) where id=$1",[s.id,u.id,u.name]);
   await E('subtask',(action==='sub_start'?'Started: ':'Done: ')+s.title);break}
  case 'sub_reopen':await q("update subtasks set status='todo',done_at=null where id=$1 and task_id=$2",[p.id,t.id]);await E('subtask','Sub-task reopened');break;
  case 'sub_del':await q('delete from subtasks where id=$1 and task_id=$2',[p.id,t.id]);break;
  default:throw new Error('Unknown action')}
 return true}
export async function closeWO(u,id){if(u.role==='tech')throw new Error('Supervisors only');await q("update work_orders set status='closed' where id=$1 and status='completed'",[id]);await evt(id,null,u,'closed','Work order closed')}
export async function editWO(u,id,b){if(u.role==='tech')throw new Error('Supervisors only');
 const wo=(await q('select * from work_orders where id=$1',[id]))[0];if(!wo)throw new Error('Not found');if(wo.status!=='open')throw new Error('Work order is '+wo.status);
 const need=(v,m)=>{if(!v||!String(v).trim())throw new Error(m)};need(b.client,'Client is required');
 const due=b.due_at?new Date(b.due_at):wo.due_at;if(b.due_at&&isNaN(+due))throw new Error('Bad due date');
 await q('update work_orders set client=$2,site=$3,contact=$4,requirement=$5,priority=$6,ext_ref=$7,due_at=$8,edited_at=now() where id=$1',
  [id,b.client.trim(),b.site||null,b.contact||null,b.requirement||null,b.priority||wo.priority,b.ext_ref||null,due]);
 await evt(id,null,u,'edited','Work order details updated');return true}
export async function cancelWO(u,id,reason){if(u.role==='tech')throw new Error('Supervisors only');
 const wo=(await q('select * from work_orders where id=$1',[id]))[0];if(!wo)throw new Error('Not found');if(wo.status!=='open')throw new Error('Work order is '+wo.status);
 if(!(reason||'').trim())throw new Error('Give a reason');
 await q("update work_orders set status='cancelled',cancelled_at=now(),cancelled_by=$2,cancel_reason=$3 where id=$1",[id,u.id,reason.trim()]);
 await q('update task_spans set t_end=now() where wo_id=$1 and t_end is null',[id]);
 await evt(id,null,u,'cancelled',reason.trim());
 notify([...new Set([wo.created_by,...await sups()])],{title:'Cancelled · '+wo.num,body:wo.client+' — '+reason.trim(),url:'/workorders/'+id,tag:'wo'+id});return true}
export async function createDoc(u,taskId,hint){
 const t=(await q('select * from tasks where id=$1',[taskId]))[0];if(!t)throw new Error('Task not found');
 const wo=(await q('select * from work_orders where id=$1',[t.wo_id]))[0],[hk,hj]=(hint||t.doc_hint||'sr:').split(':'),type=['sr','wt','ho'].includes(hk)?hk:'sr',day=new Date().toISOString().slice(0,10);
 const f=type==='sr'?{jobtype:hj||'Site Survey',client:wo.client,project:wo.site||'',start:day}:type==='ho'?{client:wo.client,date:day,by:u.name,job:wo.num}:{client:wo.client,contact:wo.contact||'',reported:day,priority:'Medium',issue:wo.requirement||''};
 const d=(await q('insert into docs(type,owner,token,data,wo_id,task_id) values($1,$2,$3,$4,$5,$6) returning id',[type,u.id,randomBytes(18).toString('hex'),JSON.stringify({f,cid:wo.client_id||null,rows:[{}],tech:u.name,step:0}),wo.id,t.id]))[0];
 const num=({sr:'SR',ho:'HO',wt:'WT'})[type]+'-'+new Date().getFullYear()+'-'+String(d.id).padStart(4,'0');
 await q('update docs set num=$1 where id=$2',[num,d.id]);await q('insert into events(doc_id,what) values($1,$2)',[d.id,'Created by '+u.name+' for '+wo.num]);
 await evt(wo.id,t.id,u,'document','Started field document '+num);return d.id}
export const remaining=(t,now)=>{if(!t.due_at||DONE.includes(t.status))return null;const d=+new Date(t.due_at);return d>now?workMs(now,d):-workMs(d,now)};
export function taskClock(t,spans,now){
 const c={active:0,assign:0,waitExt:{},waitInt:{}};let first=null;
 for(const s of spans){if(s.task_id!==t.id)continue;const a=+new Date(s.t_start),ms=(s.t_end?+new Date(s.t_end):now)-a;first=first==null?a:Math.min(first,a);
  if(s.state==='in_progress')c.active+=ms;else if(['ready','assigned','accepted'].includes(s.state))c.assign+=ms;
  else if(s.state==='waiting'){const m=EXT.includes(s.party)?c.waitExt:c.waitInt;m[s.party]=(m[s.party]||0)+ms}
  else if(s.state==='pending_approval')c.waitInt['Supervisor approval']=(c.waitInt['Supervisor approval']||0)+ms}
 const end=t.done_at?+new Date(t.done_at):now;c.raw=first?end-first:0;c.work=first?workMs(first,end):0;c.var=t.done_at?c.work-t.planned_min*6e4:null;return c}
export function woClocks(wo,tasks,spans,now){
 const c={age:(wo.completed_at?+new Date(wo.completed_at):now)-+new Date(wo.created_at),active:0,assign:0,ext:{},int:{},byOwner:{}},tm=Object.fromEntries(tasks.map(t=>[t.id,t.team]));
 for(const s of spans){const ms=(s.t_end?+new Date(s.t_end):now)-+new Date(s.t_start),add=(k)=>{c.byOwner[k]=(c.byOwner[k]||0)+ms};
  if(s.state==='in_progress'){c.active+=ms;add(tm[s.task_id])}else if(['ready','assigned','accepted'].includes(s.state)){c.assign+=ms;add(tm[s.task_id])}
  else if(s.state==='waiting'){const m=EXT.includes(s.party)?c.ext:c.int;m[s.party]=(m[s.party]||0)+ms;add(s.party)}
  else if(s.state==='pending_approval'){c.int['Supervisor approval']=(c.int['Supervisor approval']||0)+ms;add('Supervisor approval')}}
 return c}
export function summarize(wo,tasks,now=Date.now(),subs=[]){
 const open=tasks.filter(t=>ACT.includes(t.status)),rem=t=>remaining(t,now);
 open.sort((a,b)=>((rem(a)<0?0:1)-(rem(b)<0?0:1))||(+new Date(a.state_since)-+new Date(b.state_since)));
 const p=open[0]||null,waited=p?ago(0,now-+new Date(p.state_since))||now-+new Date(p.state_since):0,dep=p?tasks.find(t=>t.status==='blocked'&&t.depends.includes(p.id)):null;
 const items=p?.chk_mode==='items'?(p.chk||[]):[],pend=items.filter(i=>!i.done).length,who=p?(p.assignee_name?`${p.assignee_name} (${p.team})`:p.team):'',r=p?rem(p):null;
 let why,next='—',waitingFor='—',bucket=p?.team||'—';
 if(wo.status!=='open')why=wo.status==='closed'?'Closed.':wo.status==='cancelled'?'Cancelled'+(wo.cancel_reason?': '+wo.cancel_reason:'')+'.':'Complete. All tasks are finished.';
 else if(!p)why='Waiting for an upstream task to release the next step.';
 else{const s=p.status;
  if(s==='waiting'){why=`Awaiting ${p.waiting_reason||p.waiting_party} — owned by ${who} — waiting for ${dur(waited)}.`;waitingFor=p.waiting_party;bucket=p.waiting_party;next=`Follow up with ${p.waiting_party}${p.next?' — '+p.next:''}`}
  else if(s==='ready'){why=`Assignment pending for “${p.title}” — owned by ${p.team} — ${dur(waited)}.`;waitingFor=p.team+' (assignment)';bucket='Assignment pending';next='Assign a person or take the task'}
  else if(s==='assigned'){why=`${p.assignee_name} has not accepted “${p.title}” — ${dur(waited)}.`;waitingFor=p.assignee_name+' (to accept)';bucket='Awaiting acceptance';next='Accept or reject the assignment'}
  else if(s==='accepted'){why=`“${p.title}” accepted by ${p.assignee_name} but not started — ${dur(waited)}.`;waitingFor=p.assignee_name+' (to start)';next='Start work'}
  else if(s==='pending_approval'){why=`“${p.title}” done by ${p.assignee_name||who} — awaiting approval from ${p.supervisor_name||'a supervisor'} — ${dur(waited)}.`;waitingFor=(p.supervisor_name||'Supervisor')+' (to approve)';bucket='Awaiting approval';next='Approve or send back'}
  else{why=`${who} working on “${p.title}”`+(r==null?'.':r<0?` — OVERDUE by ${dur(r)}.`:` — due in ${dur(r)}.`);next=p.next||'Complete: '+p.title}
  if(pend&&dep)why+=` “${dep.title}” blocked — ${pend} of ${items.length} required items not yet received.`;else if(dep)why+=` “${dep.title}” cannot begin until this is done.`;
  const all=subs.filter(x=>x.task_id===p.id),ss=all.filter(x=>x.status!=='done');
  if(ss.length){const sb=x=>x.after&&all.find(y=>y.id===x.after&&y.status!=='done'),ac=ss.filter(x=>x.status==='in_progress'),bl=ss.filter(x=>x.status==='todo'&&sb(x));
   why+=` Sub-tasks: ${all.length-ss.length}/${all.length} done.`+(ac.length?' Active: '+ac.map(x=>x.title+(x.assignee_name?' ('+x.assignee_name+')':'')).join(', ')+'.':'')+(bl.length?' Blocked: '+bl.map(x=>`“${x.title}” waits on “${sb(x).title}”`).join(', ')+'.':'')}}
 const od=open.filter(t=>rem(t)<0),today=new Date().toDateString();
 return {p:p?{id:p.id,title:p.title,status:p.status,team:p.team,due_at:p.due_at}:null,owner:p?(p.assignee_name||p.team):'—',team:p?.team,status:p?.status||wo.status,task:p?.title,waitingFor,since:p?.state_since,waited,next,why,bucket,rem:r,
  overdue:od.length>0||(wo.status==='open'&&wo.due_at&&+new Date(wo.due_at)<now&&false),atRisk:!od.length&&open.some(t=>t.planned_min&&rem(t)!=null&&rem(t)<.25*t.planned_min*6e4),
  blocked:open.some(t=>t.status==='waiting'&&['Materials','Site access','Information','Third party'].includes(t.waiting_party))||(pend>0&&!!dep),
  dueToday:open.some(t=>t.due_at&&new Date(t.due_at).toDateString()===today),done:tasks.filter(t=>DONE.includes(t.status)).length,total:tasks.length}}
