'use client';
import {useState} from 'react';
import Sheet,{ClientBlock} from './Sheet';import Sig from './Sig';
export default function SignPage({doc,token}){
 const [name,setName]=useState(''),[comment,setComment]=useState(''),[sig,setSig]=useState(null),[err,setErr]=useState(''),[done,setDone]=useState(doc.status==='signed'),[busy,setBusy]=useState(false);
 const submit=async()=>{setErr('');if(!name.trim()||!sig)return setErr('Please enter your name and sign.');setBusy(true);
  const r=await fetch('/api/sign/'+token,{method:'POST',body:JSON.stringify({name,comment,sig})});setBusy(false);
  if(r.ok){doc={...doc,client_name:name,client_comment:comment,client_sig:sig,signed_at:new Date().toISOString(),status:'signed'};setDone(true)}else setErr((await r.json()).error||'Failed')};
 return <div className="wrap">
  {done&&<div className="ok noprint" style={{marginBottom:10}}>✓ Signed. Thank you. <button className="btn" style={{marginLeft:8}} onClick={()=>print()}>Print / PDF</button></div>}
  <Sheet type={doc.type} data={doc.data}>{done?<ClientBlock d={{...doc,client_name:name||doc.client_name,client_comment:comment||doc.client_comment,client_sig:sig||doc.client_sig,signed_at:doc.signed_at||new Date()}}/>:
   <div className="noprint"><h3>Your details</h3><div className="f"><label>Full name</label><input value={name} onChange={e=>setName(e.target.value)}/></div>
    <h3>Comment (optional)</h3><textarea rows={3} style={{border:'1px solid var(--line)',borderRadius:8,padding:8}} value={comment} onChange={e=>setComment(e.target.value)}/>
    <h3>Sign below</h3><Sig onChange={setSig}/>{err&&<p className="err">{err}</p>}
    <p><button className="btn p" disabled={busy} onClick={submit}>{busy?'Submitting…':'Sign & submit'}</button></p></div>}</Sheet></div>}
