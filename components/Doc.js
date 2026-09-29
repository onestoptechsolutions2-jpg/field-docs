'use client';
import {useState,useEffect,useRef} from 'react';
import Sheet,{ClientBlock,Fld,C} from './Sheet';import Sig from './Sig';import {Share,Esc} from './Panels';
const TPL={'Installation – Network':['Confirmed floor plan / survey with client','Ran and terminated structured cabling, labelled both ends','Installed rack, patch panel and switches','Mounted and powered access points','Configured VLANs, IP scheme and DHCP','Configured router, firewall and internet link','Tested cable certification and throughput','Tested Wi-Fi coverage in all areas','Documented IPs, passwords and topology for client'],
'Installation – CCTV':['Confirmed camera positions with client','Mounted cameras and ran cabling','Installed NVR/DVR and hard drives','Connected PoE switch / power supplies','Configured recording, motion detection and retention','Aimed and focused cameras, checked night view','Set up remote / mobile viewing','Created user accounts and changed default passwords','Trained client on playback and export'],
'Installation – Biometric / Access Control':['Confirmed door and reader locations','Installed biometric readers / terminals','Installed electric locks, exit buttons and door sensors','Wired controller and power supply with battery backup','Connected devices to network and set IPs','Enrolled users (fingerprints / cards)','Configured access groups, schedules and time zones','Tested each door: entry, exit and fire release','Linked to attendance / payroll (Nano Time / Nano Pay) if required','Trained admin on enrolment and reports'],'Site Survey':['Met client contact and toured the site','Inspected cable routes and mounting points','Checked power, earthing and rack space','Noted network / ISP details','Took photos of key areas','Agreed requirements and risks with client'],
'Installation – Hardware':['Unpacked and checked equipment against list','Mounted / racked devices','Ran and labelled cabling','Powered up and confirmed devices boot','Tested connectivity and performance','Cleaned up site and briefed client'],
'Installation – Software':['Confirmed system requirements and access','Installed / deployed software','Configured settings, users and permissions','Imported client data','Ran functional tests with client','Trained client users'],
'Maintenance':['Inspected equipment / system health','Cleaned and updated devices','Replaced faulty parts','Tested after maintenance','Recommended follow-up actions'],
'Training':['Prepared training material','Trained users on core functions','Answered questions and noted issues','Shared user guides'],
'Support':['Logged fault as reported','Diagnosed the issue','Applied fix / replaced part','Tested and confirmed with client']};
const SIGN={t:'Sign off',h:'Confirm your name and sign. Below is the document as the client will see it.',k:'sign'},ESC={t:'Escalate?',h:'Does your supervisor need to know about this job?',k:'esc'},SHARE={t:'Send to client',h:'The client opens the link, adds a comment and signs online.',k:'share'};
const STEPS={
 sr:[{t:'The job',h:'What are you doing, and for whom?',k:'fields',f:['jobtype','client','project','product'],req:['client']},{t:'Arrival',h:'When did you get to site?',k:'fields',f:['start','timein'],req:['start']},{t:'Work done',h:'Add each piece of work you did. Use “Add another” for more.',k:'work'},{t:'Equipment installed',h:'Record serial numbers of what you installed or replaced. Optional — skip if none.',k:'items',rk:'items',opt:1,inst:1},{t:'Outcome',h:'How did the job end?',k:'fields',f:['outcome'],req:['outcome']},SIGN,ESC,SHARE],
 ho:[{t:'Handover details',h:'Who is receiving the equipment?',k:'fields',f:['job','client','date','by','dept'],req:['client']},{t:'Equipment',h:'Add each item you are handing over.',k:'items'},{t:'Remarks',h:'Anything else to note? (optional)',k:'fields',f:['rem']},SIGN,ESC,SHARE],
 wt:[{t:'Who & what',h:'Who raised this ticket?',k:'fields',f:['client','contact','product','priority'],req:['client']},{t:'The issue',h:'What was reported?',k:'fields',f:['issue','reported','timein'],req:['issue']},{t:'Work done',h:'Log each action you took, with minutes spent.',k:'work'},{t:'Resolution',h:'How did it end?',k:'fields',f:['outcome','resolution'],req:['outcome']},SIGN,ESC,SHARE]};
const nb=r=>Object.values(r).some(v=>String(v||'').trim());
export default function Doc({doc,sups,me,ev,clients,products}){
 const [data,setData]=useState(doc.data),[status,setStatus]=useState(doc.status),[msg,setMsg]=useState(''),[cl,setCl]=useState(clients||[]);
 const [esc,setEsc]=useState({status:doc.esc_status,reason:doc.esc_reason,note:doc.esc_note,response:doc.esc_response,toName:doc.esc_to_name});
 const first=useRef(1),locked=status==='signed';
 useEffect(()=>{if(first.current){first.current=0;return}if(locked)return;setMsg('Saving…');const t=setTimeout(async()=>{const r=await fetch('/api/docs/'+doc.id,{method:'PUT',body:JSON.stringify(data)});setMsg(r.ok?'Saved':'Save failed')},600);return()=>clearTimeout(t)},[data]);
 const P={doc,data,setData,sups,me,esc,setEsc,setStatus,setMsg,msg,cl,setCl,prods:products||[]};
 return data.fin||locked?<View {...P} status={status} locked={locked} ev={ev}/>:<Wizard {...P}/>}
function Wizard({doc,data,setData,sups,me,esc,setEsc,setStatus,setMsg,msg,cl,setCl,prods}){
 const f=data.f||{},S=STEPS[doc.type].filter(x=>!x.inst||/Installation|Maintenance/.test(f.jobtype||'')),i=Math.min(data.step||0,S.length-1),s=S[i],last=i===S.length-1;
 const rk=s.rk||'rows',rows=data[rk]||[],cols=s.k==='items'?C.ho:C[doc.type],list=s.k==='work'||s.k==='items';
 const up=(k,v)=>setData({...data,f:{...f,[k]:v}}),upr=(j,k,v)=>setData({...data,[rk]:rows.map((r,x)=>x===j?{...r,[k]:v}:r)});
 const ok=s.k==='fields'?(s.req||[]).every(k=>(f[k]||'').trim()):list?(!!s.opt||rows.some(nb)):s.k==='sign'?!!data.techsig&&!!(data.tech||'').trim():true;
 const next=()=>{if(last)return setData({...data,fin:true,step:0});const c=rows.filter(nb);setData({...data,step:i+1,...(list?{[rk]:c.length?c:(s.opt?[]:rows)}:{})})};
 const chips=TPL[doc.type==='wt'?'Support':f.jobtype]||[];
 const cell=(r,j,[k,l,o])=><div className="f" key={k}><label>{l}</label>{Array.isArray(o)?<select value={r[k]||''} onChange={e=>upr(j,k,e.target.value)}><option value="">Choose…</option>{o.map(x=><option key={x}>{x}</option>)}</select>:o==='area'?<textarea rows={3} value={r[k]||''} onChange={e=>upr(j,k,e.target.value)}/>:<input type={o==='num'?'number':'text'} min="0" value={r[k]||''} onChange={e=>upr(j,k,e.target.value)}/>}</div>;
 const hint=(f.outcome&&f.outcome!=='Completed')?`Your outcome is “${f.outcome}”. We recommend escalating so someone follows up.`:'If everything is done and the client is happy, just tap Next.';
 return <div className="wz"><div className="prog"><div style={{width:(i+1)/S.length*100+'%'}}/></div>
  <p className="mut" style={{margin:'6px 0 0'}}>{doc.num} · Step {i+1} of {S.length} · {msg}</p><h2>{s.t}</h2><p className="mut" style={{marginTop:0}}>{s.h}</p>
  {s.k==='fields'&&<div className="card">{s.f.map(k=>k==='client'?<ClientPick key={k} type={doc.type} data={data} setData={setData} cl={cl} setCl={setCl}/>:<Fld key={k} k={k} v={f[k]} on={v=>up(k,v)} opts={k==='product'&&prods.length?(f.product&&!prods.includes(f.product)?[...prods,f.product]:prods):undefined}/>)}</div>}
  {list&&<>
   {s.k==='work'&&chips.length>0&&<div className="card"><span className="mut">Tap to add a common task:</span><div className="chipsr">{chips.map(c=><button key={c} className="chipb" onClick={()=>setData({...data,rows:[...(data.rows||[]).filter(nb),{w:c,s:'Done'}]})}>+ {c}</button>)}</div></div>}
   {rows.map((r,j)=><div className="entry" key={j}><div className="row"><b>{s.k==='work'?'Work done':'Item'} #{j+1}</b><span className="grow"/>{(rows.length>1||s.opt)&&<button className="link" onClick={()=>setData({...data,[rk]:rows.filter((_,x)=>x!==j)})}>Remove</button>}</div>{cols.map(c=>cell(r,j,c))}</div>)}
   {s.opt&&!rows.length&&<p className="mut">Nothing recorded — tap Add, or Next to skip.</p>}
   <button className="btn" onClick={()=>setData({...data,[rk]:[...rows,{}]})}>+ Add another {s.k==='work'?'work done':'item'}</button></>}
  {s.k==='sign'&&<><div className="card"><div className="f"><label>Your name</label><input value={data.tech||''} onChange={e=>setData({...data,tech:e.target.value})}/></div><div className="f"><label>Your signature</label><Sig value={data.techsig} onChange={v=>setData({...data,techsig:v})}/></div></div><Sheet type={doc.type} data={data}><ClientBlock d={doc}/></Sheet></>}
  {s.k==='esc'&&<Esc doc={doc} me={me} sups={sups} esc={esc} setEsc={setEsc} wizard hint={hint}/>}
  {s.k==='share'&&<div className="card"><Share doc={sd(doc,data,cl)} setStatus={setStatus} setMsg={setMsg}/><p className="mut">You can also send it later from the document page.</p></div>}
  <div className="wznav"><button className="btn" disabled={i===0} onClick={()=>setData({...data,step:i-1})}>Back</button><button className="btn p" disabled={!ok} onClick={next}>{last?'Finish ✓':'Next'}</button></div></div>}
function View({doc,data,setData,me,sups,esc,setEsc,setStatus,setMsg,msg,status,locked,ev,cl}){
 return <><div className="row noprint" style={{marginBottom:10}}><h2 style={{margin:0}}>{doc.num}</h2><span className={'badge '+status}>{status}</span>{esc.status&&<span className={'badge esc-'+esc.status}>⚑ {esc.status}</span>}<span className="mut">{msg}</span><span className="grow"/>
  {!locked&&<button className="btn" onClick={()=>setData({...data,fin:false,step:0})}>Edit steps</button>}<button className="btn" onClick={()=>print()}>Print / PDF</button></div>
  <div className="noprint"><Esc doc={doc} me={me} sups={sups} esc={esc} setEsc={setEsc}/>{!locked&&<div className="card"><b>Send to client for signing</b><Share doc={sd(doc,data,cl)} setStatus={setStatus} setMsg={setMsg}/></div>}</div>
  <Sheet type={doc.type} data={data}><ClientBlock d={{...doc,status}}/></Sheet>
  <ul className="tl noprint">{ev.map((e,i)=><li key={i}>{new Date(e.at).toLocaleString()} — {e.what}</li>)}</ul></>}

const sd=(doc,data,cl)=>{const c=cl.find(x=>x.id===data.cid);return {...doc,client_email:doc.client_email||c?.email||'',client_phone:doc.client_phone||c?.phone||''}};
function ClientPick({data,setData,cl,setCl,type}){
 const f=data.f||{},E={name:'',contact:'',email:'',phone:''},[add,setAdd]=useState(false),[n,setN]=useState(E),[err,setErr]=useState('');
 const pick=c=>setData({...data,cid:c?c.id:null,f:{...f,client:c?c.name:'',...(type==='wt'&&c?{contact:[c.contact,c.phone].filter(Boolean).join(' / ')}:{})}});
 const save=async()=>{setErr('');const r=await fetch('/api/clients',{method:'POST',body:JSON.stringify(n)});const j=await r.json();if(!r.ok)return setErr(j.error);
  setCl(l=>l.some(x=>x.id===j.id)?l:[...l,j].sort((a,b)=>a.name.localeCompare(b.name)));pick(j);setAdd(false);setN(E)};
 const i=(k,l,t)=><div className="f" key={k}><label>{l}</label><input type={t||'text'} value={n[k]} onChange={e=>setN({...n,[k]:e.target.value})}/></div>;
 return <div className="f"><label>Client</label>
  <select value={add?'new':data.cid||''} onChange={e=>{const v=e.target.value;if(v==='new')setAdd(true);else{setAdd(false);pick(cl.find(c=>c.id==v))}}}><option value="">Choose client…</option>{cl.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}<option value="new">➕ Add new client…</option></select>
  {add&&<div className="entry" style={{marginTop:8}}><b>New client</b>{i('name','Client name')}{i('contact','Contact person')}{i('phone','Phone / WhatsApp (e.g. 2547…)')}{i('email','Email','email')}{err&&<p className="err">{err}</p>}
   <div className="row"><button className="btn p" onClick={save}>Save client</button><button className="link" onClick={()=>setAdd(false)}>Cancel</button></div></div>}</div>}
