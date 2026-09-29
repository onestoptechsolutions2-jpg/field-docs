import {NextResponse} from 'next/server';import {getUser} from '@/lib/auth';import {q} from '@/lib/db';import {checkPw} from '@/lib/pw';import {audit} from '@/lib/audit';
export async function POST(r){const u=await getUser();if(!u)return NextResponse.json({error:'Unauthorized'},{status:401});
 const {password}=await r.json(),row=(await q('select pw from users where id=$1',[u.id]))[0];
 if(!checkPw(password||'',row.pw))return NextResponse.json({error:'Wrong password'},{status:401});
 await q('update users set totp_enabled=false,totp_secret=null where id=$1',[u.id]);await audit(u,'user.2fa_disable',u.name);return NextResponse.json({ok:1})}
