import {NextResponse} from 'next/server';import {getUser} from '@/lib/auth';import {q} from '@/lib/db';import {verifyTotp} from '@/lib/totp';
export async function POST(r){const u=await getUser();if(!u)return NextResponse.json({error:'Unauthorized'},{status:401});
 const {code}=await r.json(),row=(await q('select totp_secret from users where id=$1',[u.id]))[0];
 if(!row?.totp_secret||!verifyTotp(row.totp_secret,code))return NextResponse.json({error:'Wrong code'},{status:400});
 await q('update users set totp_enabled=true where id=$1',[u.id]);return NextResponse.json({ok:1})}
