import {addWork,isWorkDay} from './time';
const M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],EXT=['Client','Supplier','Third party','Site access','External authority'];
export function buildGantt(wo,tasks,spans,now){
 const plan={},t0=+new Date(wo.created_at);
 for(const t of tasks){const ps=Math.max(t0,...t.depends.map(d=>plan[d]?.pe||0));plan[t.id]={ps,pe:+addWork(ps,t.planned_min*6e4)}}
 const rows=tasks.map(t=>({id:t.id,seq:t.seq,title:t.title,team:t.team,status:t.status,ps:plan[t.id].ps,pe:plan[t.id].pe,due:t.due_at?+new Date(t.due_at):null,done:t.done_at?+new Date(t.done_at):null,
  segs:spans.filter(s=>s.task_id===t.id).map(s=>({a:+new Date(s.t_start),b:s.t_end?+new Date(s.t_end):now,k:s.state==='in_progress'?'act':s.state==='waiting'?(EXT.includes(s.party)?'wext':'wint'):'idle',l:s.state==='waiting'?'Waiting: '+s.party:s.state.replace('_',' ')}))}));
 let t1=Math.max(wo.completed_at?+new Date(wo.completed_at):now,...rows.filter(r=>r.status!=='skipped').map(r=>r.pe));t1+=(t1-t0)*.03;
 const off=[],d=new Date(t0);d.setHours(0,0,0,0);for(let i=0;+d<t1&&i<500;i++){if(!isWorkDay(d))off.push([+d,+d+864e5]);d.setDate(d.getDate()+1)}
 const step=(t1-t0)>25*864e5?7:1,ticks=[],k=new Date(t0);k.setHours(0,0,0,0);for(let i=0;+k<=t1&&i<200;i++){ticks.push({x:Math.max(+k,t0),l:k.getDate()+' '+M[k.getMonth()]});k.setDate(k.getDate()+step)}
 return {t0,t1,now:Math.min(now,t1),rows,off,ticks}}
