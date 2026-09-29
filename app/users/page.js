import {redirect} from 'next/navigation';import {q} from '@/lib/db';import {need} from '@/lib/auth';import Shell from '@/components/Shell';import UserForm from '@/components/UserForm';
export const dynamic='force-dynamic';
export default async function U(){const u=await need();if(u.role!=='admin')redirect('/');const us=await q('select name,email,role,team from users order by id');
 return <Shell u={u}><UserForm/><table className="list"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Team</th></tr></thead><tbody>{us.map(x=><tr key={x.email}><td>{x.name}</td><td>{x.email}</td><td>{x.role}</td><td>{x.team}</td></tr>)}</tbody></table></Shell>}
