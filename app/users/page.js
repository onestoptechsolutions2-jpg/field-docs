import {redirect} from 'next/navigation';import {q} from '@/lib/db';import {need} from '@/lib/auth';import {teamList} from '@/lib/lists';import Shell from '@/components/Shell';import UserForm from '@/components/UserForm';import UserAdmin from '@/components/UserAdmin';
export const dynamic='force-dynamic';
export default async function U(){const u=await need();if(u.role!=='admin')redirect('/');const us=await q('select id,name,email,role,team,active from users order by id'),teams=await teamList();
 return <Shell u={u}><UserForm teams={teams}/><UserAdmin users={us} teams={teams} me={{id:u.id}}/></Shell>}
