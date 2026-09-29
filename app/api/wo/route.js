import {NextResponse} from 'next/server';import {getUser} from '@/lib/auth';import {createWO} from '@/lib/wo';
export async function POST(r){const u=await getUser();if(!u)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{return NextResponse.json({id:await createWO(u,await r.json())})}catch(e){return NextResponse.json({error:e.message},{status:400})}}
