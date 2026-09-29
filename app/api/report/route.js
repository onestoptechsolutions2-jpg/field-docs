import {getUser} from '@/lib/auth';import {curYm} from '@/lib/report';import {buildWorkbook} from '@/lib/excel';
export async function GET(r){const u=await getUser();if(!u)return new Response('Unauthorized',{status:401});
 const p=new URL(r.url).searchParams.get('m'),m=/^\d{4}-\d\d$/.test(p||'')?p:curYm(),wb=await buildWorkbook(m,u);
 return new Response(await wb.xlsx.writeBuffer(),{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':`attachment; filename="monthly-report-${m}.xlsx"`}})}
