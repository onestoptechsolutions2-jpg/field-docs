import {q} from '@/lib/db';
import {need} from '@/lib/auth';
import Shell from '@/components/Shell';
import {loadWOs,FILTERS} from '@/lib/wolist';
import DashboardContent from '@/components/DashboardContent';

export const dynamic='force-dynamic';

export default async function Home(){
 const u=await need();
 const rows=await loadWOs(u,{st:'open'});
 const tech=u.role==='tech',args=tech?[u.id,u.team||'Technical']:[];
 const done=Object.fromEntries((await q(`select status,count(*)::int n from work_orders w where status in ('completed','closed') ${tech?'and (w.created_by=$1 or exists(select 1 from tasks t where t.wo_id=w.id and (t.assignee=$1 or t.team=$2)) or exists(select 1 from subtasks s where s.wo_id=w.id and s.assignee=$1))':''} group by status`,args)).map(x=>[x.status,x.n]));
 const B={};
 rows.forEach(w=>{if(!w.S.p)return;const b=B[w.S.bucket]||(B[w.S.bucket]={n:0,ms:0});b.n++;b.ms+=w.S.waited});
 const buckets=Object.entries(B).sort((a,b)=>b[1].ms-a[1].ms);
 const mine=await q(`select t.id,t.title,t.status,t.team,t.due_at,t.wo_id,w.num,w.client from tasks t join work_orders w on w.id=t.wo_id where w.status='open' and t.status in ('ready','assigned','accepted','in_progress','waiting') and (t.assignee=$1 or (t.assignee is null and t.team=$2)) order by t.state_since limit 30`,[u.id,u.team||'Technical']);
 const sv=u.role==='tech'?[]:await q(`select t.id,t.title,t.status,t.team,t.assignee_name,t.due_at,t.wo_id,w.num,w.client from tasks t join work_orders w on w.id=t.wo_id where w.status='open' and t.supervisor=$1 and t.status in ('ready','assigned','accepted','in_progress','waiting') order by t.state_since limit 30`,[u.id]);
 const mySubs=await q(`select s.id,s.title,s.status,s.wo_id,w.num,w.client,t.title task from subtasks s join tasks t on t.id=s.task_id join work_orders w on w.id=s.wo_id where w.status='open' and s.status<>'done' and s.assignee=$1 order by s.id limit 30`,[u.id]);
 const filters=Object.entries(FILTERS).map(([k,[label,filter]])=>[k,label,rows.filter(w=>filter(w.S)).length]);
 const byKey=Object.fromEntries(filters.map(([key,label,count])=>[key,{label,count}]));
 const metrics=['open','overdue','today','risk'].map(key=>[key,byKey[key]]);
 const maxWait=Math.max(...buckets.map(([,value])=>value.ms),1);
 const extraFilters=filters.filter(([key])=>!['open','overdue','today','risk'].includes(key));

 return <Shell u={u} wide><DashboardContent metrics={metrics} extraFilters={extraFilters} done={done} buckets={buckets} mine={mine} mySubs={mySubs} sv={sv} maxWait={maxWait}/></Shell>
}
