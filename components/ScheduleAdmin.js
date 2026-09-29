'use client';
import {useState} from 'react';import {useRouter} from 'next/navigation';import Link from 'next/link';
const FREQ=[['weekly','Weekly'],['fortnightly','Every 2 weeks'],['monthly','Monthly'],['quarterly','Quarterly'],['biannual','Every 6 months'],['yearly','Yearly']];
export default function ScheduleAdmin({items,clients,templates,sups}){
 const r=useRouter(),[f,setF]=useState({frequency:'monthly',priority:'Normal',next_run:new Date().toISOString().slice(0,10)}),[err,setErr]=useState(''),[msg,setMsg]=useState('');
 const s=k=>e=>setF({...f,[k]:e.target.value});
 const call=async b=>{setErr('');setMsg('');const x=await fetch('/api/schedules',{method:'POST',body:JSON.stringify(b)}),j=await x.json();if(!x.ok){setErr(j.error);return null}r.refresh();return j};
 const groups={};templates.forEach(t=>(groups[t.service||'Other']=groups[t.service||'Other']||[]).push(t));
 return <>
  <div className="card wz"><b>New schedule</b><p className="mut" style={{margin:'4px 0 10px'}}>A work order is created automatically on each due date, using the chosen workflow, and the first task goes to that team.</p>
   <div className="f"><label>Name</label><input value={f.name||''} onChange={s('name')} placeholder="e.g. ABC Ltd quarterly CCTV service"/></div>
   <div className="f"><label>Service type</label><select value={f.template_id||''} onChange={s('template_id')}><option value="">Choose…</option>{Object.entries(groups).map(([g,ts])=><optgroup key={g} label={g}>{ts.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</optgroup>)}</select></div>
   <div className="f"><label>Client</label><select value={f.client_id||''} onChange={e=>{const c=clients.find(x=>x.id==e.target.value);setF({...f,client_id:c?.id||null,client:c?.name||'',contact:f.contact||(c?[c.contact,c.phone].filter(Boolean).join(' / '):'')})}}><option value="">Choose client…</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
   <div className="f"><label>Site</label><input value={f.site||''} onChange={s('site')}/></div>
   <div className="f"><label>How often</label><select value={f.frequency} onChange={s('frequency')}>{FREQ.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select></div>
   <div className="f"><label>First run date</label><input type="date" value={f.next_run} onChange={s('next_run')}/></div>
   <div className="f"><label>Supervisor (optional)</label><select value={f.supervisor_id||''} onChange={s('supervisor_id')}><option value="">None</option>{sups.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
   <div className="f"><label>Requirement / notes</label><textarea rows={2} value={f.requirement||''} onChange={s('requirement')}/></div>
   {err&&<p className="err">{err}</p>}<button className="btn p" onClick={async()=>{if(await call({action:'create',...f}))setF({...f,name:'',requirement:''})}}>Create schedule</button></div>
  <div className="row" style={{margin:'8px 0'}}><h3 style={{margin:0}}>Active schedules</h3><span className="grow"/><button className="btn" onClick={async()=>{const j=await call({action:'run_due'});if(j)setMsg(j.ids.length?`Created ${j.ids.length} work order(s).`:'Nothing is due.')}}>Run everything due now</button></div>{msg&&<p>{msg}</p>}
  <table className="list"><thead><tr><th>Schedule</th><th>Client</th><th>Frequency</th><th>Next run</th><th>Last generated</th><th/></tr></thead><tbody>
  {items.map(x=><tr key={x.id} style={{opacity:x.active?1:.55}}><td>{x.name}<br/><span className="mut">{x.tpl}</span></td><td>{x.client}<br/><span className="mut">{x.site}</span></td><td>{FREQ.find(([k])=>k===x.frequency)?.[1]}</td><td>{x.nr}</td><td>{x.last_wo?<Link href={'/workorders/'+x.last_wo}>{x.last_num}</Link>:'—'}</td>
   <td style={{whiteSpace:'nowrap'}}><button className="link" onClick={async()=>{const j=await call({action:'run_now',id:x.id});if(j)location.href='/workorders/'+j.id}}>Run now</button> · <button className="link" onClick={()=>call({action:'toggle',id:x.id})}>{x.active?'Pause':'Resume'}</button> · <button className="link" onClick={()=>confirm('Delete this schedule?')&&call({action:'delete',id:x.id})}>Delete</button></td></tr>)}
  {!items.length&&<tr><td colSpan={6} className="mut">No schedules yet.</td></tr>}</tbody></table></>}
