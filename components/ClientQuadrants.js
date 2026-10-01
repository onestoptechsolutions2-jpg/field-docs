'use client';
import {useEffect} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';

const WINDOWS=[30,90,180,365];
const median=values=>{const sorted=[...values].sort((a,b)=>a-b),mid=Math.floor(sorted.length/2);return sorted.length?sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2:0};
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const hours=value=>Number(value||0).toFixed(1);

export default function ClientQuadrants({clients,days}){
 const router=useRouter();
 useEffect(()=>{const timer=setInterval(()=>router.refresh(),60000);return()=>clearInterval(timer)},[router]);
 const workloadCut=Math.max(1,median(clients.map(client=>client.openOrders)));
 const maxWorkload=Math.max(1,...clients.map(client=>client.openOrders));
 const maxEffort=Math.max(150,Math.ceil(Math.max(0,...clients.map(client=>client.effortPct))/50)*50);
 const overBudgetLine=100/maxEffort*100;

 return <section className="client-health">
  <div className="client-health-toolbar">
   <div><span className="mut">Created in</span><nav className="client-window" aria-label="Reporting period">{WINDOWS.map(window=><Link className={days===window?'on':''} href={'/clients/quadrants?days='+window} key={window}>{window} days</Link>)}</nav></div>
   <div className="client-health-legend"><span><i className="legend-dot steady"/>Within budget</span><span><i className="legend-dot overtime"/>Over budget</span></div>
  </div>

  <div className="quadrant-layout">
   <div className="quadrant-y-label">Active effort / task budget</div>
   <div className="quadrant-chart">
    <div className="quadrant-axis-labels"><span>{maxEffort}%</span><span>100%</span><span>0%</span></div>
    <div className={'quadrant-plot'+(clients.length>12?' dense':'')} role="group" aria-label={`Client workload and active effort for the last ${days} days`}>
     <div className="quadrant-cell-label top-left">Low workload<br/>Over budget</div>
     <div className="quadrant-cell-label top-right">High workload<br/>Over budget</div>
     <div className="quadrant-cell-label bottom-left">Steady</div>
     <div className="quadrant-cell-label bottom-right">Busy, within budget</div>
     <i className="quadrant-vline" style={{left:`${workloadCut/maxWorkload*100}%`}}/>
     <i className="quadrant-hline" style={{bottom:`${overBudgetLine}%`}}/>
     {clients.map(client=>{
      const highWorkload=client.openOrders>=workloadCut,overBudget=client.effortPct>100;
      const x=clamp(client.openOrders/maxWorkload*100,3,97),y=clamp(client.effortPct/maxEffort*100,4,96);
      const tone=overBudget?'overtime':highWorkload?'busy':'steady';
      return <Link className={'quadrant-dot '+tone} href={'/workorders?st=open&q='+encodeURIComponent(client.name)} key={client.id} style={{left:`${x}%`,bottom:`${y}%`}} aria-label={`${client.name}: ${client.openOrders} open work orders, ${Math.round(client.effortPct)} percent of task budget`}>
       <span className="quadrant-dot-label"><b>{client.name}</b><small>{client.openOrders} open · {Math.round(client.effortPct)}% budget</small></span>
      </Link>
     })}
    </div>
    <div className="quadrant-x-label"><span>Fewer open work orders</span><span>More open work orders</span></div>
   </div>
  </div>
  <p className="client-health-note">Active task time is compared with the sum of planned task minutes. Waiting time is excluded. Client points refresh every minute; select a point to open its work-order queue.</p>

  <div className="client-health-list">
   <div className="client-health-list-head"><h2>Client exposure</h2><span>{clients.length} clients · {days} days</span></div>
   {clients.length?<div className="client-health-table-wrap"><table className="client-health-table"><thead><tr><th>Client</th><th>Open</th><th>Active</th><th>Planned</th><th>Effort</th><th>Budget variance</th></tr></thead><tbody>
    {clients.map(client=>{const variance=client.actualHours-client.planHours;return <tr key={client.id}>
     <td><Link href={'/workorders?q='+encodeURIComponent(client.name)}>{client.name}</Link></td>
     <td>{client.openOrders}</td><td>{hours(client.actualHours)}h</td><td>{hours(client.planHours)}h</td>
     <td><span className={'badge '+(client.effortPct>100?'over':client.openOrders>=workloadCut?'risk':'done')}>{Math.round(client.effortPct)}%</span></td>
     <td className={variance>0?'client-overrun':''}>{variance>0?'+':''}{hours(variance)}h</td>
    </tr>})}
   </tbody></table></div>:<p className="dash-empty">No linked-client work orders were created in this period.</p>}
  </div>
 </section>
}