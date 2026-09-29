import {NextResponse} from 'next/server';import {q} from '@/lib/db';import {getUser} from '@/lib/auth';import {audit} from '@/lib/audit';
export async function POST(r,{params}){const u=await getUser();if(!u||u.role==='tech')return NextResponse.json({error:'Supervisors and admins only'},{status:403});
 const id=+params.id,b=await r.json(),target=(await q('select name from assets where id=$1',[id]))[0]?.name||('#'+id);
 try{
  if(b.action==='delete'){await q('delete from wo_assets where asset_id=$1',[id]);await q('delete from assets where id=$1',[id]);await audit(u,'asset.delete',target)}
  else{const name=(b.name||'').trim();if(!name)throw new Error('Enter the asset name');
   await q('update assets set name=$2,serial=$3,model=$4,site=$5 where id=$1',[id,name,(b.serial||'').trim()||null,(b.model||'').trim()||null,(b.site||'').trim()||null]);
   await audit(u,'asset.update',target)}
  return NextResponse.json({ok:1})
 }catch(e){return NextResponse.json({error:e.message},{status:400})}}
