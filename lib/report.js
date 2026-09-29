import {q} from './db';
const kind=d=>d.type==='wt'?'Work Ticket':d.type==='ho'?'Handover':d.data?.f?.jobtype||'Site Report';
export const curYm=(off=0)=>{const d=new Date();d.setMonth(d.getMonth()+off,1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')};
export async function monthData(ym,u){
 const docs=await q(`select d.id,d.num,d.type,d.status,d.data,d.owner,d.client_name,d.created_at,d.sent_at,d.signed_at,d.esc_status,d.esc_reason,u.name tech from docs d join users u on u.id=d.owner where d.created_at>=($1::text||'-01')::date and d.created_at<(($1::text||'-01')::date+interval '1 month') and ($2::boolean or d.owner=$3) order by d.created_at`,[ym,!u||u.role!=='tech',u?.id||0]);
 const cnt=(a,fn)=>{const m={};a.forEach(x=>{const k=fn(x)||'—';m[k]=(m[k]||0)+1});return m};
 const mins=d=>(d.data?.rows||[]).reduce((a,r)=>a+(+r.n||0),0);
 const signed=docs.filter(d=>d.status==='signed'),hrs=signed.filter(d=>d.sent_at).map(d=>(new Date(d.signed_at)-new Date(d.sent_at))/36e5);
 const tech={},client={};
 docs.forEach(d=>{const s=d.status==='signed'?1:0,e=d.esc_status?1:0,m=mins(d);
  const t=tech[d.tech]||(tech[d.tech]={docs:0,signed:0,esc:0,mins:0});t.docs++;t.signed+=s;t.esc+=e;t.mins+=m;
  const c=d.data?.f?.client||'—',k=client[c]||(client[c]={docs:0,signed:0,esc:0});k.docs++;k.signed+=s;k.esc+=e});
 return {ym,docs:docs.map(d=>({...d,kind:kind(d),client:d.data?.f?.client||'—',outcome:d.data?.f?.outcome||'',mins:mins(d)})),total:docs.length,signed:signed.length,
  pending:docs.filter(d=>['sent','viewed'].includes(d.status)).length,drafts:docs.filter(d=>d.status==='draft').length,esc:docs.filter(d=>d.esc_status).length,escResolved:docs.filter(d=>d.esc_status==='resolved').length,
  avgHrs:hrs.length?hrs.reduce((a,b)=>a+b,0)/hrs.length:null,minutes:docs.reduce((a,d)=>a+mins(d),0),
  byKind:cnt(docs,kind),byProduct:cnt(docs.filter(d=>d.data?.f?.product),d=>d.data.f.product),byOutcome:cnt(docs.filter(d=>d.data?.f?.outcome),d=>d.data.f.outcome),byReason:cnt(docs.filter(d=>d.esc_status),d=>d.esc_reason),tech,client}}
export const summaryText=r=>`Monthly report ${r.ym}\nDocuments: ${r.total}\nSigned: ${r.signed}\nAwaiting signature: ${r.pending}\nDrafts: ${r.drafts}\nEscalations: ${r.esc} (${r.escResolved} resolved)\nAvg time to sign: ${r.avgHrs==null?'n/a':r.avgHrs.toFixed(1)+' h'}\nTicket hours: ${(r.minutes/60).toFixed(1)}`;
