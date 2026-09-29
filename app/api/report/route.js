import ExcelJS from 'exceljs';import {getUser} from '@/lib/auth';import {monthData,curYm,woStats} from '@/lib/report';
export async function GET(r){const u=await getUser();if(!u)return new Response('Unauthorized',{status:401});
 const p=new URL(r.url).searchParams.get('m'),m=/^\d{4}-\d\d$/.test(p||'')?p:curYm(),d=await monthData(m,u),W=await woStats(m,u),h=x=>+(x/36e5).toFixed(1);
 const wb=new ExcelJS.Workbook();
 const sh=(n,cols)=>{const w=wb.addWorksheet(n,{views:[{state:'frozen',ySplit:1}]});w.columns=cols.map(([h,k,wd])=>({header:h,key:k,width:wd||16}));const hr=w.getRow(1);hr.font={bold:true,color:{argb:'FFFFFFFF'}};hr.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF0B6BCB'}};return w};
 const S=sh('Summary',[['Metric','a',30],['Value','b',18]]);
 [['Month',m],['Documents',d.total],['Signed',d.signed],['Signed %',d.total?Math.round(d.signed/d.total*100)+'%':'—'],['Awaiting signature',d.pending],['Drafts',d.drafts],['Escalations',d.esc],['Escalations resolved',d.escResolved],['Avg hours to sign',d.avgHrs==null?'—':+d.avgHrs.toFixed(1)],['Ticket hours',+(d.minutes/60).toFixed(1)]].forEach(([a,b])=>S.addRow({a,b}));
 const K=sh('By Type',[['Type','a',34],['Count','b']]);Object.entries(d.byKind).forEach(([a,b])=>K.addRow({a,b}));
 const B=sh('By Product',[['System / product','a',34],['Count','b']]);Object.entries(d.byProduct).forEach(([a,b])=>B.addRow({a,b}));
 const T=sh('By Technician',[['Technician','n',24],['Docs','d'],['Signed','s'],['Escalations','e'],['Ticket hours','h']]);Object.entries(d.tech).forEach(([n,t])=>T.addRow({n,d:t.docs,s:t.signed,e:t.esc,h:+(t.mins/60).toFixed(1)}));
 const C=sh('By Client',[['Client','n',30],['Docs','d'],['Signed','s'],['Escalations','e']]);Object.entries(d.client).forEach(([n,t])=>C.addRow({n,d:t.docs,s:t.signed,e:t.esc}));
 const WS=sh('Work Orders',[['WO','num'],['Client','client',26],['Service','service',24],['Status','status'],['Created','created',18],['Planned due','due',18],['Completed','completed',18],['Why not complete','why',60],['Planned h','planned'],['Age h','age'],['Internal active h','active'],['Internal assign/accept h','assign'],['Client wait h','cw'],['Supplier wait h','sw'],['Other external h','oe']]);
 W.list.forEach(x=>WS.addRow({...x,planned:h(x.planned),age:h(x.age),active:h(x.active),assign:h(x.assign),cw:h(x.client_wait),sw:h(x.supplier_wait),oe:h(x.other_ext)}));['created','due','completed'].forEach(k=>{WS.getColumn(k).numFmt='yyyy-mm-dd hh:mm'});
 const SP=sh('Stage Performance',[['Task','t',36],['Team','tm',22],['Done','n'],['Avg plan h','p'],['Avg actual working h','a'],['Avg client/supplier wait h','e']]);W.stages.forEach(s=>SP.addRow({t:s.title,tm:s.team,n:s.n,p:h(s.plan/s.n),a:h(s.work/s.n),e:h(s.ext/s.n)}));
 const OW=sh('Time by Responsibility',[['Owner / party','o',30],['Hours','h']]);Object.entries(W.byOwner).forEach(([o,v])=>OW.addRow({o,h:h(v)}));
 const D=sh('Documents',[['No.','num'],['Type','kind',30],['Client','client',26],['Technician','tech',20],['Status','status'],['Outcome','outcome',18],['Created','c',18],['Signed','sg',18],['Escalation','e'],['Ticket mins','m']]);
 d.docs.forEach(x=>D.addRow({num:x.num,kind:x.kind,client:x.client,tech:x.tech,status:x.status,outcome:x.outcome,c:x.created_at,sg:x.signed_at,e:x.esc_status,m:x.mins||null}));
 ['c','sg'].forEach(k=>{D.getColumn(k).numFmt='yyyy-mm-dd hh:mm'});
 return new Response(await wb.xlsx.writeBuffer(),{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':`attachment; filename="monthly-report-${m}.xlsx"`}})}
