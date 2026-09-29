'use client';
import {useState,useEffect,useRef} from 'react';
import Sheet,{ClientBlock,Fld,C} from './Sheet';import Sig from './Sig';import {Share,Esc} from './Panels';
const TPL={'Site Survey':['Met client contact and toured the site','Inspected cable routes and mounting points','Checked power, earthing and rack space','Noted network / ISP details','Took photos of key areas','Agreed requirements and risks with client'],
'Installation – Hardware':['Unpacked and checked equipment against list','Mounted / racked devices','Ran and labelled cabling','Powered up and confirmed devices boot','Tested connectivity and performance','Cleaned up site and briefed client'],
'Installation – Software':['Confirmed system requirements and access','Installed / deployed software','Configured settings, users and permissions','Imported client data','Ran functional tests with client','Trained client users'],
'Maintenance':['Inspected equipment / system health','Cleaned and updated devices','Replaced faulty parts','Tested after maintenance','Recommended follow-up actions'],
'Training':['Prepared training material','Trained users on core functions','Answered questions and noted issues','Shared user guides'],
'Support':['Logged fault as reported','Diagnosed the issue','Applied fix / replaced part','Tested and confirmed with client']};
const SIGN={t:'Sign off',h:'Confirm your name and sign. Below is the document as the client will see it.',k:'sign'},ESC={t:'Escalate?',h:'Does your supervisor need to know about this job?',k:'esc'},SHARE={t:'Send to client',h:'The client opens the link, adds a comment and signs online.',k:'share'};
const STEPS={
 sr:[{t:'The job',h:'What are you doing, and for whom?',k:'fields',f:['jobtype','client','project','product'],req:['client']},{t:'Arrival',h:'When did you get to site?',k:'fields',f:['start','timein'],req:['start']},{t:'Work done',h:'Add each piece of work you did. Use “Add another” for more.',k:'work'},{t:'Outcome',h:'How did the job end?',k:'fields',f:['outcome'],req:['outcome']},SIGN,ESC,SHARE],
 ho:[{t:'Handover details',h:'Who is receiving the equipment?',k:'fields',f:['job','client','date','by','dept'],req:['client']},{t:'Equipment',h:'Add each item you are handing over.',k:'items'},{t:'Remarks',h:'Anything else to note? (optional)',k:'fields',f:['rem']},SIGN,ESC,SHARE],
 wt:[{t:'Who & what',h:'Who raised this ticket?',k:'fields',f:['client','contact','product','priority'],req:['client']},{t:'The issue',h:'What was reported?',k:'fields',f:['issue','reported','timein'],req:['issue']},{t:'Work done',h:'Log each action you took, with minutes spent.',k:'work'},{t:'Resolution',h:'How did it end?',k:'fields',f:['outcome','resolution'],req:['outcome']},SIGN,ESC,SHARE]};
const nb=r=>Object.values(r).some(v=>String(v||'').trim());
export default function Doc({doc,sups,me,ev}){
 const [data,setData]=useState(doc.data),[status,setStatus]=useState(doc.status),[msg,setMsg]=useState('');
 const [esc,setEsc]=useState({status:doc.esc_status,reason:doc.esc_reason,note:doc.esc_note,response:doc.esc_response,toName:doc.esc_to_name});
 const first=useRef(1),locked=status==='signed';
 useEffect(()=>{if(first.current){first.current=0;return}if(locked)return;setMsg('Saving…');const t=setTimeout(async()=>{const r=await fetch('/api/docs/'+doc.id,{method:'PUT',body:JSON.stringify(data)});setMsg(r.ok?'Saved':'Save failed')},600);return()=>clearTimeout(t)},[data]);
 const P={doc,data,setData,sups,me,esc,setEsc,setStatus,setMsg,msg};
 return data.fin||locked?<View {...P} status={status} locked={locked} ev={ev}/>:<Wizard {...P}/>}
function Wizard({doc,data,setData,sups,me,esc,setEsc,setStatus,setMsg,msg}){
 const S=STEPS[doc.type],i=Math.min(data.step||0,S.length-1),s=S[i],last=i===S.length-1,f=data.f||{},rows=data.rows||[];
 const up=(k,v)=>setData({...data,f:{...f,[k]:v}}),upr=(j,k,v)=>setData({...data,rows:rows.map((r,x)=>x===j?{...r,[k]:v}:r)});
 const ok=s.k==='fields'?(s.req||[]).every(k=>(f[k]||'').trim()):s.k==='work'||s.k==='items'?rows.some(nb):s.k==='sign'?!!data.techsig&&!!(data.tech||'').trim():true;
 const next=()=>{if(last)return setData({...data,fin:true,step:0});const c=rows.filter(nb);setData({...data,step:i+1,rows:(s.k==='work'||s.k==='items')&&c.length?c:rows})};
 const chips=TPL[doc.type==='wt'?'Support':f.jobtype]||[];
 const cell=(r,j,[k,l,o])=><div className="f" key={k}><label>{l}</label>{Array.isArray(o)?<select value={r[k]||''} onChange={e=>upr(j,k,e.target.value)}><option value="">Choose…</option>{o.map(x=><option key={x}>{x}</option>)}</select>:o==='area'?<textarea rows={3} value={r[k]||''} onChange={e=>upr(j,k,e.target.value)}/>:<input type={o==='num'?'number':'text'} min="0" value={r[k]||''} onChange={e=>upr(j,k,e.target.value)}/>}</div>;
 const hint=(f.outcome&&f.outcome!=='Completed')?`Your outcome is “${f.outcome}”. We recommend escalating so someone follows up.`:'If everything is done and the client is happy, just tap Next.';
 return <div className="wz"><div className="prog"><div style={{width:(i+1)/S.length*100+'%'}}/></div>
  <p className="mut" style={{margin:'6px 0 0'}}>{doc.num} · Step {i+1} of {S.length} · {msg}</p><h2>{s.t}</h2><p className="mut" style={{marginTop:0}}>{s.h}</p>
  {s.k==='fields'&&<div className="card">{s.f.map(k=><Fld key={k} k={k} v={f[k]} on={v=>up(k,v)}/>)}</div>}
  {(s.k==='work'||s.k==='items')&&<>
   {s.k==='work'&&chips.length>0&&<div className="card"><span className="mut">Tap to add a common task:</span><div className="chipsr">{chips.map(c=><button key={c} className="chipb" onClick={()=>setData({...data,rows:[...rows.filter(nb),{w:c,s:'Done'}]})}>+ {c}</button>)}</div></div>}
   {rows.map((r,j)=><div className="entry" key={j}><div className="row"><b>{s.k==='work'?'Work done':'Item'} #{j+1}</b><span className="grow"/>{rows.length>1&&<button className="link" onClick={()=>setData({...data,rows:rows.filter((_,x)=>x!==j)})}>Remove</button>}</div>{C[doc.type].map(c=>cell(r,j,c))}</div>)}
   <button className="btn" onClick={()=>setData({...data,rows:[...rows,{}]})}>+ Add another {s.k==='work'?'work done':'item'}</button></>}
  {s.k==='sign'&&<><div className="card"><div className="f"><label>Your name</label><input value={data.tech||''} onChange={e=>setData({...data,tech:e.target.value})}/></div><div className="f"><label>Your signature</label><Sig value={data.techsig} onChange={v=>setData({...data,techsig:v})}/></div></div><Sheet type={doc.type} data={data}><ClientBlock d={doc}/></Sheet></>}
  {s.k==='esc'&&<Esc doc={doc} me={me} sups={sups} esc={esc} setEsc={setEsc} wizard hint={hint}/>}
  {s.k==='share'&&<div className="card"><Share doc={doc} setStatus={setStatus} setMsg={setMsg}/><p className="mut">You can also send it later from the document page.</p></div>}
  <div className="wznav"><button className="btn" disabled={i===0} onClick={()=>setData({...data,step:i-1})}>Back</button><button className="btn p" disabled={!ok} onClick={next}>{last?'Finish ✓':'Next'}</button></div></div>}
function View({doc,data,setData,me,sups,esc,setEsc,setStatus,setMsg,msg,status,locked,ev}){
 return <><div className="row noprint" style={{marginBottom:10}}><h2 style={{margin:0}}>{doc.num}</h2><span className={'badge '+status}>{status}</span>{esc.status&&<span className={'badge esc-'+esc.status}>⚑ {esc.status}</span>}<span className="mut">{msg}</span><span className="grow"/>
  {!locked&&<button className="btn" onClick={()=>setData({...data,fin:false,step:0})}>Edit steps</button>}<button className="btn" onClick={()=>print()}>Print / PDF</button></div>
  <div className="noprint"><Esc doc={doc} me={me} sups={sups} esc={esc} setEsc={setEsc}/>{!locked&&<div className="card"><b>Send to client for signing</b><Share doc={doc} setStatus={setStatus} setMsg={setMsg}/></div>}</div>
  <Sheet type={doc.type} data={data}><ClientBlock d={{...doc,status}}/></Sheet>
  <ul className="tl noprint">{ev.map((e,i)=><li key={i}>{new Date(e.at).toLocaleString()} — {e.what}</li>)}</ul></>}
