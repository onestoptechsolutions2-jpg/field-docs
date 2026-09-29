import {NextResponse} from 'next/server';import {getUser} from '@/lib/auth';import {q} from '@/lib/db';
export async function POST(r){const u=await getUser();if(!u)return NextResponse.json({},{status:401});const b=await r.json();
 await q('update users set email_alerts=$2 where id=$1',[u.id,!!b.email_alerts]);return NextResponse.json({ok:1})}
