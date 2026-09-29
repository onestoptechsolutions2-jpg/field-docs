'use client';
import {useState} from 'react';import {useRouter} from 'next/navigation';
export default function ProductAdmin({items}){
 const r=useRouter(),[n,setN]=useState(''),[err,setErr]=useState('');
 const call=async(method,body)=>{setErr('');const x=await fetch('/api/products',{method,body:JSON.stringify(body)});if(!x.ok)setErr((await x.json()).error||'Failed');else r.refresh();return x.ok};
 return <>
  <div className="card"><b>Add system / product</b><div className="row" style={{margin:'8px 0'}}><input placeholder="e.g. Nano Safeview (security)" value={n} onChange={e=>setN(e.target.value)}/><button className="btn p" onClick={async()=>{if(await call('POST',{name:n}))setN('')}}>Add</button></div>{err&&<p className="err">{err}</p>}</div>
  <table className="list"><thead><tr><th>Name (click to rename)</th><th>Used on</th><th>In wizard list</th><th/></tr></thead><tbody>{items.map(p=><tr key={p.id}>
   <td><input defaultValue={p.name} onBlur={e=>{const v=e.target.value.trim();v&&v!==p.name&&call('PATCH',{id:p.id,name:v})}}/></td>
   <td className="mut">{p.uses} docs</td>
   <td><button className="btn" onClick={()=>call('PATCH',{id:p.id,active:!p.active})}>{p.active?'Shown ✓':'Hidden'}</button></td>
   <td><button className="link" onClick={()=>confirm('Delete '+p.name+'? Existing documents keep their text.')&&call('DELETE',{id:p.id})}>Delete</button></td></tr>)}</tbody></table>
  <p className="mut">Hide a product to remove it from the wizard without losing history. Renaming does not change documents already created.</p></>}
