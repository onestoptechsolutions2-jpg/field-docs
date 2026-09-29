import webpush from 'web-push';import {q} from './db';import {mail} from './mail';
let ready;
const vapid=async()=>{if(ready)return ready;
 let r=await q("select value from settings where key='vapid'");
 if(!r.length){await q("insert into settings(key,value) values('vapid',$1) on conflict do nothing",[JSON.stringify(webpush.generateVAPIDKeys())]);r=await q("select value from settings where key='vapid'")}
 const v=JSON.parse(r[0].value);webpush.setVapidDetails(process.env.VAPID_SUBJECT||'mailto:info@ntlafrica.com',v.publicKey,v.privateKey);return ready=v};
export const publicKey=async()=>(await vapid()).publicKey;
export async function notify(ids,p){
 ids=[...new Set((ids||[]).filter(Boolean))];if(!ids.length)return;
 try{await vapid();const subs=await q('select id,sub from push_subs where user_id=any($1::int[])',[ids]);
  await Promise.all(subs.map(s=>webpush.sendNotification(s.sub,JSON.stringify(p)).catch(async e=>{if(e.statusCode===404||e.statusCode===410)await q('delete from push_subs where id=$1',[s.id])})))}catch(e){}
 try{if(!p.nomail&&process.env.SMTP_HOST){
  const us=await q(`select email from users where id=any($1::int[]) and email_alerts and coalesce(email,'')<>''`,[ids]);
  const body=`${p.title}\n\n${String(p.body||'').replace(/\. /g,'.\n')}\n\nOpen: ${(process.env.APP_URL||'')+(p.url||'/')}\n\nNanosoft Field Docs. You can switch email alerts off from the menu.`;
  for(const u of us)mail(u.email,p.title,body).catch(()=>{})}}catch(e){}}
