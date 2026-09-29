import {NextResponse} from 'next/server';import {q} from '@/lib/db';import {checkPw} from '@/lib/pw';import {mint} from '@/lib/auth';
export async function POST(r){const {email,password}=await r.json();
 const u=(await q('select * from users where lower(email)=lower($1)',[email||'']))[0];
 if(!u||!checkPw(password||'',u.pw))return NextResponse.json({error:'Wrong email or password'},{status:401});
 const res=NextResponse.json({ok:1});res.cookies.set('sid',mint(u.id),{httpOnly:true,sameSite:'lax',path:'/',maxAge:43200,secure:process.env.COOKIE_SECURE==='1'});return res}
