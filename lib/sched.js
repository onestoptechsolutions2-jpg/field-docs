import {q} from './db';import {createWO,evt} from './wo';
const pad=n=>String(n).padStart(2,'0'),ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
export const FREQ=['weekly','fortnightly','monthly','quarterly','biannual','yearly'];
export function nextDate(s,f,a){const [y,m,d]=s.split('-').map(Number),x=new Date(y,m-1,d);
 if(f==='weekly')x.setDate(x.getDate()+7);else if(f==='fortnightly')x.setDate(x.getDate()+14);
 else{const add={monthly:1,quarterly:3,biannual:6,yearly:12}[f]||1;x.setDate(1);x.setMonth(x.getMonth()+add);x.setDate(Math.min(a||d,new Date(x.getFullYear(),x.getMonth()+1,0).getDate()))}
 return ymd(x)}
async function owner(s){return (await q('select id,name,email,role,team from users where id=$1',[s.created_by]))[0]||(await q("select id,name,email,role,team from users where role='admin' order by id limit 1"))[0]}
export async function generate(s,u){
 const id=await createWO(u||await owner(s),{template_id:s.template_id,client_id:s.client_id,client:s.client,site:s.site,contact:s.contact,priority:s.priority,supervisor_id:s.supervisor_id,requested:ymd(new Date()),requirement:(s.requirement?s.requirement+' — ':'')+'Scheduled '+s.frequency+' job'});
 await q('update schedules set last_wo=$1,last_run=now() where id=$2',[id,s.id]);await evt(id,null,null,'scheduled','Generated automatically by schedule “'+s.name+'”');return id}
export async function runDue(){
 const today=ymd(new Date()),rows=await q('select *,next_run::text nr from schedules where active and next_run<=$1::date order by id',[today]),out=[];
 for(const s of rows){let n=s.nr;do{n=nextDate(n,s.frequency,s.anchor)}while(n<=today);
  if(!(await q('update schedules set next_run=$1::date where id=$2 and next_run=$3::date returning id',[n,s.id,s.nr])).length)continue;
  try{out.push(await generate(s))}catch(e){await q('update schedules set next_run=$1::date where id=$2',[s.nr,s.id])}}
 return out}
