import {NextResponse} from 'next/server';import {getUser} from '@/lib/auth';import {q} from '@/lib/db';import {genSecret,otpauth} from '@/lib/totp';
export async function POST(){const u=await getUser();if(!u)return NextResponse.json({error:'Unauthorized'},{status:401});
 const secret=genSecret();await q('update users set totp_secret=$2,totp_enabled=false where id=$1',[u.id,secret]);
 return NextResponse.json({secret,otpauth:otpauth(u.email,secret)})}
