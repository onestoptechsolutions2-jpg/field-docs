import {getUser} from '@/lib/auth';import {visible} from '@/lib/wo';import {q} from '@/lib/db';
export async function GET(r,{params}){const u=await getUser();if(!u)return new Response('Unauthorized',{status:401});
 const a=(await q('select * from attachments where id=$1',[params.id]))[0];if(!a||!(await visible(u,a.wo_id)))return new Response('Not found',{status:404});
 return new Response(a.data,{headers:{'Content-Type':a.mime||'application/octet-stream','Content-Disposition':`inline; filename*=UTF-8''${encodeURIComponent(a.name)}`}})}
