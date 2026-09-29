'use client';
import {useState} from 'react';
export default function SettingsForm({c}){const [s,setS]=useState(c.s),[e,setE]=useState(c.e),[days,setD]=useState(c.days),[hol,setH]=useState((c.hol||[]).join('\n')),[m,setM]=useState('');
 const save=async()=>{const x=await fetch('/api/settings',{method:'POST',body:JSON.stringify({s,e,days,hol})}),j=await x.json();setM(x.ok?'Saved ✓':j.error)};
 return <div className="card"><p className="mut" style={{marginTop:0}}>Planned durations and deadlines count working hours only. Waiting time is shown as raw elapsed time.</p>
  <div className="row"><label>Start hour <input type="number" min="0" max="23" value={s} onChange={x=>setS(+x.target.value)} style={{width:80}}/></label><label>End hour <input type="number" min="1" max="24" value={e} onChange={x=>setE(+x.target.value)} style={{width:80}}/></label></div>
  <div className="chipsr">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d,i)=><button key={d} className={'chipb'+(days.includes(i)?' on':'')} onClick={()=>setD(days.includes(i)?days.filter(x=>x!==i):[...days,i])}>{d}</button>)}</div>
  <p><b>Holidays</b> (one date per line, YYYY-MM-DD)</p><textarea rows={6} className="mono" style={{border:'1px solid var(--line)',borderRadius:8,padding:8,fieldSizing:'fixed'}} value={hol} onChange={x=>setH(x.target.value)}/>
  {m&&<p className={m==='Saved ✓'?'':'err'}>{m}</p>}<p><button className="btn p" onClick={save}>Save</button></p></div>}
