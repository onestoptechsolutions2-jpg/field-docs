'use client';
import {useState} from 'react';
export default function AccountForm({email,totpEnabled}){
 const [cur,setCur]=useState(''),[pw,setPw]=useState(''),[m1,setM1]=useState('');
 const [setup,setSetup]=useState(null),[code,setCode]=useState(''),[on,setOn]=useState(totpEnabled),[dpw,setDpw]=useState(''),[m2,setM2]=useState('');
 const savePw=async()=>{setM1('');const r=await fetch('/api/me/password',{method:'POST',body:JSON.stringify({current:cur,password:pw})}),j=await r.json();
  if(r.ok){setM1('Password changed ✓');setCur('');setPw('')}else setM1(j.error)};
 const begin=async()=>{const r=await fetch('/api/2fa/setup',{method:'POST'}),j=await r.json();if(r.ok)setSetup(j)};
 const enable=async()=>{setM2('');const r=await fetch('/api/2fa/enable',{method:'POST',body:JSON.stringify({code})}),j=await r.json();
  if(r.ok){setOn(true);setSetup(null);setM2('Two-factor enabled ✓')}else setM2(j.error)};
 const disable=async()=>{setM2('');const r=await fetch('/api/2fa/disable',{method:'POST',body:JSON.stringify({password:dpw})}),j=await r.json();
  if(r.ok){setOn(false);setDpw('');setM2('Two-factor disabled')}else setM2(j.error)};
 return <>
  <div className="card"><b>Change password</b><p className="mut" style={{marginTop:0}}>{email}</p>
   <div className="row" style={{margin:'8px 0'}}><input placeholder="Current password" type="password" value={cur} onChange={e=>setCur(e.target.value)}/><input placeholder="New password (6+)" type="password" value={pw} onChange={e=>setPw(e.target.value)}/></div>
   {m1&&<p className={m1.includes('✓')?'':'err'}>{m1}</p>}<button className="btn p" onClick={savePw}>Save</button></div>
  <div className="card"><b>Two-factor authentication</b>
   {on?<><p className="mut">Enabled — a code is required at login.</p>
    <div className="row" style={{margin:'8px 0'}}><input placeholder="Current password" type="password" value={dpw} onChange={e=>setDpw(e.target.value)}/><button className="btn" onClick={disable}>Disable</button></div></>:
   setup?<><p className="mut">Scan or manually enter this key in your authenticator app, then enter the 6-digit code to confirm.</p>
    <p className="mono" style={{wordBreak:'break-all'}}>{setup.secret}</p>
    <div className="row" style={{margin:'8px 0'}}><input placeholder="123456" value={code} onChange={e=>setCode(e.target.value)}/><button className="btn p" onClick={enable}>Confirm & enable</button></div></>:
   <><p className="mut">Not enabled.</p><button className="btn" onClick={begin}>Set up two-factor</button></>}
   {m2&&<p className={m2.includes('✓')||m2==='Two-factor disabled'?'':'err'}>{m2}</p>}</div></>}
