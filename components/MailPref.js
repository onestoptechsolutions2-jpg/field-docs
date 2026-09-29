'use client';
import {useState} from 'react';
export default function MailPref({on}){const [v,setV]=useState(on);
 return <button className="link" title="Email copies of your alerts" onClick={async()=>{const n=!v;setV(n);await fetch('/api/prefs',{method:'POST',body:JSON.stringify({email_alerts:n})})}}>✉ Email alerts: {v?'on':'off'}</button>}
