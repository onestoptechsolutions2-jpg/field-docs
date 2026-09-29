import Link from 'next/link';import {redirect} from 'next/navigation';import {randomBytes} from 'crypto';
import {q,log} from '@/lib/db';import {need} from '@/lib/auth';import Shell from '@/components/Shell';
export const dynamic='force-dynamic';
const K={survey:['sr','Site Survey'],hw:['sr','Installation – Hardware'],sw:['sr','Installation – Software'],maint:['sr','Maintenance'],ticket:['wt'],handover:['ho']};
const TILES=[['survey','📐','Site survey','Assess a site before work'],['hw','🔧','Hardware install','Devices, cabling, racks'],['sw','💾','Software install','Deploy & configure systems'],['maint','🛠️','Maintenance','Routine service visit'],['ticket','🎫','Work ticket','Support request or fault'],['handover','📦','Equipment handover','Hand items to a client']];
async function create(fd){'use server';const u=await need();const [type,jt]=K[fd.get('kind')]||K.survey;const day=new Date().toISOString().slice(0,10);
 const f=type==='sr'?{jobtype:jt,start:day}:type==='ho'?{date:day,by:u.name}:{reported:day,priority:'Medium'};
 const d=(await q('insert into docs(type,owner,token,data) values($1,$2,$3,$4) returning id',[type,u.id,randomBytes(18).toString('hex'),JSON.stringify({f,rows:[{}],tech:u.name,step:0})]))[0];
 await q('update docs set num=$1 where id=$2',[({sr:'SR',ho:'HO',wt:'WT'})[type]+'-'+new Date().getFullYear()+'-'+String(d.id).padStart(4,'0'),d.id]);
 await log(d.id,'Created by '+u.name);redirect('/docs/'+d.id)}
export default async function Home({searchParams}){const u=await need();const s=searchParams.s||null,t=searchParams.t||null;
 const rows=await q(`select d.id,d.num,d.type,d.status,d.updated_at,d.data,d.esc_status,u.name as tech from docs d join users u on u.id=d.owner where ($1::text is null or d.status=$1) and ($2::text is null or d.type=$2) and ($3::boolean or d.owner=$4) order by d.updated_at desc limit 300`,[s,t,u.role!=='tech',u.id]);
 const href=(ns,nt)=>'/?'+new URLSearchParams({...(ns?{s:ns}:{}),...(nt?{t:nt}:{})});
 return <Shell u={u}><h2 style={{margin:'0 0 4px'}}>What are you doing today?</h2><span className="mut">Pick one — we’ll guide you step by step.</span>
  <div className="tiles">{TILES.map(([k,i,l,h])=><form action={create} key={k}><input type="hidden" name="kind" value={k}/><button className="tile"><i>{i}</i><b>{l}</b><span>{h}</span></button></form>)}</div>
  <div className="row"><h3 style={{margin:0}}>All documents</h3><span className="grow"/><a className="btn" href={'/api/export?'+new URLSearchParams({...(s?{s}:{}),...(t?{t}:{})})}>Export to Excel</a></div>
  <div className="tabs">{[[null,'All'],['draft','Draft'],['sent','Sent'],['viewed','Viewed'],['signed','Signed']].map(([k,l])=><Link key={l} href={href(k,t)} className={s===k?'on':''}>{l}</Link>)}<span className="mut">|</span>{[[null,'Any type'],['sr','Site reports'],['wt','Tickets'],['ho','Handovers']].map(([k,l])=><Link key={l} href={href(s,k)} className={t===k?'on':''}>{l}</Link>)}</div>
  <table className="list"><thead><tr><th>No.</th><th>Client</th>{u.role!=='tech'&&<th>Technician</th>}<th>Status</th><th>Updated</th></tr></thead><tbody>
  {rows.map(r=><tr key={r.id}><td><Link href={'/docs/'+r.id}>{r.num}</Link></td><td>{r.data?.f?.client||'—'}</td>{u.role!=='tech'&&<td>{r.tech}</td>}<td><span className={'badge '+r.status}>{r.status}</span> {r.esc_status&&<span className={'badge esc-'+r.esc_status}>⚑</span>}</td><td className="mut">{new Date(r.updated_at).toLocaleDateString()}</td></tr>)}
  {!rows.length&&<tr><td colSpan={5} className="mut">Nothing here yet — pick a job above.</td></tr>}</tbody></table></Shell>}
