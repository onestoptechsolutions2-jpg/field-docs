import {q} from './db';
export const audit=(u,action,target,detail)=>q('insert into audit_log(user_id,user_name,action,target,detail) values($1,$2,$3,$4,$5)',[u?.id||null,u?.name||'System',action,target||null,detail||null]);
