import {NextResponse} from 'next/server';import {randomBytes} from 'crypto';import {q} from '@/lib/db';import {getUser} from '@/lib/auth';import {hashPw} from '@/lib/pw';import {audit} from '@/lib/audit';
export async function POST(r){const u=await getUser();if(!u||u.role==='tech')return NextResponse.json({error:'Admins and supervisors only'},{status:403});
 const b=await r.json(),name=(b.name||'').trim(),email=(b.email||'').trim();
 if(!name||!email)return NextResponse.json({error:'Name and email are required'},{status:400});
 let password=b.password,generated=null;
 if(!password){password=randomBytes(6).toString('hex');generated=password}
 else if(password.length<6)return NextResponse.json({error:'Password must be 6+ characters'},{status:400});
 let role='tech';
 if(u.role==='admin'&&['admin','supervisor'].includes(b.role))role=b.role;
 else if(u.role==='supervisor'&&b.role==='supervisor')role='supervisor';
 const team=b.team||'Technical';
 try{const row=(await q('insert into users(name,email,pw,role,team) values($1,lower($2),$3,$4,$5) returning id',[name,email,hashPw(password),role,team]))[0];
  await audit(u,'user.create',name,`email=${email}, role=${role}, team=${team}`);
  return NextResponse.json({ok:1,id:row.id,tempPassword:generated})
 }catch(e){return NextResponse.json({error:'Email already exists'},{status:409})}}
