'use client';
import {useState} from 'react';import {useRouter} from 'next/navigation';
export default function ClientAdmin({clients}){const r=useRouter(),[err,setErr]=useState('');
 const call=async(id,body)=>{setErr('');const x=await fetch('/api/clients/'+id,{method:'POST',body:JSON.stringify(body)}),j=await x.json().catch(()=>({}));
  if(!x.ok){setErr(j.error||'Failed');return false}r.refresh();return true};
 return <div className="card">{err&&<p className="err">{err}</p>}<table className="list"><thead><tr><th>Name</th><th>Contact</th><th>Email</th><th>Phone</th><th></th></tr></thead><tbody>
  {clients.map(c=><Row key={c.id} c={c} call={call}/>)}{!clients.length&&<tr><td colSpan={5} className="mut">No clients yet.</td></tr>}</tbody></table></div>}
function Row({c,call}){const [ed,setEd]=useState(false),[f,setF]=useState({name:c.name,contact:c.contact||'',email:c.email||'',phone:c.phone||''});
 if(ed)return <tr><td><input value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></td><td><input value={f.contact} onChange={e=>setF({...f,contact:e.target.value})}/></td>
  <td><input value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></td><td><input value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/></td>
  <td className="row"><button className="btn p" onClick={async()=>{if(await call(c.id,f))setEd(false)}}>Save</button><button className="link" onClick={()=>setEd(false)}>Cancel</button></td></tr>;
 return <tr><td>{c.name}</td><td>{c.contact||'—'}</td><td>{c.email||'—'}</td><td>{c.phone||'—'}</td>
  <td className="row"><button className="link" onClick={()=>setEd(true)}>Edit</button>
   <button className="link" onClick={()=>{if(confirm('Delete '+c.name+'? Existing work orders keep their own copy of the client name.'))call(c.id,{action:'delete'})}}>Delete</button></td></tr>}
