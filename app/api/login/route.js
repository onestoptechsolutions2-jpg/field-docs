import {NextResponse} from 'next/server';import {q} from '@/lib/db';import {checkPw} from '@/lib/pw';import {mint,mintTmp} from '@/lib/auth';
export async function POST(r){const {email,password}=await r.json();
 const u=(await q('select * from users where lower(email)=lower($1) and active',[email||'']))[0];
 if(!u||!checkPw(password||'',u.pw))return NextResponse.json({error:'Wrong email or password'},{status:401});
 if(u.totp_enabled){const res=NextResponse.json({need2fa:1});res.cookies.set('sid2fa',mintTmp(u.id),{httpOnly:true,sameSite:'lax',path:'/',maxAge:300,secure:process.env.COOKIE_SECURE==='1'});return res}
 const res=NextResponse.json({ok:1});res.cookies.set('sid',mint(u.id),{httpOnly:true,sameSite:'lax',path:'/',maxAge:43200,secure:process.env.COOKIE_SECURE==='1'});return res}
