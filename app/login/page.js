'use client';
import {useState} from 'react';
export default function Login(){const [e,setE]=useState(''),[p,setP]=useState(''),[err,setErr]=useState('');
 const go=async ev=>{ev.preventDefault();const r=await fetch('/api/login',{method:'POST',body:JSON.stringify({email:e,password:p})});r.ok?location.href='/':setErr((await r.json()).error)};
 return <div className="wrap" style={{maxWidth:380,paddingTop:60}}><form className="card" onSubmit={go}><h2 style={{marginTop:0}}>Field Docs</h2>
  <p><input placeholder="Email" type="email" value={e} onChange={x=>setE(x.target.value)}/></p><p><input placeholder="Password" type="password" value={p} onChange={x=>setP(x.target.value)}/></p>
  {err&&<p className="err">{err}</p>}<button className="btn p" style={{width:'100%'}}>Log in</button></form></div>}
