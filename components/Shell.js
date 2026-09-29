import Link from 'next/link';import {q} from '@/lib/db';import Pwa from './Pwa';import MailPref from './MailPref';
export default async function Shell({u,children}){
 const n=+(await q("select count(*) c from docs where esc_status='open' and ($1::boolean or owner=$2)",[u.role!=='tech',u.id]))[0].c;
 return <><div className="bar noprint"><Link href="/" className="brand">Nanosoft <span className="mut">Control Tower</span></Link><span className="grow"/>
  <Pwa/><Link href="/workorders">Work orders</Link><Link href="/documents">Documents</Link><Link href="/assets">Assets</Link>{u.role!=='tech'&&<Link href="/schedules">Schedules</Link>}<Link href="/reports">Reports</Link>
  <Link href="/escalations">Escalations{n>0&&<span className="badge esc-open" style={{marginLeft:6}}>{n}</span>}</Link>
  {u.role==='admin'&&<><Link href="/templates">Workflows</Link><Link href="/products">Products</Link><Link href="/settings">Calendar</Link><Link href="/users">Team</Link></>}
  <MailPref on={u.email_alerts}/><span className="mut">{u.name}</span><a href="/api/logout">Log out</a></div><div className="wrap">{children}</div></>}
