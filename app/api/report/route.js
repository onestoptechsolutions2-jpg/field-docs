import ExcelJS from 'exceljs';import {getUser} from '@/lib/auth';import {monthData,curYm} from '@/lib/report';
export async function GET(r){const u=await getUser();if(!u)return new Response('Unauthorized',{status:401});
 const p=new URL(r.url).searchParams.get('m'),m=/^\d{4}-\d\d$/.test(p||'')?p:curYm(),d=await monthData(m,u);
 const wb=new ExcelJS.Workbook();
 const sh=(n,cols)=>{const w=wb.addWorksheet(n,{views:[{state:'frozen',ySplit:1}]});w.columns=cols.map(([h,k,wd])=>({header:h,key:k,width:wd||16}));const hr=w.getRow(1);hr.font={bold:true,color:{argb:'FFFFFFFF'}};hr.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF0B6BCB'}};return w};
 const S=sh('Summary',[['Metric','a',30],['Value','b',18]]);
 [['Month',m],['Documents',d.total],['Signed',d.signed],['Signed %',d.total?Math.round(d.signed/d.total*100)+'%':'—'],['Awaiting signature',d.pending],['Drafts',d.drafts],['Escalations',d.esc],['Escalations resolved',d.escResolved],['Avg hours to sign',d.avgHrs==null?'—':+d.avgHrs.toFixed(1)],['Ticket hours',+(d.minutes/60).toFixed(1)]].forEach(([a,b])=>S.addRow({a,b}));
 const K=sh('By Type',[['Type','a',34],['Count','b']]);Object.entries(d.byKind).forEach(([a,b])=>K.addRow({a,b}));
 const B=sh('By Product',[['System / product','a',34],['Count','b']]);Object.entries(d.byProduct).forEach(([a,b])=>B.addRow({a,b}));
 const T=sh('By Technician',[['Technician','n',24],['Docs','d'],['Signed','s'],['Escalations','e'],['Ticket hours','h']]);Object.entries(d.tech).forEach(([n,t])=>T.addRow({n,d:t.docs,s:t.signed,e:t.esc,h:+(t.mins/60).toFixed(1)}));
 const C=sh('By Client',[['Client','n',30],['Docs','d'],['Signed','s'],['Escalations','e']]);Object.entries(d.client).forEach(([n,t])=>C.addRow({n,d:t.docs,s:t.signed,e:t.esc}));
 const D=sh('Documents',[['No.','num'],['Type','kind',30],['Client','client',26],['Technician','tech',20],['Status','status'],['Outcome','outcome',18],['Created','c',18],['Signed','sg',18],['Escalation','e'],['Ticket mins','m']]);
 d.docs.forEach(x=>D.addRow({num:x.num,kind:x.kind,client:x.client,tech:x.tech,status:x.status,outcome:x.outcome,c:x.created_at,sg:x.signed_at,e:x.esc_status,m:x.mins||null}));
 ['c','sg'].forEach(k=>{D.getColumn(k).numFmt='yyyy-mm-dd hh:mm'});
 return new Response(await wb.xlsx.writeBuffer(),{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':`attachment; filename="monthly-report-${m}.xlsx"`}})}
