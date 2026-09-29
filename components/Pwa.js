'use client';
import {useEffect,useState} from 'react';
const b64=s=>{const r=atob((s+'='.repeat((4-s.length%4)%4)).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from([...r].map(c=>c.charCodeAt(0)))};
export default function Pwa(){
 const [ip,setIp]=useState(null),[sub,setSub]=useState(true),[ios,setIos]=useState(false),[can,setCan]=useState(false);
 useEffect(()=>{
  if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').then(async reg=>{
   if('PushManager' in window&&'Notification' in window){setCan(true);const s=await reg.pushManager.getSubscription();setSub(!!s&&Notification.permission==='granted')}}).catch(()=>{});
  const h=e=>{e.preventDefault();setIp(e)};addEventListener('beforeinstallprompt',h);
  setIos(/iphone|ipad/i.test(navigator.userAgent)&&!navigator.standalone);
  return()=>removeEventListener('beforeinstallprompt',h)},[]);
 const enable=async()=>{try{const reg=await navigator.serviceWorker.ready;if(await Notification.requestPermission()!=='granted')return;
  const {key}=await (await fetch('/api/push/key')).json();
  const s=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(key)});
  await fetch('/api/push/subscribe',{method:'POST',body:JSON.stringify(s)});setSub(true)}catch(e){alert('Could not enable alerts. Notifications need HTTPS and a supported browser.')}};
 return <>{ip&&<button className="btn" onClick={()=>{ip.prompt();setIp(null)}}>⬇ Install app</button>}{ios&&<span className="mut">Install: Share → Add to Home Screen</span>}{can&&!sub&&<button className="btn" onClick={enable}>🔔 Enable alerts</button>}</>}
