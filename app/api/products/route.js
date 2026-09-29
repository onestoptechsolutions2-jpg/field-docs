import {NextResponse} from 'next/server';import {q} from '@/lib/db';import {getUser} from '@/lib/auth';
const no=()=>NextResponse.json({error:'Admins only'},{status:403}),ok=()=>NextResponse.json({ok:1});
const adm=async()=>(await getUser())?.role==='admin';
export async function POST(r){if(!await adm())return no();const {name}=await r.json();if(!name?.trim())return NextResponse.json({error:'Enter a name'},{status:400});
 const c=(await q('insert into products(name,sort) values($1,(select coalesce(max(sort),0)+1 from products)) on conflict (lower(name)) do nothing returning id',[name.trim()]))[0];
 return c?ok():NextResponse.json({error:'That name already exists'},{status:409})}
export async function PATCH(r){if(!await adm())return no();const {id,name,active}=await r.json();
 try{await q('update products set name=coalesce($2,name),active=coalesce($3,active) where id=$1',[id,name?.trim()||null,typeof active==='boolean'?active:null])}catch(e){return NextResponse.json({error:'That name already exists'},{status:409})}return ok()}
export async function DELETE(r){if(!await adm())return no();const {id}=await r.json();await q('delete from products where id=$1',[id]);return ok()}
