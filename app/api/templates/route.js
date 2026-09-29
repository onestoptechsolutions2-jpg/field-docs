import {NextResponse} from 'next/server';import {getUser} from '@/lib/auth';import {q} from '@/lib/db';import {parse} from '@/lib/workflows';
export async function POST(r){const u=await getUser();if(u?.role!=='admin')return NextResponse.json({error:'Admins only'},{status:403});
 const {id,name,service,dsl,active}=await r.json();if(!name?.trim())return NextResponse.json({error:'Enter a name'},{status:400});
 try{parse(dsl||'')}catch(e){return NextResponse.json({error:e.message},{status:400})}
 try{if(id)await q('update templates set name=$2,service=$3,dsl=$4,active=$5 where id=$1',[id,name.trim(),service||null,dsl,active!==false]);
  else await q('insert into templates(name,service,dsl) values($1,$2,$3)',[name.trim(),service||null,dsl])}catch(e){return NextResponse.json({error:'That name already exists'},{status:409})}
 return NextResponse.json({ok:1})}
