'use client';
import {useState} from 'react';
export default function Login(){const [e,setE]=useState(''),[p,setP]=useState(''),[code,setCode]=useState(''),[need2fa,setNeed2fa]=useState(false),[err,setErr]=useState('');
 const go=async ev=>{ev.preventDefault();setErr('');const r=await fetch('/api/login',{method:'POST',body:JSON.stringify({email:e,password:p})});const j=await r.json().catch(()=>({}));
  if(!r.ok)return setErr(j.error||'Failed');if(j.need2fa)return setNeed2fa(true);location.href='/'};
 const verify=async ev=>{ev.preventDefault();setErr('');const r=await fetch('/api/login/2fa',{method:'POST',body:JSON.stringify({code})});const j=await r.json().catch(()=>({}));
  r.ok?location.href='/':setErr(j.error||'Failed')};
 if(need2fa)return <div className="wrap" style={{maxWidth:380,paddingTop:60}}><form className="card" onSubmit={verify}><h2 style={{marginTop:0}}>Verification code</h2>
  <p className="mut">Enter the 6-digit code from your authenticator app.</p><p><input placeholder="123456" inputMode="numeric" autoFocus value={code} onChange={x=>setCode(x.target.value)}/></p>
  {err&&<p className="err">{err}</p>}<button className="btn p" style={{width:'100%'}}>Verify</button></form></div>;
 return <div className="wrap" style={{maxWidth:380,paddingTop:60}}><form className="card" onSubmit={go}><h2 style={{marginTop:0}}>Field Docs</h2>
  <p><input placeholder="Email" type="email" value={e} onChange={x=>setE(x.target.value)}/></p><p><input placeholder="Password" type="password" value={p} onChange={x=>setP(x.target.value)}/></p>
  {err&&<p className="err">{err}</p>}<button className="btn p" style={{width:'100%'}}>Log in</button><p style={{textAlign:'center'}}><a href="/forgot">Forgot password?</a></p></form></div>}
