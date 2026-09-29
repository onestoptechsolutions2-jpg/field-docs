import {getSet,setSet} from './db';import {TEAM_LIST} from './workflows';
export const BASE_PARTIES=['Client','Supplier','Management','Procurement','Sales & Marketing','Technical Sales','Site access','Materials','Information','Approval','Third party'];
const arr=async k=>{try{return JSON.parse(await getSet(k)||'[]')}catch(e){return []}};
export const extraTeams=()=>arr('teams');
export const extraParties=()=>arr('parties');
export async function teamList(){return [...new Set([...TEAM_LIST,...(await extraTeams())])]}
export async function partyList(){return [...new Set([...BASE_PARTIES,...(await extraParties())])]}
export const saveTeams=list=>setSet('teams',JSON.stringify(list));
export const saveParties=list=>setSet('parties',JSON.stringify(list));
