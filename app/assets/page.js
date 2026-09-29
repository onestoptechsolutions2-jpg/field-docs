import {q} from '@/lib/db';import {need} from '@/lib/auth';import Shell from '@/components/Shell';import AssetAdmin from '@/components/AssetAdmin';import Pager from '@/components/Pager';
export const dynamic='force-dynamic';
const PS=50;
export default async function A({searchParams}){const u=await need(),s=searchParams.q||'',page=Math.max(1,+searchParams.page||1);
 const rows=await q(`select a.*,coalesce(json_agg(json_build_object('id',w.id,'num',w.num,'service',w.service,'status',w.status) order by w.created_at) filter (where w.id is not null),'[]') wos from assets a left join wo_assets x on x.asset_id=a.id left join work_orders w on w.id=x.wo_id where ($1='' or a.name ilike '%'||$1||'%' or a.serial ilike '%'||$1||'%' or a.client ilike '%'||$1||'%' or a.model ilike '%'||$1||'%') group by a.id order by a.created_at desc limit $2 offset $3`,[s,PS+1,(page-1)*PS]);
 const hasNext=rows.length>PS,show=rows.slice(0,PS);
 return <Shell u={u}><h2 style={{marginTop:0}}>Asset history</h2><form className="row" style={{marginBottom:10}}><input name="q" defaultValue={s} placeholder="Search asset, serial, model or client…"/><button className="btn">Search</button></form>
  <div className="tw"><AssetAdmin rows={JSON.parse(JSON.stringify(show))} canEdit={u.role!=='tech'}/></div>
  <Pager page={page} hasNext={hasNext} makeHref={p=>'/assets?'+new URLSearchParams({...(s?{q:s}:{}),page:p})}/></Shell>}
