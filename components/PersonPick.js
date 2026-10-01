'use client';
import {useState} from 'react';
export default function PersonPick({users,value,onChange,team,newRole='tech',canAdd=true,placeholder='Choose…',width,extraOption}){
 const [list,setList]=useState(users),[add,setAdd]=useState(false),[n,setN]=useState({name:'',email:''}),[err,setErr]=useState(''),[temp,setTemp]=useState('');
 const save=async()=>{setErr('');if(!n.name.trim()||!n.email.trim())return setErr('Name and email are required');
  const r=await fetch('/api/users',{method:'POST',body:JSON.stringify({name:n.name.trim(),email:n.email.trim(),role:newRole,team})}),j=await r.json();
  if(!r.ok)return setErr(j.error);
  setList(l=>[...l,{id:j.id,name:n.name.trim(),team}].sort((a,b)=>a.name.localeCompare(b.name)));
  onChange(String(j.id));setAdd(false);setN({name:'',email:''});
  if(j.tempPassword)setTemp(`${n.email.trim()} / ${j.tempPassword}`)};
 return <span>
  <select value={add?'new':value||''} style={width?{width}:undefined} onChange={e=>{const v=e.target.value;if(v==='new'){setAdd(true);setErr('');setTemp('')}else{setAdd(false);onChange(v)}}}>
   <option value="">{placeholder}</option>{extraOption&&<option value={extraOption.value}>{extraOption.label}</option>}{list.map(x=><option key={x.id} value={x.id}>{x.name}{x.team?' · '+x.team:''}</option>)}
   {canAdd&&<option value="new">➕ Add new person…</option>}</select>
  {add&&<span className="entry" style={{display:'block',marginTop:8}}>
   <span className="row"><input placeholder="Name" value={n.name} onChange={e=>setN({...n,name:e.target.value})}/><input placeholder="Email" type="email" value={n.email} onChange={e=>setN({...n,email:e.target.value})}/></span>
   {newRole==='supervisor'&&<p className="mut" style={{margin:'4px 0'}}>Added as a supervisor so they can be picked here.</p>}
   {err&&<p className="err">{err}</p>}
   <span className="row"><button type="button" className="btn p" onClick={save}>Add</button><button type="button" className="link" onClick={()=>setAdd(false)}>Cancel</button></span></span>}
  {temp&&<p className="mut">Added ✓ Login for them: <b>{temp}</b> — they can set their own password after logging in.</p>}
 </span>}
