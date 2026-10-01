'use client';
import {useState} from 'react';import {useRouter} from 'next/navigation';import PersonPick from './PersonPick';
const STEPS=[{t:'What kind of job?',h:'Pick one or more service types — this decides the task list. Combining two (e.g. CCTV + Network) puts both in the same work order.'},{t:'For which client?',h:'Pick an existing client or add a new one.'},{t:'Details',h:'Fill in what you know — everything here is optional except priority.'}];
export default function NewWO({clients:c0,templates,sups=[],me={}}){
 const r=useRouter(),[cl,setCl]=useState(c0),[f,setF]=useState({priority:'Normal',requested:new Date().toISOString().slice(0,10),template_ids:[]}),[add,setAdd]=useState(false),[n,setN]=useState({name:'',contact:'',phone:'',email:''}),[err,setErr]=useState(''),[busy,setBusy]=useState(false),[step,setStep]=useState(0);
 const s=k=>e=>setF({...f,[k]:e.target.value}),pick=c=>setF({...f,client_id:c?c.id:null,client:c?c.name:'',contact:f.contact||(c?[c.contact,c.phone].filter(Boolean).join(' / '):'')});
 const toggleTpl=id=>setF({...f,template_ids:f.template_ids.includes(id)?f.template_ids.filter(x=>x!==id):[...f.template_ids,id]});
 const save=async()=>{setErr('');const x=await fetch('/api/clients',{method:'POST',body:JSON.stringify(n)}),j=await x.json();if(!x.ok)return setErr(j.error);setCl(l=>l.some(y=>y.id===j.id)?l:[...l,j].sort((a,b)=>a.name.localeCompare(b.name)));pick(j);setAdd(false);setN({name:'',contact:'',phone:'',email:''})};
 const go=async()=>{setBusy(true);setErr('');const x=await fetch('/api/wo',{method:'POST',body:JSON.stringify(f)}),j=await x.json();setBusy(false);if(!x.ok)return setErr(j.error);r.push('/workorders/'+j.id)};
 const groups={};templates.forEach(t=>(groups[t.service||'Other']=groups[t.service||'Other']||[]).push(t));
 const i=(k,l,t)=><div className="f" key={k}><label>{l}</label><input type={t||'text'} value={n[k]} onChange={e=>setN({...n,[k]:e.target.value})}/></div>;
 const ok=[f.template_ids.length>0,!!f.client,true][step],last=step===STEPS.length-1,S=STEPS[step];
 return <div className="wz"><div className="prog"><div style={{width:(step+1)/STEPS.length*100+'%'}}/></div>
  <p className="mut" style={{margin:'6px 0 0'}}>Step {step+1} of {STEPS.length}</p><h2>{S.t}</h2><p className="mut" style={{marginTop:0}}>{S.h}</p>
  {step===0&&<div className="card">{Object.entries(groups).map(([g,ts])=><div key={g} style={{marginBottom:10}}><b className="mut" style={{fontSize:12,letterSpacing:1}}>{g.toUpperCase()}</b>
   <div className="chipsr">{ts.map(t=><button type="button" key={t.id} className={'chipb'+(f.template_ids.includes(t.id)?' on':'')} onClick={()=>toggleTpl(t.id)}>{t.name}</button>)}</div></div>)}</div>}
  {step===1&&<div className="card">
   <div className="f"><label>Client</label><select value={add?'new':f.client_id||''} onChange={e=>{const v=e.target.value;if(v==='new')setAdd(true);else{setAdd(false);pick(cl.find(c=>c.id==v))}}}><option value="">Choose client…</option>{cl.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}<option value="new">➕ Add new client…</option></select>
    {add&&<div className="entry" style={{marginTop:8}}><b>New client</b>{i('name','Client name')}{i('contact','Contact person')}{i('phone','Phone / WhatsApp')}{i('email','Email','email')}<div className="row"><button className="btn p" onClick={save}>Save client</button><button className="link" onClick={()=>setAdd(false)}>Cancel</button></div></div>}</div>
   <div className="f"><label>Supervisor (optional)</label><PersonPick users={sups} value={f.supervisor_id} onChange={v=>setF({...f,supervisor_id:v})} newRole="supervisor" canAdd={me.role!=='tech'} placeholder="None"/></div></div>}
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
