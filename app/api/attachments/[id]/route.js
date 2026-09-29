import {getUser,canSee} from '@/lib/auth';import {visible} from '@/lib/wo';import {q} from '@/lib/db';
async function ok(u,a){if(a.wo_id)return visible(u,a.wo_id);if(a.doc_id){const d=(await q('select * from docs where id=$1',[a.doc_id]))[0];return d&&canSee(u,d)}return u.role!=='tech'}
export async function GET(r,{params}){const u=await getUser();if(!u)return new Response('Unauthorized',{status:401});
 const a=(await q('select * from attachments where id=$1',[params.id]))[0];if(!a||!(await ok(u,a)))return new Response('Not found',{status:404});
 return new Response(a.data,{headers:{'Content-Type':a.mime||'application/octet-stream','Content-Disposition':`inline; filename*=UTF-8''${encodeURIComponent(a.name)}`}})}
export async function DELETE(r,{params}){const u=await getUser();if(!u)return Response.json({error:'Unauthorized'},{status:401});
 const a=(await q('select * from attachments where id=$1',[params.id]))[0];if(!a||!(await ok(u,a)))return Response.json({error:'Not found'},{status:404});
 if(a.doc_id){const d=(await q('select status from docs where id=$1',[a.doc_id]))[0];if(d?.status==='signed')return Response.json({error:'This document is locked'},{status:400})}
 await q('delete from attachments where id=$1',[params.id]);return Response.json({ok:1})}
