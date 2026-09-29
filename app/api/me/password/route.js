import {NextResponse} from 'next/server';import {getUser} from '@/lib/auth';import {q} from '@/lib/db';import {hashPw,checkPw} from '@/lib/pw';
export async function POST(r){const u=await getUser();if(!u)return NextResponse.json({error:'Unauthorized'},{status:401});
 const {current,password}=await r.json(),row=(await q('select pw from users where id=$1',[u.id]))[0];
 if(!checkPw(current||'',row.pw))return NextResponse.json({error:'Current password is wrong'},{status:401});
 if((password||'').length<6)return NextResponse.json({error:'New password must be 6+ characters'},{status:400});
 await q('update users set pw=$2 where id=$1',[u.id,hashPw(password)]);return NextResponse.json({ok:1})}
