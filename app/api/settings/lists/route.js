import {NextResponse} from 'next/server';import {getUser} from '@/lib/auth';import {saveTeams,saveParties} from '@/lib/lists';
export async function POST(r){const u=await getUser();if(u?.role!=='admin')return NextResponse.json({error:'Admins only'},{status:403});
 const b=await r.json(),clean=s=>[...new Set((s||'').split('\n').map(x=>x.trim()).filter(Boolean))];
 await saveTeams(clean(b.teams));await saveParties(clean(b.parties));return NextResponse.json({ok:1})}
