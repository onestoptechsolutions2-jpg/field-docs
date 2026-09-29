'use client';
import {useRef,useEffect} from 'react';
export default function Sig({value,onChange}){
 const ref=useRef();
 useEffect(()=>{const c=ref.current;if(!c)return;const r=c.getBoundingClientRect(),x=c.getContext('2d');c.width=r.width*2;c.height=r.height*2;x.scale(2,2);x.lineWidth=2;x.lineCap='round';x.strokeStyle='#111';
  if(value){const i=new Image();i.onload=()=>x.drawImage(i,0,0,r.width,r.height);i.src=value}},[]);
 if(!onChange)return <div className="pad">{value&&<img src={value} alt="signature"/>}</div>;
 let dn=false;const p=e=>{const b=ref.current.getBoundingClientRect();return[e.clientX-b.left,e.clientY-b.top]};
 return <div className="pad"><canvas ref={ref}
  onPointerDown={e=>{dn=true;e.target.setPointerCapture(e.pointerId);const x=ref.current.getContext('2d');x.beginPath();x.moveTo(...p(e))}}
  onPointerMove={e=>{if(dn){const x=ref.current.getContext('2d');x.lineTo(...p(e));x.stroke()}}}
  onPointerUp={()=>{if(dn){dn=false;onChange(ref.current.toDataURL())}}}/>
  <button type="button" onClick={()=>{const c=ref.current;c.getContext('2d').clearRect(0,0,c.width,c.height);onChange(null)}}>Clear</button></div>};
