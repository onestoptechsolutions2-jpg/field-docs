import {NextResponse} from 'next/server';import {q} from '@/lib/db';import {getUser} from '@/lib/auth';import {hashPw} from '@/lib/pw';import {audit} from '@/lib/audit';
export async function POST(r,{params}){const u=await getUser();if(u?.role!=='admin')return NextResponse.json({error:'Admins only'},{status:403});
 const id=+params.id,b=await r.json(),target=(await q('select name from users where id=$1',[id]))[0]?.name||('#'+id);
 try{
  if(b.action==='reset'){if((b.password||'').length<6)throw new Error('6+ char password required');await q('update users set pw=$2 where id=$1',[id,hashPw(b.password)]);
   await audit(u,'user.reset_password',target)}
  else if(b.action==='active'){if(id===u.id)throw new Error("Can't deactivate yourself");await q('update users set active=$2 where id=$1',[id,!!b.active]);
   await audit(u,b.active?'user.activate':'user.deactivate',target)}
  else if(b.action==='delete'){if(id===u.id)throw new Error("Can't delete yourself");
   const used=(await q('select 1 from tasks where assignee=$1 or supervisor=$1 union select 1 from work_orders where created_by=$1',[id]))[0];
   if(used)throw new Error('This user has history — deactivate instead of deleting');
   await q('delete from users where id=$1',[id]);await audit(u,'user.delete',target)}
  else{const {name,role,team}=b;if(!name||!String(name).trim())throw new Error('Name is required');
   await q('update users set name=$2,role=$3,team=$4 where id=$1',[id,name.trim(),['admin','supervisor'].includes(role)?role:'tech',team||'Technical']);
   await audit(u,'user.update',target,`name=${name.trim()}, role=${role}, team=${team}`)}
  return NextResponse.json({ok:1})
 }catch(e){return NextResponse.json({error:e.message},{status:400})}}
