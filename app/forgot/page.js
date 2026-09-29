'use client';
import {useState} from 'react';
export default function Forgot(){const [e,setE]=useState(''),[done,setDone]=useState(false);
 const go=async ev=>{ev.preventDefault();await fetch('/api/forgot',{method:'POST',body:JSON.stringify({email:e})});setDone(true)};
 return <div className="wrap" style={{maxWidth:380,paddingTop:60}}><form className="card" onSubmit={go}><h2 style={{marginTop:0}}>Reset password</h2>
  {done?<p className="ok">If that email exists, a reset link has been sent.</p>:<>
  <p className="mut">Enter your account email and we'll send you a reset link.</p>
  <p><input placeholder="Email" type="email" value={e} onChange={x=>setE(x.target.value)}/></p>
  <button className="btn p" style={{width:'100%'}}>Send reset link</button></>}</form></div>}
