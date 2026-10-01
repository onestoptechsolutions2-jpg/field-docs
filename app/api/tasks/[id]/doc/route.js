import {NextResponse} from 'next/server';import {getUser} from '@/lib/auth';import {createDoc,visible} from '@/lib/wo';import {q} from '@/lib/db';
export async function POST(r,{params}){
 try{const u=await getUser();if(!u)return NextResponse.json({error:'Unauthorized'},{status:401});
  const t=(await q('select wo_id from tasks where id=$1',[params.id]))[0];if(!t||!(await visible(u,t.wo_id)))return NextResponse.json({error:'Not found'},{status:404});
  return NextResponse.json({id:await createDoc(u,+params.id)})}catch(e){return NextResponse.json({error:e.message||'Something went wrong'},{status:400})}}
