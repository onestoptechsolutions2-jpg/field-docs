'use client';
import {useState} from 'react';
export default function ListsForm({base,extraTeams,baseParties,extraParties}){
 const [teams,setTeams]=useState((extraTeams||[]).join('\n')),[parties,setParties]=useState((extraParties||[]).join('\n')),[m,setM]=useState('');
 const save=async()=>{const x=await fetch('/api/settings/lists',{method:'POST',body:JSON.stringify({teams,parties})}),j=await x.json();setM(x.ok?'Saved ✓':j.error)};
 return <div className="card"><b>Departments &amp; waiting parties</b>
  <p className="mut" style={{marginTop:0}}>Built-in departments ({base.join(', ')}) can't be removed since existing workflows use them. Add extra ones below — one per line.</p>
  <p><b>Extra departments</b></p><textarea rows={4} className="mono" style={{border:'1px solid var(--line)',borderRadius:8,padding:8}} value={teams} onChange={e=>setTeams(e.target.value)}/>
  <p><b>Extra "waiting for" parties</b> (in addition to {baseParties.join(', ')})</p><textarea rows={4} className="mono" style={{border:'1px solid var(--line)',borderRadius:8,padding:8}} value={parties} onChange={e=>setParties(e.target.value)}/>
  {m&&<p className={m==='Saved ✓'?'':'err'}>{m}</p>}<p><button className="btn p" onClick={save}>Save</button></p></div>}
