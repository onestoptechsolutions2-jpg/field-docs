'use client';
import Link from 'next/link';import {usePathname} from 'next/navigation';
const ITEMS=[['/','🏠','Home'],['/workorders','🧰','Jobs'],['/documents','📝','Docs'],['/reports','📊','Reports']];
export default function BottomNav(){const p=usePathname();
 const on=href=>href==='/'?p==='/':p.startsWith(href);
 return <nav className="bottomnav noprint">
  {ITEMS.map(([href,icon,label])=><Link key={href} href={href} className={on(href)?'on':''}><i>{icon}</i><span>{label}</span></Link>)}
  <label htmlFor="navtoggle"><i>☰</i><span>More</span></label>
 </nav>}
