import ExcelJS from 'exceljs';import {monthData,woStats,trend} from './report';
export async function buildWorkbook(m,u){
 const canWo=!u||u.role!=='tech';
 const d=await monthData(m,u),W=await woStats(m,u),Tr=canWo?await trend(u,6):null,h=x=>+(x/36e5).toFixed(1);
 const wb=new ExcelJS.Workbook();
 const sh=(n,cols)=>{const w=wb.addWorksheet(n,{views:[{state:'frozen',ySplit:1}]});w.columns=cols.map(([h,k,wd])=>({header:h,key:k,width:wd||16}));const hr=w.getRow(1);hr.font={bold:true,color:{argb:'FFFFFFFF'}};hr.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF0B6BCB'}};return w};
 const S=sh('Summary',[['Metric','a',30],['Value','b',18]]);
 [['Month',m],['Documents',d.total],['Signed',d.signed],['Signed %',d.total?Math.round(d.signed/d.total*100)+'%':'—'],['Awaiting signature',d.pending],['Drafts',d.drafts],['Escalations',d.esc],['Escalations resolved',d.escResolved],['Avg hours to sign',d.avgHrs==null?'—':+d.avgHrs.toFixed(1)],['Ticket hours',+(d.minutes/60).toFixed(1)],
  ['Work orders created',W.created],['Work orders started',W.started],['Work orders done',W.done],['Work orders cancelled',W.cancelled],['SLA compliance %',W.slaPct==null?'—':W.slaPct+'%'],['Avg request→assignment h',W.avgReqToAssign==null?'—':h(W.avgReqToAssign)],['Avg assignment→acceptance h',W.avgAssignToAccept==null?'—':h(W.avgAssignToAccept)],['Rejected assignments',W.rejections],['Returned / reopened tasks',W.reopened]].forEach(([a,b])=>S.addRow({a,b}));
 if(canWo){
  const FN=sh('Pipeline Funnel',[['Stage','s',20],['Tasks','n'],['% of created','p']]);W.funnel.forEach(f=>FN.addRow({s:f.stage,n:f.n,p:f.pct==null?'—':f.pct+'%'}));
  const TR=sh('Trend (6mo)',[['Month','ym',12],['Created','c'],['Started','st'],['Done','d'],['Cancelled','x'],['SLA %','p'],['Avg cycle h','a'],['Rejected','r'],['Reopened','o']]);
  Tr.forEach(t=>TR.addRow({ym:t.ym,c:t.created,st:t.started,d:t.done,x:t.cancelled,p:t.slaPct==null?'—':t.slaPct+'%',a:t.avgCycle==null?'—':h(t.avgCycle),r:t.rejections,o:t.reopened}));
  const SC=sh('Technician Scorecard',[['Technician','n',24],['Team','tm',20],['Assigned','a'],['Done','d'],['On time %','p'],['Avg cycle h','c'],['Active time h','act'],['Rejected','r'],['Reopened','o']]);
  W.scorecards.forEach(x=>SC.addRow({n:x.key,tm:x.team,a:x.assigned,d:x.done,p:x.onTimePct==null?'—':x.onTimePct+'%',c:x.avgCycle==null?'—':h(x.avgCycle),act:h(x.activeMs),r:x.rejections,o:x.reopened}));
  const TC=sh('Department Scorecard',[['Department','tm',24],['Assigned','a'],['Done','d'],['On time %','p'],['Avg cycle h','c'],['Rejected','r'],['Reopened','o']]);
  W.teamCards.forEach(x=>TC.addRow({tm:x.key,a:x.assigned,d:x.done,p:x.onTimePct==null?'—':x.onTimePct+'%',c:x.avgCycle==null?'—':h(x.avgCycle),r:x.rejections,o:x.reopened}));
 }
 const K=sh('By Type',[['Type','a',34],['Count','b']]);Object.entries(d.byKind).forEach(([a,b])=>K.addRow({a,b}));
 const B=sh('By Product',[['System / product','a',34],['Count','b']]);Object.entries(d.byProduct).forEach(([a,b])=>B.addRow({a,b}));
 const T=sh('By Technician',[['Technician','n',24],['Docs','d'],['Signed','s'],['Escalations','e'],['Ticket hours','h']]);Object.entries(d.tech).forEach(([n,t])=>T.addRow({n,d:t.docs,s:t.signed,e:t.esc,h:+(t.mins/60).toFixed(1)}));
 const C=sh('By Client',[['Client','n',30],['Docs','d'],['Signed','s'],['Escalations','e']]);Object.entries(d.client).forEach(([n,t])=>C.addRow({n,d:t.docs,s:t.signed,e:t.esc}));
 const WS=sh('Work Orders',[['WO','num'],['Client','client',26],['Service','service',24],['Status','status'],['Created','created',18],['Planned due','due',18],['Completed','completed',18],['Why not complete','why',60],['Planned h','planned'],['Age h','age'],['Internal active h','active'],['Internal assign/accept h','assign'],['Client wait h','cw'],['Supplier wait h','sw'],['Other external h','oe']]);
 W.list.forEach(x=>WS.addRow({...x,planned:h(x.planned),age:h(x.age),active:h(x.active),assign:h(x.assign),cw:h(x.client_wait),sw:h(x.supplier_wait),oe:h(x.other_ext)}));['created','due','completed'].forEach(k=>{WS.getColumn(k).numFmt='yyyy-mm-dd hh:mm'});
 const SP=sh('Stage Performance',[['Task','t',36],['Team','tm',22],['Done','n'],['Avg plan h','p'],['Avg actual working h','a'],['Avg client/supplier wait h','e']]);W.stages.forEach(s=>SP.addRow({t:s.title,tm:s.team,n:s.n,p:h(s.plan/s.n),a:h(s.work/s.n),e:h(s.ext/s.n)}));
 const OW=sh('Time by Responsibility',[['Owner / party','o',30],['Hours','h']]);Object.entries(W.byOwner).forEach(([o,v])=>OW.addRow({o,h:h(v)}));
 const BC=sh('Time by Client',[['Client','n',30],['Hours','h']]);Object.entries(W.byClient).forEach(([n,v])=>BC.addRow({n,h:h(v)}));
 const SV=sh('SLA by Workflow',[['Service','s',28],['Created','n'],['Done','d'],['On time %','p'],['Avg planned h','pl'],['Avg actual age h','a']]);
 W.bySvc.forEach(x=>SV.addRow({s:x.service,n:x.n,d:x.done,p:x.slaPct==null?'—':x.slaPct+'%',pl:h(x.avgPlanned),a:x.avgAge==null?'—':h(x.avgAge)}));
 const RR=sh('Rejected & Reopened',[['Team','t',24],['Rejected assignments','r'],['Returned / reopened','o']]);W.byTeamRR.forEach(x=>RR.addRow({t:x.team,r:x.rejections,o:x.reopened}));
 const D=sh('Documents',[['No.','num'],['Type','kind',30],['Client','client',26],['Technician','tech',20],['Status','status'],['Outcome','outcome',18],['Created','c',18],['Signed','sg',18],['Escalation','e'],['Ticket mins','m']]);
 d.docs.forEach(x=>D.addRow({num:x.num,kind:x.kind,client:x.client,tech:x.tech,status:x.status,outcome:x.outcome,c:x.created_at,sg:x.signed_at,e:x.esc_status,m:x.mins||null}));
 ['c','sg'].forEach(k=>{D.getColumn(k).numFmt='yyyy-mm-dd hh:mm'});
 return wb}
