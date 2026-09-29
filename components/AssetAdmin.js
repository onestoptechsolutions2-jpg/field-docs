'use client';
import Link from 'next/link';import {useState} from 'react';import {useRouter} from 'next/navigation';
export default function AssetAdmin({rows,canEdit}){const r=useRouter(),[err,setErr]=useState('');
 const call=async(id,body)=>{setErr('');const x=await fetch('/api/assets/'+id,{method:'POST',body:JSON.stringify(body)}),j=await x.json().catch(()=>({}));
  if(!x.ok){setErr(j.error||'Failed');return false}r.refresh();return true};
 return <>{err&&<p className="err">{err}</p>}<table className="list"><thead><tr><th>Asset</th><th>Client</th><th>Serial / model</th><th>Service history</th>{canEdit&&<th></th>}</tr></thead><tbody>
  {rows.map(a=><Row key={a.id} a={a} call={call} canEdit={canEdit}/>)}
  {!rows.length&&<tr><td colSpan={canEdit?5:4} className="mut">No assets yet. Link them from a work order.</td></tr>}</tbody></table></>}
function Row({a,call,canEdit}){const [ed,setEd]=useState(false),[f,setF]=useState({name:a.name,serial:a.serial||'',model:a.model||'',site:a.site||''});
 if(ed)return <tr><td><input value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></td><td>{a.client}<br/><input placeholder="Site" value={f.site} onChange={e=>setF({...f,site:e.target.value})}/></td>
  <td><input placeholder="Serial" value={f.serial} onChange={e=>setF({...f,serial:e.target.value})}/><input placeholder="Model" value={f.model} onChange={e=>setF({...f,model:e.target.value})}/></td>
  <td>{a.wos.map(w=><div key={w.id}><Link href={'/workorders/'+w.id}>{w.num}</Link></div>)}</td>
  <td className="row"><button className="btn p" onClick={async()=>{if(await call(a.id,f))setEd(false)}}>Save</button><button className="link" onClick={()=>setEd(false)}>Cancel</button></td></tr>;
 return <tr><td>{a.name}</td><td>{a.client}<br/><span className="mut">{a.site}</span></td><td>{a.serial||'—'}<br/><span className="mut">{a.model}</span></td>
  <td>{a.wos.map(w=><div key={w.id}><Link href={'/workorders/'+w.id}>{w.num}</Link> <span className="mut">{w.service} · {w.status}</span></div>)}</td>
  {canEdit&&<td className="row"><button className="link" onClick={()=>setEd(true)}>Edit</button><button className="link" onClick={()=>{if(confirm('Delete '+a.name+'?'))call(a.id,{action:'delete'})}}>Delete</button></td>}</tr>}
