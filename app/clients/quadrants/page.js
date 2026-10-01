import Link from 'next/link';
import {redirect} from 'next/navigation';
import {q} from '@/lib/db';
import {need} from '@/lib/auth';
import Shell from '@/components/Shell';
import ClientQuadrants from '@/components/ClientQuadrants';

export const dynamic='force-dynamic';

export default async function ClientQuadrantsPage({searchParams}){
 const u=await need();
 if(u.role==='tech')redirect('/');
 const days=[30,90,180,365].includes(+searchParams.days)?+searchParams.days:90;
 const rows=await q(`select c.id client_id,c.name client,w.id wo_id,w.status wo_status,
   t.id task_id,t.planned_min,
   coalesce(sum(case when s.state='in_progress' then greatest(0,extract(epoch from (coalesce(s.t_end,now())-s.t_start))*1000) else 0 end),0)::float active_ms
  from clients c join work_orders w on w.client_id=c.id
  left join tasks t on t.wo_id=w.id
  left join task_spans s on s.task_id=t.id
  where w.created_at>=now()-($1::int*interval '1 day')
  group by c.id,c.name,w.id,w.status,t.id,t.planned_min
  order by c.name,w.id,t.id`,[days]);
 const byClient=new Map();
 for(const row of rows){
  let client=byClient.get(row.client_id);
  if(!client){client={id:row.client_id,name:row.client,workOrders:new Map(),plannedMs:0,activeMs:0};byClient.set(row.client_id,client)}
  if(!client.workOrders.has(row.wo_id))client.workOrders.set(row.wo_id,row.wo_status);
  client.plannedMs+=(Number(row.planned_min)||0)*60000;
  client.activeMs+=Number(row.active_ms)||0;
 }
 const clients=[...byClient.values()].map(client=>({
  id:client.id,
  name:client.name,
  orders:client.workOrders.size,
  openOrders:[...client.workOrders.values()].filter(status=>status==='open').length,
  planHours:client.plannedMs/3600000,
  actualHours:client.activeMs/3600000,
  effortPct:client.plannedMs?client.activeMs/client.plannedMs*100:0
 })).sort((a,b)=>b.openOrders-a.openOrders||b.effortPct-a.effortPct||a.name.localeCompare(b.name));

 return <Shell u={u}>
  <header className="client-health-head"><div><p className="dash-eyebrow">Portfolio / Clients</p><h1>Client quadrants</h1><p className="mut">Open workload against active effort versus task budgets.</p></div><Link className="btn" href="/clients">Client directory</Link></header>
  <ClientQuadrants clients={clients} days={days}/>
 </Shell>
}