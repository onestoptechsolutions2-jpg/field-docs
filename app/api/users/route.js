import {NextResponse} from 'next/server';import {q} from '@/lib/db';import {getUser} from '@/lib/auth';import {hashPw} from '@/lib/pw';
export async function POST(r){const u=await getUser();if(u?.role!=='admin')return NextResponse.json({error:'Admins only'},{status:403});
 const {name,email,password,role}=await r.json();if(!name||!email||(password||'').length<6)return NextResponse.json({error:'Name, email and a 6+ char password required'},{status:400});
 try{await q('insert into users(name,email,pw,role) values($1,lower($2),$3,$4)',[name,email,hashPw(password),['admin','supervisor'].includes(role)?role:'tech'])}catch(e){return NextResponse.json({error:'Email already exists'},{status:409})}
 return NextResponse.json({ok:1})}
