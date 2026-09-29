import {redirect} from 'next/navigation';import {getSet} from '@/lib/db';import {need} from '@/lib/auth';import {TEAM_LIST} from '@/lib/workflows';import {BASE_PARTIES,extraTeams,extraParties} from '@/lib/lists';import Shell from '@/components/Shell';import SettingsForm from '@/components/SettingsForm';import ListsForm from '@/components/ListsForm';
export const dynamic='force-dynamic';
export default async function P(){const u=await need();if(u.role!=='admin')redirect('/');let c={s:8,e:17,days:[1,2,3,4,5],hol:[]};try{c={...c,...JSON.parse(await getSet('cal'))}}catch(e){}
 return <Shell u={u}><p className="mut noprint" style={{marginTop:0}}><a href="/settings">‹ Settings</a></p><h2 style={{marginTop:0}}>Working calendar</h2><SettingsForm c={c}/>
  <ListsForm base={TEAM_LIST} extraTeams={await extraTeams()} baseParties={BASE_PARTIES} extraParties={await extraParties()}/></Shell>}
