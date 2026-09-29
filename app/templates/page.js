import {redirect} from 'next/navigation';import {q} from '@/lib/db';import {need} from '@/lib/auth';import Shell from '@/components/Shell';import TemplateAdmin from '@/components/TemplateAdmin';
export const dynamic='force-dynamic';
export default async function P(){const u=await need();if(u.role!=='admin')redirect('/');
 return <Shell u={u}><h2 style={{marginTop:0}}>Workflow templates</h2><TemplateAdmin items={await q('select * from templates order by service,name')}/></Shell>}
