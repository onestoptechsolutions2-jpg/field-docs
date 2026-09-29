import {NextResponse} from 'next/server';import {getUser} from '@/lib/auth';import {editWO,visible} from '@/lib/wo';
export async function POST(r,{params}){const u=await getUser();if(!u)return NextResponse.json({error:'Unauthorized'},{status:401});
 const id=+params.id;if(!(await visible(u,id)))return NextResponse.json({error:'Not found'},{status:404});
 try{await editWO(u,id,await r.json());return NextResponse.json({ok:1})}catch(e){return NextResponse.json({error:e.message},{status:400})}}
