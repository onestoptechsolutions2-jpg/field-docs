'use client';
import {useState} from 'react';import {useRouter} from 'next/navigation';import Link from 'next/link';
import {dur,planFmt} from '@/lib/time';import Gantt from './Gantt';
const PARTIES=['Client','Supplier','Management','Procurement','Sales & Marketing','Technical Sales','Site access','Materials','Information','Approval','Third party'];
const SL={blocked:'Blocked',ready:'Ready · unassigned',assigned:'Awaiting acceptance',accepted:'Accepted',in_progress:'In progress',waiting:'Waiting',done:'Done',skipped:'Skipped'};
const fd=d=>d?new Date(d).toLocaleString():'—',sum=o=>Object.values(o||{}).reduce((a,b)=>a+b,0),ACTV=['ready','assigned','accepted','in_progress','waiting'];
const KV=({k,v,w})=><div className={w?'w2':''}><div className="kvk">{k}</div><div className="kvv">{v}</div></div>;
export default function WOView({wo,S,C,T,ev,docs,assets,users,me,sups,G,allFiles,cinfo}){
 const r=useRouter(),[err,setErr]=useState(''),[note,setNote]=useState(''),[fl,setFl]=useState(null),[as,setAs]=useState({name:'',serial:'',model:''}),sup=me.role!=='tech';
 const call=async(url,body,form)=>{setErr('');const x=await fetch(url,{method:'POST',body:form?body:JSON.stringify(body)}),j=await x.json().catch(()=>({}));if(!x.ok){setErr(j.error||'Failed');return null}r.refresh();return j};
 const act=(id,action,p)=>call('/api/tasks/'+id,{action,...p});
 const post=async(tid,text,files,clear)=>{const f=new FormData();f.append('comment',text||'');if(tid)f.append('task_id',tid);[...(files||[])].forEach(x=>f.append('files',x));if(await call(`/api/wo/${wo.id}/comment`,f,true))clear&&clear()};
 const tone=['completed','closed'].includes(wo.status)?'ok':S.overdue?'bad':S.atRisk?'warn':'';
 const vr=t=>t.status==='done'?<span style={{color:t.clock.var>0?'#b3261e':'#14733a'}}>{t.clock.var>0?'+':'−'}{dur(t.clock.var)}</span>:t.rem==null?'—':t.rem<0?<span className="badge over">OVERDUE {dur(t.rem)}</span>:'due in '+dur(t.rem);
 const stc=t=>t.status==='blocked'?<>Blocked by: {t.blockedBy.join(', ')||'—'}</>:t.status==='waiting'?<span className="badge waiting">WAITING · {t.waiting_party} {dur(t.waited)}</span>:<span className={'badge '+t.status}>{SL[t.status]}</span>;
 return <div>
  <div className="row noprint"><Link href="/workorders">‹ Work orders</Link><span className="grow"/>{wo.status==='completed'&&sup&&<button className="btn" onClick={()=>call(`/api/wo/${wo.id}/close`,{})}>Close work order</button>}</div>
  <h2 style={{margin:'6px 0'}}>{wo.num} · {wo.client}</h2>
  <p className="mut" style={{marginTop:0}}>{wo.service} · {wo.site||'no site'} · Priority {wo.priority}{wo.contact&&' · '+wo.contact} · Created {fd(wo.created_at)} by {wo.creator}{wo.ext_ref&&' · Ref '+wo.ext_ref}</p>{wo.requirement&&<p>{wo.requirement}</p>}
  {err&&<p className="err">{err}</p>}
  <div className={'card why '+tone}><div className="lbl">WHY NOT COMPLETE?</div><h2>{S.why}</h2>
   <div className="kv"><KV k="Current owner" v={S.owner}/><KV k="Current task" v={S.task||'—'}/><KV k="Status" v={SL[S.status]||S.status}/><KV k="Waiting for" v={S.waitingFor}/><KV k="Waiting since" v={S.since&&wo.status==='open'?fd(S.since):'—'}/><KV k="Duration" v={S.since&&wo.status==='open'?dur(S.waited):'—'}/><KV k="Next action" v={S.next} w/></div></div>
  <div className="card"><b>Clocks</b><div className="kv" style={{marginTop:8}}>
   <KV k="Planned project duration (working time)" v={dur(wo.planned_min*6e4)}/><KV k="Total project age" v={dur(C.age)}/><KV k="Internal active work" v={dur(C.active)}/><KV k="Internal waiting (assign / accept / start)" v={dur(C.assign)}/>
   <KV k="Client waiting" v={dur(C.ext.Client||0)}/><KV k="Supplier waiting" v={dur(C.ext.Supplier||0)}/><KV k="Other external" v={dur(sum(C.ext)-(C.ext.Client||0)-(C.ext.Supplier||0))}/><KV k="Other internal waiting" v={dur(sum(C.int))}/></div>
   <p className="mut" style={{marginBottom:0}}>Parallel tasks can overlap, so the parts can add up to more than the project age.</p></div>
  <div className="card"><b>Gantt chart</b><Gantt G={G}/></div>
  <div className="card"><b>Timeline &amp; stage performance</b><div className="tw"><table><thead><tr><th>Task</th><th>Owner</th><th>Plan</th><th>Actual</th><th>Variance</th><th>Status</th></tr></thead><tbody>
   {T.map(t=><tr key={t.id}><td className="c">{t.seq}. {t.title}{t.opt&&<span className="mut"> (optional)</span>}</td><td className="c">{t.assignee_name||t.team}</td><td className="c">{planFmt(t.planned_min)}</td><td className="c" title={'Elapsed '+dur(t.clock.raw)}>{t.clock.raw?dur(t.clock.work):'—'}</td><td className="c">{vr(t)}</td><td className="c">{stc(t)}</td></tr>)}</tbody></table></div>
   <p className="mut" style={{marginBottom:0}}>Actual and variance use working hours. Hover Actual for raw elapsed time.</p></div>
  <div className="card"><b>Time by responsibility</b><table className="list" style={{marginTop:8}}><tbody>{Object.entries(C.byOwner).sort((a,b)=>b[1]-a[1]).map(([k,v])=><tr key={k}><td>{k}</td><td>{dur(v)}</td></tr>)}{!Object.keys(C.byOwner).length&&<tr><td className="mut">No time recorded yet.</td></tr>}</tbody></table></div>
  <h3>Tasks</h3>
  {T.map(t=><Task key={t.id} t={t} users={users} me={me} act={act} call={call} post={post} ev={ev} open={ACTV.includes(t.status)} router={r} sups={sups} allFiles={allFiles} cinfo={cinfo}/>)}
  <div className="card"><b>Field documents</b><p className="mut" style={{margin:'4px 0'}}>Start these from the relevant task. They are the evidence for the work.</p>{docs.map(d=><div key={d.id}><Link href={'/docs/'+d.id}>{d.num}</Link> <span className="mut">{d.type==='sr'?'Site report':d.type==='wt'?'Work ticket':'Handover'}</span> <span className={'badge '+d.status}>{d.status}</span>{d.fin&&d.status!=='signed'&&<span className="badge done">completed</span>}</div>)}{!docs.length&&<span className="mut">None yet.</span>}</div>
  <div className="card"><b>Assets</b>{assets.map(a=><div key={a.id}>{a.name} <span className="mut">{a.serial&&'S/N '+a.serial} {a.model}</span></div>)}
   <div className="row" style={{marginTop:8}}><input placeholder="Asset (e.g. NVR-01)" value={as.name} onChange={e=>setAs({...as,name:e.target.value})}/><input placeholder="Serial" value={as.serial} onChange={e=>setAs({...as,serial:e.target.value})}/><input placeholder="Model" value={as.model} onChange={e=>setAs({...as,model:e.target.value})}/><button className="btn" onClick={async()=>{if(await call(`/api/wo/${wo.id}/assets`,as))setAs({name:'',serial:'',model:''})}}>Link asset</button></div></div>
  <div className="card"><b>Activity</b><div className="row" style={{margin:'8px 0'}}><input placeholder="Add a note, call note, finding or update…" value={note} onChange={e=>setNote(e.target.value)}/><input type="file" multiple onChange={e=>setFl(e.target.files)} style={{maxWidth:220}}/><button className="btn p" onClick={()=>post(null,note,fl,()=>{setNote('');setFl(null)})}>Post</button></div>
   {ev.map(e=><div className="ev" key={e.id}><span className="mut">{fd(e.at)} · {e.user_name} · {e.action}{e.task_id&&' · '+(T.find(t=>t.id===e.task_id)?.title||'')}</span><div>{e.comment}</div>{(e.files||[]).map(f=><a key={f.id} href={'/api/attachments/'+f.id} target="_blank" style={{marginRight:10}}>📎 {f.name}</a>)}</div>)}</div></div>}
function Task({t,users,sups,me,act,call,post,ev,open,router,allFiles,cinfo}){
 const [wp,setWp]=useState('Client'),[wr,setWr]=useState(''),[au,setAu]=useState(''),[due,setDue]=useState(''),[dr,setDr]=useState(''),[ci,setCi]=useState(''),[rf,setRf]=useState(t.ref||''),[fl,setFl]=useState(null),[mode,setMode]=useState('');
 const [sn,setSn]=useState(''),[su,setSu]=useState(''),[sa,setSa]=useState(''),[ap,setAp]=useState(false),[af,setAf]=useState({title:t.title,message:'',email:cinfo?.email||'',phone:cinfo?.phone||'',files:[]});
 const st=t.status,sup=me.role!=='tech',act_=ACTV.includes(st),files=ev.filter(e=>e.task_id===t.id).flatMap(e=>e.files||[]),subs=t.subs||[],apps=t.approvals||[];
 const B=(l,fn,p)=><button className={'btn'+(p?' p':'')} onClick={fn}>{l}</button>,sel=[...users].sort((a,b)=>(b.team===t.team)-(a.team===t.team));
 const assign=<><select value={au} onChange={e=>setAu(e.target.value)} style={{width:200}}><option value="">Assign to…</option>{sel.map(x=><option key={x.id} value={x.id}>{x.name} · {x.team}</option>)}</select>{B('Assign',()=>act(t.id,'assign',{user:au}))}</>;
 const sendAp=async ch=>{const j=await call('/api/tasks/'+t.id+'/approval',{...af,file_ids:af.files,channel:ch});if(!j)return;const text=`Hello, please review and respond: ${af.title} — ${j.link}`;
  if(ch==='wa')window.open('https://wa.me/'+af.phone.replace(/\D/g,'')+'?text='+encodeURIComponent(text));if(ch==='copy')await navigator.clipboard.writeText(j.link);setAp(false)};
 return <details className="card" open={open}><summary><b>{t.seq}. {t.title}</b> <span className={'badge '+st}>{SL[st]}</span> <span className="mut">{t.team}{t.assignee_name?' · '+t.assignee_name:''}</span></summary>
  <p className="mut" style={{margin:'8px 0'}}>Plan {planFmt(t.planned_min)}{t.due_at&&' · Due '+fd(t.due_at)}{t.orig_due_at&&' (originally '+fd(t.orig_due_at)+')'}{t.rejections>0&&' · rejected '+t.rejections+'×'}{t.reopened>0&&' · returned '+t.reopened+'×'}{st==='blocked'&&' · Blocked by: '+t.blockedBy.join(', ')}</p>
  <p style={{margin:'4px 0'}}><b>Supervisor:</b> {t.supervisor_name||'—'} {sup&&<select value="" onChange={e=>act(t.id,'set_supervisor',{user:e.target.value==='-'?'':e.target.value})} style={{width:170,marginLeft:6}}><option value="">Change…</option><option value="-">None</option>{sups.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>}</p>
  {t.next&&act_&&<p style={{margin:'4px 0'}}><b>Next:</b> {t.next}</p>}
  {t.ev.length>0&&act_&&<p style={{margin:'4px 0'}}><b>To complete:</b> {t.missing.length?<span className="err">{t.missing.join(', ')}</span>:<span style={{color:'#14733a'}}>all evidence in place ✓</span>}</p>}
  {t.chk_mode&&<div style={{margin:'8px 0'}}><b>{t.chk_mode==='items'?'Required items':'Checklist'}</b>{(t.chk||[]).map((c,i)=><div className="chk" key={i}><input type="checkbox" checked={c.done} disabled={!act_} onChange={()=>act(t.id,'check_toggle',{i})}/><span style={{textDecoration:c.done?'line-through':'none'}}>{c.t}</span>{act_&&<button className="link" onClick={()=>act(t.id,'check_del',{i})}>×</button>}</div>)}
   {act_&&<div className="row" style={{marginTop:6}}><input placeholder={t.chk_mode==='items'?'Add required item (e.g. Camera brackets ×14)':'Add step'} value={ci} onChange={e=>setCi(e.target.value)}/>{B('Add',async()=>{if(await act(t.id,'check_add',{text:ci}))setCi('')})}</div>}</div>}
  {(subs.length>0||act_)&&<div style={{margin:'10px 0'}}><b>Sub-tasks</b>{subs.length>0&&<span className="mut"> {subs.filter(s=>s.status==='done').length}/{subs.length} done</span>}
   {subs.map(s=>{const b=s.after&&subs.find(x=>x.id===s.after&&x.status!=='done'),blk=s.status==='todo'&&b;return <div className="chk" key={s.id} style={{flexWrap:'wrap'}}>
    <span className={'badge '+(s.status==='done'?'done':s.status==='in_progress'?'in_progress':'blocked')}>{blk?'blocked':s.status==='todo'?'to do':s.status.replace('_',' ')}</span>
    <span style={{textDecoration:s.status==='done'?'line-through':'none'}}>{s.title}</span><span className="mut">{s.assignee_name||'unassigned'}{b&&' · waits on “'+b.title+'”'}</span>
    {s.status==='todo'&&!b&&B('Start',()=>act(t.id,'sub_start',{id:s.id}))}{s.status!=='done'&&!b&&B('Done',()=>act(t.id,'sub_done',{id:s.id}),1)}{s.status==='done'&&B('Reopen',()=>act(t.id,'sub_reopen',{id:s.id}))}
    {s.status!=='done'&&<select value="" onChange={e=>e.target.value&&act(t.id,'sub_assign',{id:s.id,user:e.target.value})} style={{width:130}}><option value="">Assign…</option>{sel.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>}
    <button className="link" onClick={()=>act(t.id,'sub_del',{id:s.id})}>×</button></div>})}
   {act_&&<div className="row" style={{marginTop:6}}><input placeholder="Add a sub-task" value={sn} onChange={e=>setSn(e.target.value)}/><select value={su} onChange={e=>setSu(e.target.value)} style={{width:150}}><option value="">Assignee…</option>{sel.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>
    <select value={sa} onChange={e=>setSa(e.target.value)} style={{width:170}}><option value="">Can start anytime</option>{subs.filter(s=>s.status!=='done').map(s=>{return <option key={s.id} value={s.id}>After: {s.title}</option>})}</select>{B('Add',async()=>{if(await act(t.id,'sub_add',{title:sn,user:su,after:sa}))setSn('')})}</div>}</div>}
  {(act_||st==='done')&&<div className="row" style={{margin:'8px 0'}}><input placeholder="External reference (PO, quotation, invoice, link)" value={rf} onChange={e=>setRf(e.target.value)}/>{B('Save reference',()=>act(t.id,'ref',{ref:rf}))}</div>}
  {act_&&<div className="row" style={{margin:'8px 0'}}><input type="file" multiple onChange={e=>setFl(e.target.files)}/>{B('Attach',()=>fl&&post(t.id,'',fl,()=>setFl(null)))}</div>}
  {files.length>0&&<div>{files.map(f=><a key={f.id} href={'/api/attachments/'+f.id} target="_blank" style={{marginRight:10}}>📎 {f.name}</a>)}</div>}
  {(apps.length>0||act_)&&<div style={{margin:'10px 0'}}><b>Client approval</b>
   {apps.map(a=><div className="ev" key={a.id}><span className={'badge '+(a.status==='approved'?'done':a.status==='pending'?'waiting':'over')}>{a.status==='changes'?'changes requested':a.status}</span> {a.title} <span className="mut">{a.status==='pending'?(a.viewed_at?'opened by client '+fd(a.viewed_at):'not opened yet'):a.client_name+' · '+fd(a.decided_at)}</span>{a.comment&&<div>“{a.comment}”</div>}{a.status==='pending'&&<button className="link" onClick={()=>navigator.clipboard.writeText(location.origin+'/a/'+a.token)}>Copy link</button>}</div>)}
   {act_&&<div style={{marginTop:6}}>{B('Request client approval…',()=>setAp(!ap))}</div>}
   {ap&&<div className="entry" style={{marginTop:8}}><div className="f"><label>Title</label><input value={af.title} onChange={e=>setAf({...af,title:e.target.value})}/></div><div className="f"><label>Message to client</label><textarea rows={2} value={af.message} onChange={e=>setAf({...af,message:e.target.value})}/></div>
    {allFiles.length>0&&<div><span className="mut">Documents the client can review:</span>{allFiles.map(f=><div className="chk" key={f.id}><input type="checkbox" checked={af.files.includes(f.id)} onChange={e=>setAf({...af,files:e.target.checked?[...af.files,f.id]:af.files.filter(x=>x!==f.id)})}/><span>{f.name}</span></div>)}</div>}
    <div className="row" style={{margin:'8px 0'}}><input placeholder="Client email" value={af.email} onChange={e=>setAf({...af,email:e.target.value})}/><input placeholder="WhatsApp e.g. 2547…" value={af.phone} onChange={e=>setAf({...af,phone:e.target.value})}/></div>
    <div className="act">{B('Email link',()=>sendAp('email'),1)}{B('WhatsApp',()=>sendAp('wa'))}{B('Copy link',()=>sendAp('copy'))}</div></div>}</div>}
  <div className="act">
   {st==='ready'&&<>{B('Take it',()=>act(t.id,'take',{}),1)}{assign}</>}
   {st==='assigned'&&<>{B('Accept',()=>act(t.id,'accept',{}),1)}{B('Reject…',()=>{const x=prompt('Why are you rejecting this assignment?');x&&act(t.id,'reject',{reason:x})})}{assign}</>}
   {st==='accepted'&&<>{B('Start work',()=>act(t.id,'start',{}),1)}{assign}</>}
   {st==='in_progress'&&B('Complete',()=>act(t.id,'complete',{}),1)}
   {st==='waiting'&&<>{B('Resume work',()=>act(t.id,'resume',{}),!t.wait_default)}{t.wait_default&&B(t.why?'Received / done — complete':'Complete',()=>act(t.id,'complete',{}),1)}</>}
   {['ready','assigned','accepted','in_progress'].includes(st)&&B('Wait…',()=>setMode(mode==='wait'?'':'wait'))}
   {act_&&B('Revise deadline…',()=>setMode(mode==='rev'?'':'rev'))}
   {t.doc_hint&&act_&&B('Start field document',async()=>{const j=await call('/api/tasks/'+t.id+'/doc',{});if(j)router.push('/docs/'+j.id)})}
   {t.opt&&['blocked','ready','assigned','accepted','waiting'].includes(st)&&B('Not required',()=>act(t.id,'skip',{reason:'Not required'}))}
   {st==='done'&&sup&&B('Return for correction…',()=>{const x=prompt('What needs correcting?');x&&act(t.id,'return',{reason:x})})}</div>
  {mode==='wait'&&<div className="row"><select value={wp} onChange={e=>setWp(e.target.value)} style={{width:180}}>{PARTIES.map(p=><option key={p}>{p}</option>)}</select><input placeholder="Why are we waiting? (e.g. camera brackets unavailable)" value={wr} onChange={e=>setWr(e.target.value)}/>{B('Confirm',async()=>{if(await act(t.id,'wait',{party:wp,reason:wr}))setMode('')},1)}</div>}
  {mode==='rev'&&<div className="row"><input type="datetime-local" value={due} onChange={e=>setDue(e.target.value)} style={{maxWidth:230}}/><input placeholder="Reason for the new deadline" value={dr} onChange={e=>setDr(e.target.value)}/>{B('Save',async()=>{if(await act(t.id,'revise',{due,reason:dr}))setMode('')},1)}</div>}
 </details>}
