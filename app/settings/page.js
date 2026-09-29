import Link from 'next/link';import {redirect} from 'next/navigation';import {need} from '@/lib/auth';import Shell from '@/components/Shell';
export const dynamic='force-dynamic';
const TILES=[['/users','👥','Team','Add, edit, deactivate or reset passwords for people'],['/templates','🧭','Workflows','Edit the task templates behind each service type'],['/products','📦','Products','Systems/products shown in wizards and reports'],['/settings/calendar','📅','Calendar','Working hours, holidays, departments, waiting parties'],['/audit','🧾','Audit log','Who changed what, and when']];
export default async function Settings(){const u=await need();if(u.role!=='admin')redirect('/');
 return <Shell u={u}><h2 style={{marginTop:0}}>Settings</h2><p className="mut" style={{marginTop:0}}>Admin-only configuration.</p>
  <div className="tiles">{TILES.map(([href,i,l,h])=><Link className="tile" key={href} href={href}><i>{i}</i><b>{l}</b><span>{h}</span></Link>)}</div></Shell>}
