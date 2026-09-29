let C={s:8,e:17,days:[1,2,3,4,5],hol:[]};
export const setCal=c=>{C={...C,...c}};
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const isWork=d=>C.days.includes(d.getDay())&&!C.hol.includes(ymd(d));
export function workMs(a,b){a=+a;b=+b;if(b<=a)return 0;let t=0;const d=new Date(a);d.setHours(0,0,0,0);
 while(+d<b){if(isWork(d)){const s=Math.max(+d+C.s*36e5,a),e=Math.min(+d+C.e*36e5,b);if(e>s)t+=e-s}d.setDate(d.getDate()+1)}return t}
export function addWork(a,ms){let t=+a;const d=new Date(t);d.setHours(0,0,0,0);
 for(let i=0;i<900;i++){if(isWork(d)){const s=Math.max(+d+C.s*36e5,t),e=+d+C.e*36e5;if(e>s){const av=e-s;if(ms<=av)return new Date(s+ms);ms-=av}}d.setDate(d.getDate()+1)}return new Date(t+ms)}
export const isWorkDay=d=>isWork(d);
export const dur=ms=>{ms=Math.abs(ms);const m=Math.floor(ms/6e4);if(m<1)return '<1m';const H=Math.floor(m/60),mm=m%60;if(H>=48)return `${Math.floor(H/24)}d ${H%24}h`;return H?`${H}h ${String(mm).padStart(2,'0')}m`:`${mm}m`};
export const planFmt=m=>m>=540&&m%540===0?m/540+'d':m>=60&&m%60===0?m/60+'h':m<60?m+'m':Math.floor(m/60)+'h '+m%60+'m';
