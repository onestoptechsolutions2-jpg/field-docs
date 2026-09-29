import {createHmac} from 'crypto';import {cookies} from 'next/headers';import {redirect} from 'next/navigation';import {q} from './db';
const sig=v=>createHmac('sha256',process.env.SESSION_SECRET||'dev-secret').update(v).digest('hex');
export const mint=id=>{const v=id+'.'+(Date.now()+12*36e5);return v+'.'+sig(v)};
export async function getUser(){
 const c=cookies().get('sid')?.value;if(!c)return null;
 const [id,exp,s]=c.split('.');
 if(!s||s!==sig(id+'.'+exp)||+exp<Date.now())return null;
 return (await q('select id,name,email,role from users where id=$1',[id]))[0]||null;
}
export async function need(){const u=await getUser();if(!u)redirect('/login');return u}
export const canSee=(u,d)=>u.role!=='tech'||d.owner===u.id;
