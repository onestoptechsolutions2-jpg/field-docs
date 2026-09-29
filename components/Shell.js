import Link from 'next/link';import {q} from '@/lib/db';import Pwa from './Pwa';
export default async function Shell({u,children}){
 const n=+(await q("select count(*) c from docs where esc_status='open' and ($1::boolean or owner=$2)",[u.role!=='tech',u.id]))[0].c;
 return <><div className="bar noprint"><Link href="/" className="brand">Nanosoft <span className="mut">Field Docs</span></Link><span className="grow"/>
  <Pwa/><Link href="/reports">Reports</Link><Link href="/escalations">Escalations{n>0&&<span className="badge esc-open" style={{marginLeft:6}}>{n}</span>}</Link>
  {u.role==='admin'&&<><Link href="/products">Products</Link><Link href="/users">Team</Link></>}<span className="mut">{u.name}</span><a href="/api/logout">Log out</a></div><div className="wrap">{children}</div></>}
