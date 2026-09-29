import {NextResponse} from 'next/server';import {q} from '@/lib/db';import {hashPw} from '@/lib/pw';
export async function POST(r,{params}){const u=(await q('select id,reset_expires from users where reset_token=$1 and active',[params.token]))[0];
 if(!u||!u.reset_expires||+new Date(u.reset_expires)<Date.now())return NextResponse.json({error:'This link is invalid or has expired'},{status:400});
 const {password}=await r.json();if((password||'').length<6)return NextResponse.json({error:'Password must be 6+ characters'},{status:400});
 await q('update users set pw=$2,reset_token=null,reset_expires=null where id=$1',[u.id,hashPw(password)]);return NextResponse.json({ok:1})}
