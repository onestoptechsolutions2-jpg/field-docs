import Link from 'next/link';
import {dur} from '@/lib/time';

export default function DashboardContent({metrics,extraFilters,done,buckets,mine,mySubs,sv,maxWait,preview=false}){
 const route=href=>preview?'#':href;
 return <main className="dashboard">
  <header className="dashboard-head">
   <div><p className="dash-eyebrow">Field operations / Overview</p><h1>Control tower</h1><p className="dash-intro">A clear view of today's work, delays, and ownership.</p></div>
   <div className="dash-actions"><span className="dash-stamp"><i aria-hidden="true"/>Operations desk</span><Link className="dash-create" href={route('/workorders/new')}><span aria-hidden="true">+</span> New work order</Link></div>
  </header>

  <section className="dash-metrics" aria-label="Work order summary">
   {metrics.map(([key,item])=><Link className={'dash-metric '+key} href={route('/workorders?f='+key)} key={key}>
    <span className="metric-label">{item.label}</span><strong>{item.count}</strong><span className="metric-link">View queue <span aria-hidden="true">&rarr;</span></span>
   </Link>)}
  </section>

  <nav className="dash-filters" aria-label="Other work order filters">
   <span className="dash-filter-label">More queues</span>
   {extraFilters.map(([key,label,count])=><Link href={route('/workorders?f='+key)} key={key}><span>{label}</span><b>{count}</b></Link>)}
   <Link href={route('/workorders?st=completed')}><span>Completed</span><b>{done.completed||0}</b></Link>
   <Link href={route('/workorders?st=closed')}><span>Closed</span><b>{done.closed||0}</b></Link>
  </nav>

  <div className="dash-grid">
   <section className="dash-section wait-section">
    <header className="dash-section-head"><div><p className="dash-eyebrow">Queue pressure</p><h2>Where work is waiting</h2></div><span className="dash-section-count">{buckets.length} stages</span></header>
    {buckets.length>0?<div className="wait-list">{buckets.map(([bucket,value],index)=><Link className="wait-row" href={route('/workorders?b='+encodeURIComponent(bucket))} key={bucket}>
     <span className="wait-rank">{String(index+1).padStart(2,'0')}</span>
     <span className="wait-info"><span className="wait-name">{bucket}</span><span className="wait-track"><i style={{width:`${Math.max(4,value.ms/maxWait*100)}%`}}/></span></span>
     <span className="wait-jobs"><b>{value.n}</b><small>jobs</small></span><span className="wait-duration">{dur(value.ms)}</span>
    </Link>)}</div>:<p className="dash-empty">No open work orders are waiting on another owner.</p>}
   </section>

   <section className="dash-section task-section">
    <header className="dash-section-head"><div><p className="dash-eyebrow">Assigned to you</p><h2>My work</h2></div><span className="dash-section-count">{mine.length+mySubs.length} tasks</span></header>
    <div className="dash-table-wrap"><table className="dash-table"><thead><tr><th>Work order</th><th>Task</th><th>Status</th><th>Due</th></tr></thead><tbody>
     {mine.map(task=><tr key={'t'+task.id}><td><Link href={route('/workorders/'+task.wo_id)}>{task.num}</Link><span className="dash-client">{task.client}</span></td><td>{task.title}</td><td><span className={'badge '+task.status}>{task.status.replace('_',' ')}</span></td><td className="dash-due">{task.due_at?new Date(task.due_at).toLocaleString():'-'}</td></tr>)}
     {mySubs.map(task=><tr key={'s'+task.id}><td><Link href={route('/workorders/'+task.wo_id)}>{task.num}</Link><span className="dash-client">{task.client}</span></td><td>{task.title}<span className="dash-client">Subtask / {task.task}</span></td><td><span className={'badge '+(task.status==='in_progress'?'in_progress':'blocked')}>{task.status==='todo'?'to do':'in progress'}</span></td><td className="dash-due">-</td></tr>)}
     {!mine.length&&!mySubs.length&&<tr><td colSpan={4} className="dash-empty">Nothing waiting on you or your team.</td></tr>}
    </tbody></table></div>
   </section>
  </div>

  {sv.length>0&&<section className="dash-section supervise-section">
   <header className="dash-section-head"><div><p className="dash-eyebrow">Team oversight</p><h2>Supervising</h2></div><span className="dash-section-count">{sv.length} tasks</span></header>
   <div className="dash-table-wrap"><table className="dash-table"><thead><tr><th>Work order</th><th>Task</th><th>Owner</th><th>Status</th><th>Due</th></tr></thead><tbody>{sv.map(task=><tr key={task.id}><td><Link href={route('/workorders/'+task.wo_id)}>{task.num}</Link><span className="dash-client">{task.client}</span></td><td>{task.title}</td><td>{task.assignee_name||task.team}</td><td><span className={'badge '+task.status}>{task.status.replace('_',' ')}</span></td><td className="dash-due">{task.due_at?new Date(task.due_at).toLocaleString():'-'}</td></tr>)}</tbody></table></div>
  </section>}
 </main>
}