'use client';
import Sig from './Sig';
export const JT=['Site Survey','Installation – Hardware','Installation – Software','Maintenance','Training'];
export const PRODUCTS=['Nano Safeview (security)','Nano Access','Nano Shule (school)','Nano Time','Nano Pay (payroll)','Florena (agri)','Network / hardware','Other'];
export const ST=['Done','In progress','Pending','Blocked'],CO=['New','Good','Fair','Faulty'];
export const TITLE={sr:'Site Report',ho:'HANDOVER',wt:'Work Ticket'};
export const FD={jobtype:['Job type','sel',JT],client:['Client name','text'],project:['Project / site','text'],product:['System / product','sel',PRODUCTS],start:['Start date','date'],timein:['Time in','time'],
 job:['Job Ref','text'],date:['Date','date'],by:['Issued by','text'],dept:['Department','text'],rem:['Remarks','area'],
 contact:['Client contact (name / phone)','text'],priority:['Priority','sel',['Low','Medium','High','Critical']],reported:['Date reported','date'],issue:['Issue reported','area'],
 outcome:['Job outcome','sel',['Completed','Follow-up needed','Could not complete']],resolution:['Resolution notes','area']};
export const P={sr:{pre:['jobtype','client','project','product','start','timein'],post:['outcome']},ho:{pre:['job','client','date','by','dept'],post:['rem']},wt:{pre:['client','contact','product','priority','reported','timein','issue'],post:['outcome','resolution']}};
export const C={sr:[['w','Work done','area'],['s','Status',ST]],ho:[['i','Item / description','area'],['s','Serial number'],['m','Model'],['f','Manufacturer'],['k','Condition',CO]],wt:[['w','Work done','area'],['n','Minutes','num'],['s','Status',ST]]};
const now=k=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return k==='time'?p(d.getHours())+':'+p(d.getMinutes()):d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())};
export const Fld=({k,v,on})=>{const [l,kind,o]=FD[k];const c=e=>on(e.target.value);
 return <div className="f"><label>{l}</label>{kind==='sel'?<select value={v||''} onChange={c}><option value="">Choose…</option>{o.map(x=><option key={x}>{x}</option>)}</select>:kind==='area'?<textarea rows={3} value={v||''} onChange={c}/>:<input type={kind} value={v||''} onChange={c}/>}
 {(kind==='time'||kind==='date')&&<button type="button" className="nowb" onClick={()=>on(now(kind))}>Use now</button>}</div>};
const CL={sr:'Client Signature',ho:'Received by (for Client)',wt:'Client Acceptance'};
export const ClientBlock=({d})=><div><h3>{CL[d.type]}</h3>
 {d.client_sig?<><Sig value={d.client_sig}/><p><b>{d.client_name}</b><br/><span className="mut">{new Date(d.signed_at).toLocaleString()} · ref {d.doc_hash?.slice(0,12)}</span></p>
 <h3>Client Comment</h3><p>{d.client_comment||'—'}</p></>:<p className="mut">Awaiting client signature</p>}</div>;
const Logo=()=><div className="logo"><img src="https://ntlafrica.com/wp-content/uploads/2023/02/Nanosoft-Logo.png" alt="Nanosoft" style={{height:48}} onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='block'}}/><b style={{display:'none',fontSize:30}}>nan<i>●</i>soft</b><small>NANOSOFT TECHNOLOGIES LIMITED · We mind your business</small></div>;
export default function Sheet({type,data,children}){
 const f=data.f||{},rows=(data.rows||[]).filter(r=>Object.values(r).some(Boolean));
 const line=k=><div className="f" key={k}><label>{FD[k][0]}</label><div className="v">{f[k]||'\u00a0'}</div></div>;
 return <div className="sheet"><Logo/><h1>{TITLE[type]}</h1>{P[type].pre.map(line)}
  <div className="tw"><table><thead><tr><th>#</th>{C[type].map(c=><th key={c[0]}>{c[1]}</th>)}</tr></thead><tbody>
  {rows.map((r,i)=><tr key={i}><td className="n">{i+1}</td>{C[type].map(([k])=><td className="c" key={k}>{r[k]}</td>)}</tr>)}</tbody></table></div>
  {type==='wt'&&<p className="mut">Total time: {rows.reduce((a,r)=>a+(+r.n||0),0)} minutes</p>}
  {P[type].post.map(line)}
  <div className="sigs"><div><h3>{type==='ho'?'Issued by (for Nanosoft)':'Technician'}</h3><div className="f"><label>Name</label><div className="v">{data.tech||'\u00a0'}</div></div><Sig value={data.techsig}/></div>{children}</div>
  <div className="foot"><b>NANOSOFT TECHNOLOGIES LIMITED</b><br/>Kanjata Road, Lavington, Nairobi · P.O. Box 14618-00800 · Tel: +254 20 4443990/9 · GSM: 0734 818 350<br/>Info@ntlafrica.com · www.ntlafrica.com</div></div>}
