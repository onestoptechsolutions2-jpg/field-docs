import {NextResponse} from 'next/server';import {getUser} from '@/lib/auth';import {closeWO} from '@/lib/wo';
export async function POST(r,{params}){const u=await getUser();if(!u)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{await closeWO(u,+params.id);return NextResponse.json({ok:1})}catch(e){return NextResponse.json({error:e.message},{status:400})}}
