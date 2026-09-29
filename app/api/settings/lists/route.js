import {NextResponse} from 'next/server';import {getUser} from '@/lib/auth';import {saveTeams,saveParties} from '@/lib/lists';import {audit} from '@/lib/audit';
export async function POST(r){const u=await getUser();if(u?.role!=='admin')return NextResponse.json({error:'Admins only'},{status:403});
 const b=await r.json(),clean=s=>[...new Set((s||'').split('\n').map(x=>x.trim()).filter(Boolean))],teams=clean(b.teams),parties=clean(b.parties);
 await saveTeams(teams);await saveParties(parties);await audit(u,'settings.lists',null,`${teams.length} extra departments, ${parties.length} extra waiting parties`);
 return NextResponse.json({ok:1})}
