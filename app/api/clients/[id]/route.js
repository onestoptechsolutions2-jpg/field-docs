import {NextResponse} from 'next/server';import {q} from '@/lib/db';import {getUser} from '@/lib/auth';import {audit} from '@/lib/audit';
export async function POST(r,{params}){const u=await getUser();if(!u||u.role==='tech')return NextResponse.json({error:'Supervisors and admins only'},{status:403});
 const id=+params.id,b=await r.json(),target=(await q('select name from clients where id=$1',[id]))[0]?.name||('#'+id);
 try{
  if(b.action==='delete'){await q('delete from clients where id=$1',[id]);await audit(u,'client.delete',target)}
  else{const name=(b.name||'').trim();if(!name)throw new Error('Client name is required');
   await q('update clients set name=$2,contact=$3,email=$4,phone=$5 where id=$1',[id,name,(b.contact||'').trim()||null,(b.email||'').trim()||null,(b.phone||'').trim()||null]);
   await audit(u,'client.update',target,name!==target?'renamed to '+name:undefined)}
  return NextResponse.json({ok:1})
 }catch(e){return NextResponse.json({error:e.code==='23505'?'Another client already has that name':e.message},{status:400})}}
