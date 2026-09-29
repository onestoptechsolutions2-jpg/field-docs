import pg from 'pg';import {hashPw} from './pw';
const g=globalThis;
const pool=g._pool||(g._pool=new pg.Pool({connectionString:process.env.DATABASE_URL}));
const init=async()=>{
 await pool.query(`create table if not exists users(id serial primary key,name text not null,email text unique not null,pw text not null,role text not null default 'tech');
 create table if not exists docs(id serial primary key,num text,type text not null,status text not null default 'draft',owner int references users(id),data jsonb not null default '{}',token text unique not null,client_email text,client_phone text,sent_at timestamptz,viewed_at timestamptz,signed_at timestamptz,client_name text,client_comment text,client_sig text,signed_ip text,doc_hash text,created_at timestamptz default now(),updated_at timestamptz default now());
 create table if not exists events(id serial primary key,doc_id int references docs(id) on delete cascade,at timestamptz default now(),what text);
 create table if not exists settings(key text primary key,value text);
 create table if not exists push_subs(id serial primary key,user_id int,endpoint text unique,sub jsonb);
 create table if not exists products(id serial primary key,name text not null,active boolean not null default true,sort int not null default 0);
 create unique index if not exists products_name on products(lower(name));
 create table if not exists clients(id serial primary key,name text not null,contact text,email text,phone text,created_at timestamptz default now());
 create unique index if not exists clients_name on clients(lower(name));
 alter table docs add column if not exists esc_to int,add column if not exists esc_by int,add column if not exists esc_reason text,add column if not exists esc_note text,add column if not exists esc_status text,add column if not exists esc_at timestamptz,add column if not exists esc_response text;`);
 const {rows}=await pool.query('select 1 from users limit 1');
 if(!rows.length)await pool.query("insert into users(name,email,pw,role) values('Admin',$1,$2,'admin')",[process.env.ADMIN_EMAIL||'admin@example.com',hashPw(process.env.ADMIN_PASSWORD||'changeme')]);

 if(!(await pool.query('select 1 from products limit 1')).rows.length)await pool.query('insert into products(name,sort) select x,ord::int from unnest($1::text[]) with ordinality t(x,ord)',[['Nano Safeview (security)','Nano Access','Nano Shule (school)','Nano Time','Nano Pay (payroll)','Florena (agri)','Network','CCTV','Biometric / access control','Other']]);
};
const ready=()=>g._ready||(g._ready=init().catch(e=>{g._ready=null;throw e}));
export const q=async(s,a=[])=>{await ready();return (await pool.query(s,a)).rows};
export const getSet=async k=>(await q('select value from settings where key=$1',[k]))[0]?.value;
export const setSet=(k,v)=>q('insert into settings(key,value) values($1,$2) on conflict (key) do update set value=$2',[k,v]);
export const log=(id,what)=>q('insert into events(doc_id,what) values($1,$2)',[id,what]);
