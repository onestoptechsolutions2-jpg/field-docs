import ExcelJS from 'exceljs';import {q} from '@/lib/db';import {getUser} from '@/lib/auth';
const TY={sr:'Site Report',ho:'Handover',wt:'Work Ticket'};
export async function GET(r){const u=await getUser();if(!u)return new Response('Unauthorized',{status:401});
 const p=new URL(r.url).searchParams,s=p.get('s')||null,t=p.get('t')||null,esc=p.get('esc')==='1';
 const docs=await q(`select d.*,u.name tech,e.name esc_to_name from docs d join users u on u.id=d.owner left join users e on e.id=d.esc_to where ($1::text is null or d.status=$1) and ($2::text is null or d.type=$2) and ($3::boolean or d.owner=$4) and (not $5::boolean or d.esc_status is not null) order by d.created_at desc`,[s,t,u.role!=='tech',u.id,esc]);
 const wb=new ExcelJS.Workbook();
 const sh=(n,cols)=>{const w=wb.addWorksheet(n,{views:[{state:'frozen',ySplit:1}]});w.columns=cols.map(([h,k,wd])=>({header:h,key:k,width:wd||16}));const hr=w.getRow(1);hr.font={bold:true,color:{argb:'FFFFFFFF'}};hr.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF0B6BCB'}};w.autoFilter={from:'A1',to:{row:1,column:cols.length}};return w};
 const D=sh('Documents',[['No.','num',16],['Type','type'],['Status','status'],['Client','client',24],['Project / Job Ref','project',24],['Job type','jobtype',22],['System','product',20],['Technician','tech'],['Created','created',18],['Sent','sent',18],['Signed','signed',18],['Signed by','by',20],['Client comment','comment',40],['Outcome','outcome',18],['Escalation','es'],['Escalated to','eto'],['Escalation reason','er',28],['Supervisor response','ers',36]]);
 const W=sh('Work Done',[['Doc No.','num'],['Type','type'],['Client','client',24],['#','n',5],['Work done','w',60],['Status','s'],['Minutes','m',10]]);
 const E=sh('Equipment',[['Doc No.','num'],['Client','client',24],['#','n',5],['Item','i',30],['Serial number','s',22],['Model','m',18],['Manufacturer','f',18],['Condition','k']]);
 for(const d of docs){const f=d.data?.f||{},rows=(d.data?.rows||[]).filter(x=>Object.values(x).some(Boolean));
  D.addRow({num:d.num,type:TY[d.type],status:d.status,client:f.client,project:f.project||f.job||f.issue,jobtype:f.jobtype,product:f.product,tech:d.tech,created:d.created_at,sent:d.sent_at,signed:d.signed_at,by:d.client_name,comment:d.client_comment,outcome:f.outcome,es:d.esc_status,eto:d.esc_to_name,er:d.esc_reason,ers:d.esc_response});
  rows.forEach((x,i)=>d.type==='ho'?E.addRow({num:d.num,client:f.client,n:i+1,i:x.i,s:x.s,m:x.m,f:x.f,k:x.k}):W.addRow({num:d.num,type:TY[d.type],client:f.client,n:i+1,w:x.w,s:x.s,m:x.n?+x.n:null}));(d.data?.items||[]).filter(x=>Object.values(x).some(Boolean)).forEach((x,i)=>E.addRow({num:d.num,client:f.client,n:i+1,i:x.i,s:x.s,m:x.m,f:x.f,k:x.k}))}
 ['created','sent','signed'].forEach(k=>{D.getColumn(k).numFmt='yyyy-mm-dd hh:mm'});W.getColumn('w').alignment={wrapText:true,vertical:'top'};D.getColumn('comment').alignment={wrapText:true,vertical:'top'};
 const buf=await wb.xlsx.writeBuffer();
 return new Response(buf,{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':`attachment; filename="field-docs-${new Date().toISOString().slice(0,10)}.xlsx"`}})}
