import {NextResponse} from 'next/server';import {randomBytes} from 'crypto';import {q} from '@/lib/db';import {mail} from '@/lib/mail';
export async function POST(r){const {email}=await r.json();
 const u=(await q('select id,name,email from users where lower(email)=lower($1) and active',[email||'']))[0];
 if(u){const token=randomBytes(24).toString('hex'),link=(process.env.APP_URL||'http://'+r.headers.get('host'))+'/reset/'+token;
  await q("update users set reset_token=$2,reset_expires=now()+interval '1 hour' where id=$1",[u.id,token]);
  try{await mail(u.email,'Reset your Field Docs password',`Hello ${u.name},\n\nReset your password here (valid 1 hour):\n${link}\n\nIf you did not request this, ignore this email.`)}catch(e){}}
 return NextResponse.json({ok:1})}
