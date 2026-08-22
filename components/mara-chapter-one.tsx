"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Enemy = { id:number; x:number; y:number; hp:number; maxHp:number; kind:"bug"|"soldier"|"brute"; vx:number; phase:number };
type Bullet = { id:number; x:number; y:number; vx:number; vy:number; life:number; kind:"pistol"|"burst"|"rocket" };
type Spark = { id:number; x:number; y:number; vx:number; vy:number; life:number; size:number };
type Pickup = { id:number; x:number; y:number; kind:"xp"|"health"|"weapon" };

const VW=1280, VH=720, GROUND=585;

export default function MaraChapterOne(){
 const keys=useRef(new Set<string>());
 const raf=useRef<number>(0);
 const nextId=useRef(1);
 const [started,setStarted]=useState(false);
 const [dead,setDead]=useState(false);
 const [paused,setPaused]=useState(false);
 const [hp,setHp]=useState(100);
 const [xp,setXp]=useState(0);
 const [level,setLevel]=useState(1);
 const [score,setScore]=useState(0);
 const [weapon,setWeapon]=useState<"pistol"|"burst"|"rocket">("pistol");
 const [wave,setWave]=useState(1);
 const [muzzle,setMuzzle]=useState(0);
 const [shake,setShake]=useState(0);
 const [world,setWorld]=useState({x:240,y:GROUND-72,vy:0,onGround:true,face:1,dash:0});
 const [enemies,setEnemies]=useState<Enemy[]>([]);
 const [bullets,setBullets]=useState<Bullet[]>([]);
 const [sparks,setSparks]=useState<Spark[]>([]);
 const [pickups,setPickups]=useState<Pickup[]>([]);
 const [flash,setFlash]=useState(0);
 const scoreRef=useRef(0), xpRef=useRef(0), levelRef=useRef(1), hpRef=useRef(100), waveRef=useRef(1), lastShot=useRef(0), spawnClock=useRef(0), worldRef=useRef(world), enemyRef=useRef<Enemy[]>([]), bulletRef=useRef<Bullet[]>([]), sparkRef=useRef<Spark[]>([]), pickupRef=useRef<Pickup[]>([]);

 useEffect(()=>{worldRef.current=world},[world]);
 useEffect(()=>{enemyRef.current=enemies},[enemies]);
 useEffect(()=>{bulletRef.current=bullets},[bullets]);
 useEffect(()=>{sparkRef.current=sparks},[sparks]);
 useEffect(()=>{pickupRef.current=pickups},[pickups]);
 useEffect(()=>{hpRef.current=hp},[hp]);
 useEffect(()=>{xpRef.current=xp},[xp]);
 useEffect(()=>{levelRef.current=level},[level]);
 useEffect(()=>{waveRef.current=wave},[wave]);

 useEffect(()=>{
  const down=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();keys.current.add(k);if([" ","arrowup","arrowdown","arrowleft","arrowright"].includes(k))e.preventDefault();if(k==="escape")setPaused(v=>!v)};
  const up=(e:KeyboardEvent)=>keys.current.delete(e.key.toLowerCase());
  addEventListener("keydown",down);addEventListener("keyup",up);
  return()=>{removeEventListener("keydown",down);removeEventListener("keyup",up)};
 },[]);

 const burst=(x:number,y:number,count=7,colour="#ffcf67")=>{
  const s=Array.from({length:count},()=>{const a=Math.random()*Math.PI*2,v=2+Math.random()*6;return{id:nextId.current++,x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.35+Math.random()*.35,size:2+Math.random()*4}});
  sparkRef.current=[...sparkRef.current,...s];setSparks(sparkRef.current);
 };

 const fire=()=>{
  const now=performance.now();const p=worldRef.current;const cooldown=weapon==="pistol"?260:weapon==="burst"?120:650;if(now-lastShot.current<cooldown)return;lastShot.current=now;setMuzzle(1);setTimeout(()=>setMuzzle(0),70);
  const dir=p.face;const shots:Bullet[]=weapon==="pistol"?[{id:nextId.current++,x:p.x+dir*45,y:p.y+12,vx:dir*18,vy:0,life:1,kind:"pistol"}]:weapon==="burst"?Array.from({length:3},(_,i)=>({id:nextId.current++,x:p.x+dir*45,y:p.y+8+(i-1)*5,vx:dir*19,vy:(i-1)*.9,life:1,kind:"burst" as const})):[{id:nextId.current++,x:p.x+dir*50,y:p.y+8,vx:dir*13,vy:0,life:1,kind:"rocket"}];
  bulletRef.current=[...bulletRef.current,...shots];setBullets(bulletRef.current);burst(p.x+dir*48,p.y+8,weapon==="rocket"?12:5,weapon==="rocket"?"#ff744d":"#ffe08a");
 };

 const start=()=>{
  scoreRef.current=0;xpRef.current=0;levelRef.current=1;hpRef.current=100;waveRef.current=1;spawnClock.current=0;
  setScore(0);setXp(0);setLevel(1);setHp(100);setWave(1);setDead(false);setPaused(false);setStarted(true);setWeapon("pistol");
  const initial:Enemy[]=Array.from({length:5},(_,i)=>({id:nextId.current++,x:900+i*145,y:GROUND-46,hp:35,maxHp:35,kind:"bug",vx:0,phase:i}));
  enemyRef.current=initial;bulletRef.current=[];sparkRef.current=[];pickupRef.current=[];setEnemies(initial);setBullets([]);setSparks([]);setPickups([]);setWorld({x:240,y:GROUND-72,vy:0,onGround:true,face:1,dash:0});
 };

 useEffect(()=>{
  if(!started||dead||paused)return;
  let last=performance.now();
  const tick=(now:number)=>{
   const dt=Math.min((now-last)/16.67,2);last=now;
   const p={...worldRef.current};const ks=keys.current;
   const left=ks.has("a")||ks.has("arrowleft"),right=ks.has("d")||ks.has("arrowright"),jump=ks.has("w")||ks.has(" ")||ks.has("arrowup"),dash=ks.has("shift");
   const speed=dash?8.5:4.8;
   if(left){p.x-=speed*dt;p.face=-1} if(right){p.x+=speed*dt;p.face=1}
   p.x=Math.max(110,Math.min(520,p.x));
   if(jump&&p.onGround){p.vy=-14;p.onGround=false}
   p.vy+=.72*dt;p.y+=p.vy*dt;if(p.y>=GROUND-72){p.y=GROUND-72;p.vy=0;p.onGround=true}
   if(dash&&p.dash<=0){p.x=Math.max(100,Math.min(560,p.x+p.face*95));p.dash=.7;burst(p.x,p.y+40,10,"#65d8ff")} else p.dash=Math.max(0,p.dash-dt/60);
   if(ks.has("j")||ks.has("k")||ks.has("enter"))fire();
   const nowBullets=bulletRef.current.map(b=>({...b,x:b.x+b.vx*dt,y:b.y+b.vy*dt,life:b.life-dt/60})).filter(b=>b.life>0&&b.x>-50&&b.x<VW+50);
   const nextEnemies=enemyRef.current.map(e=>{const dx=p.x-e.x;const speed=e.kind==="brute"?.65:e.kind==="soldier"?1.05:1.5;return {...e,x:e.x+(Math.abs(dx)>65?Math.sign(dx)*speed*dt:0),phase:e.phase+dt*.1}});
   const newSparks=sparkRef.current.map(s=>({...s,x:s.x+s.vx*dt,y:s.y+s.vy*dt,vy:s.vy+.35*dt,life:s.life-dt/60})).filter(s=>s.life>0);
   const newPickups=pickupRef.current.filter(o=>Math.hypot(o.x-p.x,o.y-(p.y+30))>35);
   let gainedXp=0, gainedScore=0, hit=false;
   for(const b of nowBullets){for(const e of nextEnemies){if(e.hp<=0)continue;if(Math.hypot(e.x-b.x,e.y-b.y)<46){const dmg=b.kind==="rocket"?55:b.kind==="burst"?13:22;e.hp-=dmg;hit=true;burst(e.x,e.y,8,b.kind==="rocket"?"#ff5d4d":"#ffd166");b.life=0;if(e.hp<=0){gainedXp+=e.kind==="brute"?30:e.kind==="soldier"?18:10;gainedScore+=e.kind==="brute"?120:e.kind==="soldier"?65:30;if(Math.random()<.18)newPickups.push({id:nextId.current++,x:e.x,y:e.y,kind:"xp"})}}}}
   let damage=0;for(const e of nextEnemies){if(e.hp<=0)continue;if(Math.hypot(e.x-p.x,e.y-p.y)<55)damage+=e.kind==="brute"?18:e.kind==="soldier"?8:5}
   if(damage>0){hpRef.current=Math.max(0,hpRef.current-damage*dt/60);setHp(Math.round(hpRef.current));setFlash(1);setShake(.7)}
   if(gainedXp){xpRef.current+=gainedXp;scoreRef.current+=gainedScore;setXp(Math.floor(xpRef.current));setScore(Math.floor(scoreRef.current));}
   if(xpRef.current>=levelRef.current*100){xpRef.current-=levelRef.current*100;levelRef.current++;setLevel(levelRef.current);setXp(Math.floor(xpRef.current));setWeapon(w=>w==="pistol"?"burst":w==="burst"?"rocket":"rocket");burst(p.x,p.y,22,"#65d8ff");setShake(.5)}
   spawnClock.current+=dt/60;if(spawnClock.current>Math.max(.45,1.6-waveRef.current*.08)){spawnClock.current=0;const count=waveRef.current>3&&Math.random()>.72?2:1;for(let i=0;i<count;i++){const kind:Enemy["kind"]=Math.random()<.12+waveRef.current*.01?"brute":Math.random()<.3?"soldier":"bug";const hpv=kind==="brute"?150+waveRef.current*12:kind==="soldier"?70+waveRef.current*7:35+waveRef.current*4;nextEnemies.push({id:nextId.current++,x:VW+80+Math.random()*180,y:GROUND-(kind==="brute"?65:46),hp:hpv,maxHp:hpv,kind,vx:0,phase:Math.random()*10})}waveRef.current=Math.min(9,1+Math.floor(scoreRef.current/650));setWave(waveRef.current)}
   const remaining=nextEnemies.filter(e=>e.hp>0&&e.x>40);enemyRef.current=remaining;bulletRef.current=nowBullets; sparkRef.current=newSparks;pickupRef.current=newPickups;
   setEnemies(remaining);setBullets(nowBullets);setSparks(newSparks);setPickups(newPickups);setWorld(p);setShake(v=>Math.max(0,v-.05));
   if(hpRef.current<=0){setDead(true);setStarted(false);return}
   raf.current=requestAnimationFrame(tick);
  };
  raf.current=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf.current);
 },[started,dead,paused,weapon]);

 const stars=useMemo(()=>Array.from({length:34},(_,i)=>({x:(i*173)%VW,y:40+(i*71)%250,r:i%3===0?2:1})),[]);
 const runnerAnim=started?"animate-[maraRun_.18s_linear_infinite]":"";
 return <div className="overflow-hidden rounded-sm border border-zinc-800 bg-[#05070b] shadow-[0_30px_100px_rgba(0,0,0,.55)]">
  <div className="relative aspect-video select-none touch-none">
   <svg viewBox={`0 0 ${VW} ${VH}`} className="absolute inset-0 h-full w-full" role="img" aria-label="The Long Run chapter one gameplay">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#111c35"/><stop offset=".58" stopColor="#18243a"/><stop offset="1" stopColor="#070a10"/></linearGradient><linearGradient id="street" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#151b26"/><stop offset="1" stopColor="#080b11"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <rect width={VW} height={VH} fill="url(#sky)"/>
    {stars.map(s=><circle key={s.x+"-"+s.y} cx={s.x} cy={s.y} r={s.r} fill="#dcecff" opacity=".55"/>)}
    <g opacity=".8">{Array.from({length:16},(_,i)=>{const x=i*92-((world.x-240)*.12%92);const h=120+(i*67)%230;return <g key={i}><rect x={x} y={GROUND-h} width="70" height={h} fill={i%3===0?"#101621":"#0c121c"}/><rect x={x+9} y={GROUND-h+18} width="6" height="4" fill="#d94b2b" opacity=".7"/><rect x={x+29} y={GROUND-h+48} width="5" height="4" fill="#f4d56f" opacity=".5"/><rect x={x+50} y={GROUND-h+30} width="5" height="4" fill="#65d8ff" opacity=".5"/></g>})}</g>
    <g opacity=".28" transform={`translate(${-(world.x-240)*.25},0)`}><path d="M0 430L180 330L360 430L540 300L720 430L900 320L1080 430L1260 300L1440 430" fill="none" stroke="#d94b2b" strokeWidth="3"/><path d="M0 455L180 355L360 455L540 325L720 455L900 345L1080 455L1260 325L1440 455" fill="none" stroke="#65d8ff" strokeWidth="2"/></g>
    <rect y={GROUND} width={VW} height={VH-GROUND} fill="url(#street)"/>
    <path d={`M0 ${GROUND+60}H${VW}`} stroke="#303846" strokeWidth="3"/><path d={`M0 ${GROUND+112}H${VW}`} stroke="#11161f" strokeWidth="10"/>
    {Array.from({length:12},(_,i)=><rect key={i} x={i*120-((world.x-240)%120)} y={GROUND+20} width="64" height="7" rx="3" fill="#303846" opacity=".8"/>)}
    {enemies.map(e=><EnemyArt key={e.id} enemy={e}/>)}
    {pickups.map(o=><g key={o.id} filter="url(#glow)"><circle cx={o.x} cy={o.y} r="12" fill="#65d8ff" opacity=".25"/><path d={`M${o.x} ${o.y-9}l9 9-9 9-9-9z`} fill="#65d8ff"/></g>)}
    {bullets.map(b=><g key={b.id} filter="url(#glow)"><path d={`M${b.x-b.vx*.9} ${b.y}L${b.x} ${b.y}`} stroke={b.kind==="rocket"?"#ff684f":b.kind==="burst"?"#65d8ff":"#ffe18a"} strokeWidth={b.kind==="rocket"?10:4} strokeLinecap="round"/><circle cx={b.x} cy={b.y} r={b.kind==="rocket"?7:3} fill="#fff7d1"/></g>)}
    {sparks.map(s=><circle key={s.id} cx={s.x} cy={s.y} r={s.size} fill="#ffd166" opacity={Math.max(0,s.life*2)}/>)}
    <g className={runnerAnim} transform={`translate(${world.x} ${world.y}) scale(${world.face} 1)`}>
      <ellipse cx="0" cy="54" rx="32" ry="8" fill="#000" opacity=".45"/>
      <path d="M-24 45L-10 45L-6 4L-26 2Z" fill="#202733"/><path d="M8 45L24 45L27 2L7 4Z" fill="#202733"/>
      <path d="M-30 45h23l-3 9h-24zM9 45h23l4 9H9z" fill="#101318"/>
      <path d="M-27-2Q0-18 28-2L22 34Q0 47-24 34Z" fill="#d94b2b"/><path d="M-25 5Q0 16 25 5" fill="none" stroke="#ff8a5f" strokeWidth="3" opacity=".55"/>
      <path d="M-25 3L-42 23L-35 29L-13 13Z" fill="#202733"/><path d="M24 3L42 18L36 25L12 13Z" fill="#202733"/>
      <circle cx="0" cy="-28" r="19" fill="#b77b5a"/><path d="M-20-30Q-15-53 5-49Q23-45 21-25L12-35Q0-24-20-30Z" fill="#15191f"/><path d="M-15-26Q0-18 15-26" fill="none" stroke="#7d4436" strokeWidth="3"/>
      <path d="M-18-7Q0 1 18-7" fill="none" stroke="#171a20" strokeWidth="5"/>
      <path d="M15 5L50 8L48 16L13 13Z" fill="#222a35"/><path d="M45 6L62 12L58 18L43 14Z" fill="#65d8ff" opacity=".9"/>
      {muzzle>0&&<g filter="url(#glow)"><path d="M60 12l30-14-13 14 13 14z" fill="#ffd166"/><path d="M60 12l22-5-10 5 10 5z" fill="#fff7d1"/></g>}
    </g>
    <g transform="translate(28 24)"><rect width="360" height="70" rx="10" fill="#070a0f" opacity=".82" stroke="#39414e"/><text x="20" y="25" fill="#f5eee5" fontSize="13" fontWeight="900" letterSpacing="3">MARA VALE · COURIER 17</text><text x="20" y="50" fill="#8993a2" fontSize="11" fontWeight="700">DISTRICT 01  /  THE DELIVERY  /  RUN &amp; GUN</text></g>
    <g transform="translate(1000 24)"><rect width="250" height="70" rx="10" fill="#070a0f" opacity=".82" stroke="#39414e"/><text x="18" y="25" fill="#d94b2b" fontSize="11" fontWeight="900" letterSpacing="2">SCORE {Math.floor(score).toString().padStart(5,"0")}</text><text x="18" y="48" fill="#8993a2" fontSize="10" fontWeight="800">WAVE {wave}  ·  LEVEL {level}</text></g>
    <g transform="translate(28 110)"><rect width="220" height="13" rx="7" fill="#11161f"/><rect width={220*hp/100} height="13" rx="7" fill="#d94b2b"/><text x="0" y="34" fill="#8993a2" fontSize="9" fontWeight="900" letterSpacing="2">MARA / {Math.max(0,Math.round(hp))}%</text></g>
    <g transform="translate(28 650)"><rect width="350" height="36" rx="8" fill="#070a0f" opacity=".9" stroke="#303846"/><text x="16" y="23" fill="#8993a2" fontSize="10" fontWeight="900" letterSpacing="1.5">A/D MOVE · SPACE JUMP · J FIRE · SHIFT DASH</text></g>
    {flash>0&&<rect width={VW} height={VH} fill="#ff4d3d" opacity=".12"/>}
   </svg>
   {!started&&!dead&&<Overlay title="THE DELIVERY" eyebrow="THE LONG RUN · CHAPTER 01" text="Mara Vale has one package, one route and a city going into lockdown. Run the rooftops. Shoot what gets in your way. Find out why everyone wants the shard." button="START CHAPTER ONE" onClick={start}/>} 
   {dead&&<Overlay title="MARA IS DOWN" eyebrow="COURIER 17 · RUN ENDED" text={`Score ${Math.floor(score)} · Level ${level}. The shard is still with Mara. Run it again and push further into District 01.`} button="RUN IT AGAIN" onClick={start}/>} 
   {paused&&<div className="absolute inset-0 grid place-items-center bg-black/70 backdrop-blur-[2px]"><div className="text-center"><p className="text-[10px] font-black uppercase tracking-[.35em] text-[#d94b2b]">COURIER 17</p><h2 className="mt-2 text-5xl font-black uppercase">Paused</h2><button onClick={()=>setPaused(false)} className="mt-7 border border-zinc-700 bg-black/50 px-8 py-4 text-[10px] font-black uppercase tracking-[.2em]">Resume</button></div></div>}
   <div className="absolute bottom-4 right-4 flex gap-2 sm:hidden"><button onTouchStart={()=>{keys.current.add("arrowleft");setTimeout(()=>keys.current.delete("arrowleft"),180)}} className="h-12 w-12 rounded-full border border-white/20 bg-black/60 text-lg">←</button><button onTouchStart={()=>{keys.current.add(" ");setTimeout(()=>keys.current.delete(" "),180)}} className="h-14 w-14 rounded-full border border-[#d94b2b]/60 bg-[#d94b2b]/80 text-[9px] font-black text-black">JUMP</button><button onTouchStart={()=>{keys.current.add("j");setTimeout(()=>keys.current.delete("j"),180)}} className="h-12 w-12 rounded-full border border-[#65d8ff]/40 bg-black/60 text-[9px] font-black">FIRE</button><button onTouchStart={()=>{keys.current.add("arrowright");setTimeout(()=>keys.current.delete("arrowright"),180)}} className="h-12 w-12 rounded-full border border-white/20 bg-black/60 text-lg">→</button></div>
  </div>
  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-900 px-4 py-3 text-[9px] font-black uppercase tracking-[.16em] text-zinc-600"><span>THE LONG RUN / CHAPTER 01</span><span>RUN · GUN · JUMP · DASH · LEVEL</span><span>DESKTOP + MOBILE</span></div>
 </div>;
}

function EnemyArt({enemy:e}:{enemy:Enemy}){const c=e.kind==="brute"?"#7d3340":e.kind==="soldier"?"#4b6376":"#3f9c7a";const r=e.kind==="brute"?34:e.kind==="soldier"?25:19;return <g transform={`translate(${e.x} ${e.y})`}><ellipse cy="32" rx={r+8} ry="7" fill="#000" opacity=".4"/><path d={`M-${r} 10Q0 -${r} ${r} 10L${r-5} ${r+18}L-${r+5} ${r+18}Z`} fill={c} stroke="#15191f" strokeWidth="4"/><circle cy="-2" r={r*.55} fill="#111820"/><circle cx={-r*.2} cy="-4" r="3" fill="#ffcf67"/><circle cx={r*.2} cy="-4" r="3" fill="#ffcf67"/><path d={`M-${r*.6} ${r*.55}Q0 ${r*.9} ${r*.6} ${r*.55}`} fill="none" stroke="#e7edf2" strokeWidth="3" opacity=".7"/><rect x={-r} y={-r-13} width={r*2} height="5" rx="2" fill="#15191f"/><rect x={-r} y={-r-13} width={r*2*Math.max(0,e.hp/e.maxHp)} height="5" rx="2" fill="#d94b2b"/></g>}

function Overlay({title,eyebrow,text,button,onClick}:{title:string;eyebrow:string;text:string;button:string;onClick:()=>void}){return <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,rgba(27,38,58,.55),rgba(3,5,8,.9))] p-6 text-center backdrop-blur-[1px]"><div className="max-w-2xl"><p className="text-[10px] font-black uppercase tracking-[.4em] text-[#d94b2b]">{eyebrow}</p><h2 className="mt-4 text-6xl font-black uppercase leading-none tracking-[-.05em] text-white drop-shadow-2xl">{title}</h2><p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-zinc-300">{text}</p><button onClick={onClick} className="mt-8 bg-[#d94b2b] px-10 py-4 text-[10px] font-black uppercase tracking-[.22em] text-black shadow-[0_0_35px_rgba(217,75,43,.28)] transition hover:scale-105">{button}</button></div></div>}
