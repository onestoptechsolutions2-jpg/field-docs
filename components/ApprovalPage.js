'use client';
import {useState} from 'react';import Sig from './Sig';
export default function ApprovalPage({token,a,wo,files}){
 const [d,setD]=useState(''),[name,setName]=useState(''),[cm,setCm]=useState(''),[sig,setSig]=useState(null),[err,setErr]=useState(''),[busy,setBusy]=useState(false),[done,setDone]=useState(a.status!=='pending'?a.status:'');
 const go=async()=>{setErr('');setBusy(true);const x=await fetch('/api/approvals/'+token,{method:'POST',body:JSON.stringify({decision:d,name,comment:cm,sig})}),j=await x.json();setBusy(false);x.ok?setDone(d):setErr(j.error||'Failed')};
 const msg={approved:'✓ Approved. Thank you, we will proceed.',changes:'✓ Thank you. We have your requested changes and will get back to you.',declined:'Your response has been recorded.'};
 return <div className="wrap" style={{maxWidth:640}}>
  <div className="logo" style={{margin:'10px 0'}}><b style={{fontSize:28}}>nan<i>●</i>soft</b><small>NANOSOFT TECHNOLOGIES LIMITED</small></div>
  <div className="card"><div className="mut">{wo.num} · {wo.client}{wo.site&&' · '+wo.site}</div><h2 style={{margin:'6px 0'}}>{a.title}</h2>
   {wo.requirement&&<p className="mut">Requirement: {wo.requirement}</p>}{a.message&&<p style={{whiteSpace:'pre-wrap'}}>{a.message}</p>}
   {files.length>0&&<div><b>Documents to review</b>{files.map(f=><div key={f.id}><a href={`/api/approvals/${token}/file/${f.id}`} target="_blank">📎 {f.name}</a> <span className="mut">{Math.round(f.size/1024)} KB</span></div>)}</div>}</div>
  {done?<div className="ok">{msg[done]}{a.client_name&&<div className="mut" style={{fontWeight:400}}>{a.client_name}{a.comment&&' — “'+a.comment+'”'}</div>}</div>:
  <div className="card wz"><b>Your response</b>
   <div className="chipsr" style={{margin:'10px 0'}}>{[['approved','✓ Approve'],['changes','✎ Request changes'],['declined','✕ Decline']].map(([k,l])=><button key={k} className={'chipb'+(d===k?' on':'')} onClick={()=>setD(k)}>{l}</button>)}</div>
   {d&&<><div className="f"><label>Your full name</label><input value={name} onChange={e=>setName(e.target.value)}/></div>
    <div className="f"><label>{d==='approved'?'Comment (optional)':'What needs to change?'}</label><textarea rows={3} value={cm} onChange={e=>setCm(e.target.value)}/></div>
    {d==='approved'&&<div className="f"><label>Sign to approve</label><Sig onChange={setSig}/></div>}
    {err&&<p className="err">{err}</p>}<button className="btn p" disabled={busy} onClick={go}>{busy?'Sending…':'Submit response'}</button></>}</div>}</div>}
