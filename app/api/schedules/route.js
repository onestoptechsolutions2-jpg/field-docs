import {NextResponse} from 'next/server';import {getUser} from '@/lib/auth';import {q} from '@/lib/db';import {generate,runDue,FREQ} from '@/lib/sched';
const bad=(m,s=400)=>NextResponse.json({error:m},{status:s});
export async function POST(r){const u=await getUser();if(!u||u.role==='tech')return bad('Supervisors and admins only',403);const b=await r.json();
 try{switch(b.action){
  case 'create':{const t=(await q('select id from templates where id=$1 and active',[b.template_id]))[0];if(!t)return bad('Choose a service type');if(!(b.client||'').trim())return bad('Choose a client');
   if(!FREQ.includes(b.frequency))return bad('Choose how often');if(!/^\d{4}-\d\d-\d\d$/.test(b.next_run||''))return bad('Pick the first run date');
   await q('insert into schedules(name,template_id,client_id,client,site,contact,requirement,priority,frequency,next_run,supervisor_id,created_by,anchor) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::date,$11,$12,$13)',[(b.name||b.client+' maintenance').trim(),t.id,b.client_id||null,b.client,b.site||null,b.contact||null,b.requirement||null,b.priority||'Normal',b.frequency,b.next_run,b.supervisor_id||null,u.id,+b.next_run.slice(8)]);return NextResponse.json({ok:1})}
  case 'toggle':await q('update schedules set active=not active where id=$1',[b.id]);return NextResponse.json({ok:1});
  case 'delete':await q('delete from schedules where id=$1',[b.id]);return NextResponse.json({ok:1});
  case 'run_now':{const s=(await q('select * from schedules where id=$1',[b.id]))[0];if(!s)return bad('Not found',404);return NextResponse.json({id:await generate(s,u)})}
  case 'run_due':return NextResponse.json({ids:await runDue()});
  default:return bad('Unknown action')}}catch(e){return bad(e.message)}}
