import {NextResponse} from 'next/server';import {getUser} from '@/lib/auth';import {q,setSet} from '@/lib/db';
export async function POST(r){const u=await getUser();if(u?.role!=='admin')return NextResponse.json({error:'Admins only'},{status:403});
 const b=await r.json(),s=+b.s,e=+b.e,days=(b.days||[]).map(Number).filter(d=>d>=0&&d<=6),hol=(b.hol||'').split(/[\s,]+/).filter(x=>/^\d{4}-\d\d-\d\d$/.test(x));
 if(!(s>=0&&e<=24&&s<e))return NextResponse.json({error:'Start must be before end (0–24)'},{status:400});
 await setSet('cal',JSON.stringify({s,e,days,hol}));return NextResponse.json({ok:1})}
