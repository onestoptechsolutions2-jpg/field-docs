'use client';
import {useState} from 'react';import {useRouter} from 'next/navigation';
export default function UserAdmin({users,teams,me}){const r=useRouter(),[err,setErr]=useState('');
 const call=async(id,body)=>{setErr('');const x=await fetch('/api/users/'+id,{method:'POST',body:JSON.stringify(body)}),j=await x.json().catch(()=>({}));
  if(!x.ok){setErr(j.error||'Failed');return false}r.refresh();return true};
 return <div className="card">{err&&<p className="err">{err}</p>}<table className="list"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Team</th><th>Status</th><th></th></tr></thead><tbody>
  {users.map(x=><Row key={x.id} x={x} teams={teams} me={me} call={call}/>)}</tbody></table></div>}
function Row({x,teams,me,call}){const [ed,setEd]=useState(false),[f,setF]=useState({name:x.name,role:x.role,team:x.team});
 const mine=x.id===me.id;
 if(ed)return <tr><td><input value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></td><td>{x.email}</td>
  <td><select value={f.role} onChange={e=>setF({...f,role:e.target.value})}><option value="tech">Technician</option><option value="supervisor">Supervisor</option><option value="admin">Admin</option></select></td>
  <td><select value={f.team} onChange={e=>setF({...f,team:e.target.value})}>{teams.map(t=><option key={t}>{t}</option>)}</select></td>
  <td>{x.active?'Active':'Inactive'}</td>
  <td className="row"><button className="btn p" onClick={async()=>{if(await call(x.id,f))setEd(false)}}>Save</button><button className="link" onClick={()=>setEd(false)}>Cancel</button></td></tr>;
 return <tr><td>{x.name}</td><td>{x.email}</td><td>{x.role}</td><td>{x.team}</td><td>{x.active?'Active':<span className="err">Inactive</span>}</td>
  <td className="row" style={{flexWrap:'wrap'}}>
   <button className="link" onClick={()=>setEd(true)}>Edit</button>
   <button className="link" onClick={()=>{const p=prompt('New password for '+x.name+' (6+ characters)');p&&call(x.id,{action:'reset',password:p})}}>Reset password</button>
   {!mine&&<button className="link" onClick={()=>call(x.id,{action:'active',active:!x.active})}>{x.active?'Deactivate':'Activate'}</button>}
   {!mine&&<button className="link" onClick={()=>{if(confirm('Delete '+x.name+'? This only works if they have no history.'))call(x.id,{action:'delete'})}}>Delete</button>}
  </td></tr>}
