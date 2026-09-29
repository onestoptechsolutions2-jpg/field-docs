'use client';
import {useState} from 'react';
export const REASONS=['Client not satisfied','Needs a specialist / senior engineer','Parts or equipment missing','Follow-up visit required','Access / permission issue','Other'];
const L={sr:'site report',ho:'handover',wt:'work ticket'};
export function Share({doc,setStatus,setMsg}){
 const [email,setEmail]=useState(doc.client_email||''),[ph,setPh]=useState(doc.client_phone||'');
 const send=async ch=>{const r=await fetch(`/api/docs/${doc.id}/send`,{method:'POST',body:JSON.stringify({channel:ch,email,phone:ph})});const j=await r.json();
  if(!r.ok)return setMsg(j.error||'Failed');setStatus(s=>s==='draft'?'sent':s);
  const text=`Hello, please review and sign your ${L[doc.type]} ${doc.num}: ${j.link}`;
  if(ch==='wa')window.open('https://wa.me/'+ph.replace(/\D/g,'')+'?text='+encodeURIComponent(text));
  if(ch==='copy')await navigator.clipboard.writeText(j.link);
  setMsg(ch==='email'?'Email sent ✓':ch==='copy'?'Link copied ✓':'WhatsApp opened ✓')};
 return <><div className="row" style={{margin:'8px 0'}}><input placeholder="Client email" type="email" value={email} onChange={e=>setEmail(e.target.value)}/><input placeholder="WhatsApp no. e.g. 2547…" value={ph} onChange={e=>setPh(e.target.value)}/></div>
  <div className="row"><button className="btn p" onClick={()=>send('email')}>Email link</button><button className="btn" onClick={()=>send('wa')}>WhatsApp</button><button className="btn" onClick={()=>send('copy')}>Copy link</button></div></>}
export function Esc({doc,me,sups,esc,setEsc,wizard,hint}){
 const [open,setOpen]=useState(false),[to,setTo]=useState(sups[0]?.id||''),[reason,setReason]=useState(''),[note,setNote]=useState(''),[resp,setResp]=useState(esc.response||''),[err,setErr]=useState('');
 const go=async()=>{setErr('');const r=await fetch(`/api/docs/${doc.id}/escalate`,{method:'POST',body:JSON.stringify({to,reason,note})});const j=await r.json();if(!r.ok)return setErr(j.error);setEsc({status:'open',reason,note,toName:j.toName})};
 const act=async action=>{const r=await fetch(`/api/docs/${doc.id}/escalate`,{method:'PATCH',body:JSON.stringify({action,response:resp})});const j=await r.json();if(r.ok)setEsc({...esc,status:j.status,response:resp})};
 if(esc.status)return <div className="card esc"><b>⚑ Escalated to {esc.toName}</b> <span className={'badge esc-'+esc.status}>{esc.status}</span>
  <p><b>{esc.reason}</b>{esc.note&&<><br/>{esc.note}</>}</p>{esc.response&&<p><b>Supervisor:</b> {esc.response}</p>}
  {!wizard&&me.role!=='tech'&&esc.status!=='resolved'&&<><textarea placeholder="Your response / instructions" rows={2} style={{border:'1px solid var(--line)',borderRadius:8,padding:8}} value={resp} onChange={e=>setResp(e.target.value)}/><div className="row" style={{marginTop:8}}><button className="btn" onClick={()=>act('ack')}>Acknowledge</button><button className="btn p" onClick={()=>act('resolve')}>Mark resolved</button></div></>}</div>;
 if(!open)return <div className="card">{hint&&<p style={{marginTop:0}}>{hint}</p>}<button className="btn" onClick={()=>setOpen(true)}>⚑ Escalate to supervisor</button></div>;
 if(!sups.length)return <div className="card err">No supervisor set up yet. Ask the admin to add one under Team.</div>;
 return <div className="card"><p style={{marginTop:0}}><b>Who should look at this?</b></p><select value={to} onChange={e=>setTo(e.target.value)}>{sups.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
  <p><b>Why?</b></p><div className="chipsr">{REASONS.map(x=><button type="button" key={x} className={'chipb'+(reason===x?' on':'')} onClick={()=>setReason(x)}>{x}</button>)}</div>
  <p><b>Details for the supervisor</b></p><textarea rows={3} value={note} onChange={e=>setNote(e.target.value)}/>{err&&<p className="err">{err}</p>}
  <p><button className="btn p" onClick={go}>Send escalation</button> <button className="link" onClick={()=>setOpen(false)}>Cancel</button></p></div>}
