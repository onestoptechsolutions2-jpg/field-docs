import {NextResponse} from 'next/server';import {q} from '@/lib/db';import {getUser} from '@/lib/auth';
export async function POST(r){const u=await getUser();if(!u)return NextResponse.json({},{status:401});const s=await r.json();if(!s.endpoint)return NextResponse.json({},{status:400});
 await q('insert into push_subs(user_id,endpoint,sub) values($1,$2,$3) on conflict (endpoint) do update set user_id=$1,sub=$3',[u.id,s.endpoint,JSON.stringify(s)]);return NextResponse.json({ok:1})}
