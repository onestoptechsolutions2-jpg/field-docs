'use client';
import {useState} from 'react';import {useRouter} from 'next/navigation';
const STEPS=[{t:'What kind of job?',h:'Pick the service type — this decides the task list.'},{t:'For which client?',h:'Pick an existing client or add a new one.'},{t:'Details',h:'Fill in what you know — everything here is optional except priority.'}];
export default function NewWO({clients:c0,templates,sups=[]}){
 const r=useRouter(),[cl,setCl]=useState(c0),[f,setF]=useState({priority:'Normal',requested:new Date().toISOString().slice(0,10)}),[add,setAdd]=useState(false),[n,setN]=useState({name:'',contact:'',phone:'',email:''}),[err,setErr]=useState(''),[busy,setBusy]=useState(false),[step,setStep]=useState(0);
 const s=k=>e=>setF({...f,[k]:e.target.value}),pick=c=>setF({...f,client_id:c?c.id:null,client:c?c.name:'',contact:f.contact||(c?[c.contact,c.phone].filter(Boolean).join(' / '):'')});
 const save=async()=>{setErr('');const x=await fetch('/api/clients',{method:'POST',body:JSON.stringify(n)}),j=await x.json();if(!x.ok)return setErr(j.error);setCl(l=>l.some(y=>y.id===j.id)?l:[...l,j].sort((a,b)=>a.name.localeCompare(b.name)));pick(j);setAdd(false);setN({name:'',contact:'',phone:'',email:''})};
 const go=async()=>{setBusy(true);setErr('');const x=await fetch('/api/wo',{method:'POST',body:JSON.stringify(f)}),j=await x.json();setBusy(false);if(!x.ok)return setErr(j.error);r.push('/workorders/'+j.id)};
 const groups={};templates.forEach(t=>(groups[t.service||'Other']=groups[t.service||'Other']||[]).push(t));
 const i=(k,l,t)=><div className="f" key={k}><label>{l}</label><input type={t||'text'} value={n[k]} onChange={e=>setN({...n,[k]:e.target.value})}/></div>;
 const ok=[!!f.template_id,!!f.client,true][step],last=step===STEPS.length-1,S=STEPS[step];
 return <div className="wz"><div className="prog"><div style={{width:(step+1)/STEPS.length*100+'%'}}/></div>
  <p className="mut" style={{margin:'6px 0 0'}}>Step {step+1} of {STEPS.length}</p><h2>{S.t}</h2><p className="mut" style={{marginTop:0}}>{S.h}</p>
  {step===0&&<div className="card"><div className="f"><label>Service type</label><select value={f.template_id||''} onChange={s('template_id')}><option value="">Choose…</option>{Object.entries(groups).map(([g,ts])=><optgroup key={g} label={g}>{ts.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</optgroup>)}</select></div></div>}
  {step===1&&<div className="card">
   <div className="f"><label>Client</label><select value={add?'new':f.client_id||''} onChange={e=>{const v=e.target.value;if(v==='new')setAdd(true);else{setAdd(false);pick(cl.find(c=>c.id==v))}}}><option value="">Choose client…</option>{cl.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}<option value="new">➕ Add new client…</option></select>
    {add&&<div className="entry" style={{marginTop:8}}><b>New client</b>{i('name','Client name')}{i('contact','Contact person')}{i('phone','Phone / WhatsApp')}{i('email','Email','email')}<div className="row"><button className="btn p" onClick={save}>Save client</button><button className="link" onClick={()=>setAdd(false)}>Cancel</button></div></div>}</div>
   <div className="f"><label>Supervisor (optional)</label><select value={f.supervisor_id||''} onChange={s('supervisor_id')}><option value="">None</option>{sups.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></div></div>}
  {step===2&&<div className="card">
   <div className="f"><label>Site / location</label><input value={f.site||''} onChange={s('site')}/></div>
   <div className="f"><label>Contact person / phone</label><input value={f.contact||''} onChange={s('contact')}/></div>
   <div className="f"><label>Requirement</label><textarea rows={3} value={f.requirement||''} onChange={s('requirement')}/></div>
   <div className="f"><label>Priority</label><select value={f.priority} onChange={s('priority')}>{['Low','Normal','High','Urgent'].map(p=><option key={p}>{p}</option>)}</select></div>
   <div className="f"><label>Requested date</label><input type="date" value={f.requested||''} onChange={s('requested')}/></div>
   <div className="f"><label>External reference (optional)</label><input value={f.ext_ref||''} onChange={s('ext_ref')} placeholder="Quote / LPO / ticket no."/></div></div>}
  {err&&<p className="err">{err}</p>}
  <div className="wznav"><button className="btn" disabled={step===0} onClick={()=>setStep(step-1)}>Back</button>
   {last?<button className="btn p" disabled={busy||!ok} onClick={go}>{busy?'Creating…':'Create work order'}</button>:<button className="btn p" disabled={!ok} onClick={()=>setStep(step+1)}>Next</button>}</div></div>}
