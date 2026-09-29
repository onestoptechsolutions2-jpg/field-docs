'use client';
import {useState} from 'react';
export default function Reset({params}){const [p,setP]=useState(''),[err,setErr]=useState(''),[done,setDone]=useState(false);
 const go=async ev=>{ev.preventDefault();setErr('');const r=await fetch('/api/reset/'+params.token,{method:'POST',body:JSON.stringify({password:p})}),j=await r.json();
  r.ok?setDone(true):setErr(j.error||'Failed')};
 return <div className="wrap" style={{maxWidth:380,paddingTop:60}}><form className="card" onSubmit={go}><h2 style={{marginTop:0}}>Set a new password</h2>
  {done?<p className="ok">Password updated. <a href="/login">Log in</a></p>:<>
  <p><input placeholder="New password (6+)" type="password" value={p} onChange={x=>setP(x.target.value)}/></p>
  {err&&<p className="err">{err}</p>}<button className="btn p" style={{width:'100%'}}>Save password</button></>}</form></div>}
