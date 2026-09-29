'use client';
import {useState} from 'react';import {useRouter} from 'next/navigation';
export default function NewWO({clients:c0,templates,sups=[]}){
 const r=useRouter(),[cl,setCl]=useState(c0),[f,setF]=useState({priority:'Normal',requested:new Date().toISOString().slice(0,10)}),[add,setAdd]=useState(false),[n,setN]=useState({name:'',contact:'',phone:'',email:''}),[err,setErr]=useState(''),[busy,setBusy]=useState(false);
 const s=k=>e=>setF({...f,[k]:e.target.value}),pick=c=>setF({...f,client_id:c?c.id:null,client:c?c.name:'',contact:f.contact||(c?[c.contact,c.phone].filter(Boolean).join(' / '):'')});
 const save=async()=>{setErr('');const x=await fetch('/api/clients',{method:'POST',body:JSON.stringify(n)}),j=await x.json();if(!x.ok)return setErr(j.error);setCl(l=>l.some(y=>y.id===j.id)?l:[...l,j].sort((a,b)=>a.name.localeCompare(b.name)));pick(j);setAdd(false);setN({name:'',contact:'',phone:'',email:''})};
 const go=async()=>{setBusy(true);setErr('');const x=await fetch('/api/wo',{method:'POST',body:JSON.stringify(f)}),j=await x.json();setBusy(false);if(!x.ok)return setErr(j.error);r.push('/workorders/'+j.id)};
 const groups={};templates.forEach(t=>(groups[t.service||'Other']=groups[t.service||'Other']||[]).push(t));
 const i=(k,l,t)=><div className="f" key={k}><label>{l}</label><input type={t||'text'} value={n[k]} onChange={e=>setN({...n,[k]:e.target.value})}/></div>;
 return <div className="wz"><div className="card">
  <div className="f"><label>Service type</label><select value={f.template_id||''} onChange={s('template_id')}><option value="">Choose…</option>{Object.entries(groups).map(([g,ts])=><optgroup key={g} label={g}>{ts.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</optgroup>)}</select></div>
  <div className="f"><label>Client</label><select value={add?'new':f.client_id||''} onChange={e=>{const v=e.target.value;if(v==='new')setAdd(true);else{setAdd(false);pick(cl.find(c=>c.id==v))}}}><option value="">Choose client…</option>{cl.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}<option value="new">➕ Add new client…</option></select>
   {add&&<div className="entry" style={{marginTop:8}}><b>New client</b>{i('name','Client name')}{i('contact','Contact person')}{i('phone','Phone / WhatsApp')}{i('email','Email','email')}<div className="row"><button className="btn p" onClick={save}>Save client</button><button className="link" onClick={()=>setAdd(false)}>Cancel</button></div></div>}</div>
  <div className="f"><label>Supervisor (optional)</label><select value={f.supervisor_id||''} onChange={s('supervisor_id')}><option value="">None</option>{sups.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
  <div className="f"><label>Site / location</label><input value={f.site||''} onChange={s('site')}/></div>
  <div className="f"><label>Contact person / phone</label><input value={f.contact||''} onChange={s('contact')}/></div>
  <div className="f"><label>Requirement</label><textarea rows={3} value={f.requirement||''} onChange={s('requirement')}/></div>
  <div className="f"><label>Priority</label><select value={f.priority} onChange={s('priority')}>{['Low','Normal','High','Urgent'].map(p=><option key={p}>{p}</option>)}</select></div>
  <div className="f"><label>Requested date</label><input type="date" value={f.requested||''} onChange={s('requested')}/></div>
  <div className="f"><label>External reference (optional)</label><input value={f.ext_ref||''} onChange={s('ext_ref')} placeholder="Quote / LPO / ticket no."/></div>
  {err&&<p className="err">{err}</p>}<button className="btn p" disabled={busy||!f.template_id||!f.client} onClick={go}>{busy?'Creating…':'Create work order'}</button></div></div>}
