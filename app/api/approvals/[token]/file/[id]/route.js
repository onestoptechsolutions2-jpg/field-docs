import {q} from '@/lib/db';
export async function GET(r,{params}){const a=(await q('select file_ids from approvals where token=$1',[params.token]))[0];if(!a||!a.file_ids.includes(+params.id))return new Response('Not found',{status:404});
 const f=(await q('select * from attachments where id=$1',[params.id]))[0];if(!f)return new Response('Not found',{status:404});
 return new Response(f.data,{headers:{'Content-Type':f.mime||'application/octet-stream','Content-Disposition':`inline; filename*=UTF-8''${encodeURIComponent(f.name)}`}})}
