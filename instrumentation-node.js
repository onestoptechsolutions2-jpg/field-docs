export default async function start(){
 const {q,getSet,setSet}=await import('./lib/db');
 const tick=async()=>{try{const now=new Date();if(now.getDate()!==1||now.getHours()<7)return;
  const {monthData,curYm,summaryText}=await import('./lib/report');const ym=curYm(-1),key='report_sent_'+ym;
  if(await getSet(key))return;await setSet(key,'1');
  const r=await monthData(ym,null),link=(process.env.APP_URL||'')+'/reports?m='+ym;
  const to=await q("select id,email from users where role in ('admin','supervisor')");
  const {notify}=await import('./lib/push'),{mail}=await import('./lib/mail');
  notify(to.map(x=>x.id),{title:'Monthly report ready',body:`${ym}: ${r.total} documents, ${r.signed} signed, ${r.esc} escalations`,url:'/reports?m='+ym,tag:'monthly'});
  for(const x of to){try{await mail(x.email,'Field Docs monthly report '+ym,summaryText(r)+'\n\nFull report: '+link)}catch(e){}}
 }catch(e){}};
 setInterval(tick,30*60*1000);setTimeout(tick,20000)}
