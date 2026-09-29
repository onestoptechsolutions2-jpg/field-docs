import pg from 'pg';import {hashPw} from './pw';
const g=globalThis;
const pool=g._pool||(g._pool=new pg.Pool({connectionString:process.env.DATABASE_URL}));
const init=async()=>{
 await pool.query(`create table if not exists users(id serial primary key,name text not null,email text unique not null,pw text not null,role text not null default 'tech');
 create table if not exists docs(id serial primary key,num text,type text not null,status text not null default 'draft',owner int references users(id),data jsonb not null default '{}',token text unique not null,client_email text,client_phone text,sent_at timestamptz,viewed_at timestamptz,signed_at timestamptz,client_name text,client_comment text,client_sig text,signed_ip text,doc_hash text,created_at timestamptz default now(),updated_at timestamptz default now());
 create table if not exists events(id serial primary key,doc_id int references docs(id) on delete cascade,at timestamptz default now(),what text);
 alter table docs add column if not exists esc_to int,add column if not exists esc_by int,add column if not exists esc_reason text,add column if not exists esc_note text,add column if not exists esc_status text,add column if not exists esc_at timestamptz,add column if not exists esc_response text;`);
 const {rows}=await pool.query('select 1 from users limit 1');
 if(!rows.length)await pool.query("insert into users(name,email,pw,role) values('Admin',$1,$2,'admin')",[process.env.ADMIN_EMAIL||'admin@example.com',hashPw(process.env.ADMIN_PASSWORD||'changeme')]);
};
const ready=()=>g._ready||(g._ready=init().catch(e=>{g._ready=null;throw e}));
export const q=async(s,a=[])=>{await ready();return (await pool.query(s,a)).rows};
export const log=(id,what)=>q('insert into events(doc_id,what) values($1,$2)',[id,what]);
