"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Phase = "menu" | "playing" | "upgrade" | "gameover" | "victory";
type EnemyKind = "grunt" | "runner" | "brute" | "boss";
type Enemy = { id:number; x:number; y:number; hp:number; maxHp:number; speed:number; kind:EnemyKind; cooldown:number; flash:number };
type Bullet = { id:number; x:number; y:number; vx:number; vy:number; damage:number; life:number };
type Troop = { id:number; x:number; y:number; cooldown:number; life:number };
type FloatText = { id:number; x:number; y:number; text:string; life:number; accent:boolean };

type Save = { best:number; highestWave:number; games:number };

const W=1200, H=675, GROUND=510;
const defaultSave:Save={best:0,highestWave:0,games:0};

function readSave():Save{ if(typeof window==="undefined") return defaultSave; try{return {...defaultSave,...JSON.parse(localStorage.getItem("sgl-last-stand")||"{}")};}catch{return defaultSave;} }

export default function LastStandGameV6(){
 const canvas=useRef<HTMLCanvasElement>(null);
 const raf=useRef<number|null>(null);
 const keys=useRef(new Set<string>());
 const mouse=useRef({x:850,y:350,down:false});
 const audio=useRef<AudioContext|null>(null);
 const world=useRef({phase:"menu" as Phase,wave:1,hp:100,ammo:12,cash:120,kills:0,score:0,mag:12,damage:1,medic:0,troops:0,enemies:[] as Enemy[],bullets:[] as Bullet[],support:[] as Troop[],floats:[] as FloatText[],boss:false,bossSpawned:false,spawnTimer:0,intermission:0,playerX:180,playerY:GROUND-70,aim:0,shake:0,flash:0,nextId:1,muted:false,highScore:readSave().best});
 const [phase,setPhase]=useState<Phase>("menu");
 const [hud,setHud]=useState({wave:1,hp:100,ammo:12,cash:120,kills:0,score:0,high:readSave().best,boss:false});
 const [upgradeTick,setUpgradeTick]=useState(0);
 const [save,setSave]=useState<Save>(readSave);

 const sync=useCallback(()=>{const s=world.current;setHud({wave:s.wave,hp:Math.max(0,Math.ceil(s.hp)),ammo:s.ammo,cash:s.cash,kills:s.kills,score:s.score,high:s.highScore,boss:s.boss});setPhase(s.phase);},[]);
 const beep=useCallback((freq:number,duration:number,type:OscillatorType="square")=>{const s=world.current;if(s.muted||typeof window==="undefined")return;try{audio.current??=new AudioContext();const c=audio.current,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.035,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+duration);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+duration);}catch{}},[]);
 const reset=useCallback(()=>{const s=world.current;s.phase="playing";s.wave=1;s.hp=100;s.ammo=s.mag=12;s.cash=120;s.kills=0;s.score=0;s.damage=1;s.medic=0;s.troops=0;s.enemies=[];s.bullets=[];s.support=[];s.floats=[];s.boss=false;s.bossSpawned=false;s.spawnTimer=0;s.intermission=0;s.playerX=180;s.shake=0;s.flash=0;s.nextId=1;setSave(readSave());sync();beep(220,.08);},[beep,sync]);
 const addFloat=(x:number,y:number,text:string,accent=false)=>world.current.floats.push({id:world.current.nextId++,x,y,text,life:1,accent});
 const spawnWave=useCallback(()=>{const s=world.current;s.enemies=[];s.boss=s.wave%5===0;s.bossSpawned=false;const count=s.boss?4+Math.floor(s.wave/2):Math.min(8+Math.floor(s.wave*1.6),22);for(let i=0;i<count;i++){const r=Math.random();const kind:EnemyKind=s.boss&&i===count-1?"boss":s.wave>3&&r>.88?"brute":r>.72?"runner":"grunt";const max=kind==="boss"?90+s.wave*14:kind==="brute"?7+Math.floor(s.wave/2):kind==="runner"?2+Math.floor(s.wave/5):1+Math.floor(s.wave/7);s.enemies.push({id:s.nextId++,x:W+70+i*70+Math.random()*300,y:GROUND-46,hp:max,maxHp:max,speed:kind==="boss"?.18:kind==="brute"?.32:kind==="runner"?1.15:.58,speed:0,speed:0, cooldown:0,flash:0} as Enemy);} },[]);
 useEffect(()=>{spawnWave();},[spawnWave]);
 const buy=(type:"damage"|"mag"|"medic"|"troop")=>{const s=world.current;const prices={damage:90,mag:110,medic:130,troop:180};const cost=prices[type];if(s.cash<cost)return;s.cash-=cost;if(type==="damage")s.damage+=1;if(type==="mag")s.mag+=4;if(type==="medic")s.medic+=2;if(type==="troop"){s.troops+=1;s.support.push({id:s.nextId++,x:s.playerX-35,y:GROUND-55,cooldown:0,life:99999});}setUpgradeTick(v=>v+1);beep(type==="damage"?620:420,.08,"triangle");sync();};
 const startUpgrade=()=>{const s=world.current;s.phase="upgrade";s.intermission=5;sync();beep(440,.12);};
 const chooseUpgrade=(type:"damage"|"mag"|"medic"|"troop")=>{buy(type);world.current.phase="playing";world.current.intermission=0;setPhase("playing");spawnWave();};
 const finish=(victory:boolean)=>{const s=world.current;s.phase=victory?"victory":"gameover";s.boss=false;s.enemies=[];s.bullets=[];s.support=[];const old=readSave();const next={best:Math.max(old.best,s.score),highestWave:Math.max(old.highestWave,s.wave),games:old.games+1};localStorage.setItem("sgl-last-stand",JSON.stringify(next));setSave(next);s.highScore=next.best;sync();beep(victory?880:90,.2,victory?"triangle":"sawtooth");};
 useEffect(()=>{const c=canvas.current;if(!c)return;const ctx=c.getContext("2d");if(!ctx)return;let last=performance.now();
 const resize=()=>{const d=Math.min(2,window.devicePixelRatio||1);c.width=W*d;c.height=H*d;ctx.setTransform(d,0,0,d,0,0);};resize();addEventListener("resize",resize);
 const aim=(clientX:number,clientY:number)=>{const r=c.getBoundingClientRect();mouse.current.x=(clientX-r.left)/r.width*W;mouse.current.y=(clientY-r.top)/r.height*H;};
 const fire=()=>{const s=world.current;if(s.phase!=="playing"||s.ammo<=0)return;const dx=mouse.current.x-(s.playerX+34),dy=mouse.current.y-(s.playerY+25),len=Math.hypot(dx,dy)||1;const speed=17;s.bullets.push({id:s.nextId++,x:s.playerX+38,y:s.playerY+26,vx:dx/len*speed,vy:dy/len*speed,damage:s.damage,life:1});s.ammo--;s.shake=2;s.flash=.1;beep(150,.035);if(s.ammo===0)beep(80,.06);sync();};
 const onMove=(e:PointerEvent)=>aim(e.clientX,e.clientY);const onDown=(e:PointerEvent)=>{aim(e.clientX,e.clientY);mouse.current.down=true;fire();};const onUp=()=>mouse.current.down=false;c.addEventListener("pointermove",onMove);c.addEventListener("pointerdown",onDown);addEventListener("pointerup",onUp);
 const down=(e:KeyboardEvent)=>{keys.current.add(e.key.toLowerCase());if(e.code==="Space"){e.preventDefault();fire();}if(e.key.toLowerCase()==="r"){world.current.ammo=world.current.mag;beep(280,.08);sync();}if(e.key.toLowerCase()==="m"){world.current.muted=!world.current.muted;}};const up=(e:KeyboardEvent)=>keys.current.delete(e.key.toLowerCase());addEventListener("keydown",down);addEventListener("keyup",up);
 const draw=()=>{const s=world.current;ctx.clearRect(0,0,W,H);ctx.save();if(s.shake>0){ctx.translate((Math.random()-.5)*s.shake*5,(Math.random()-.5)*s.shake*5);s.shake*=.82;}const sky=ctx.createLinearGradient(0,0,0,GROUND);sky.addColorStop(0,"#0d1720");sky.addColorStop(.55,"#24323b");sky.addColorStop(1,"#4b4b43");ctx.fillStyle=sky;ctx.fillRect(0,0,W,GROUND);ctx.fillStyle="#111417";ctx.fillRect(0,GROUND,W,H-GROUND);
 for(let i=0;i<18;i++){ctx.fillStyle=i%2?"#30393b":"#263033";ctx.fillRect(i*83,GROUND-100-(i%4)*14,44,100+(i%4)*14);}
 ctx.fillStyle="#1c2224";ctx.fillRect(0,GROUND-12,W,12);ctx.strokeStyle="#3e4948";ctx.lineWidth=2;for(let x=0;x<W;x+=55){ctx.beginPath();ctx.moveTo(x,GROUND);ctx.lineTo(x+30,H);ctx.stroke();}
 ctx.fillStyle="#39433f";ctx.fillRect(80,GROUND-115,115,103);ctx.fillStyle="#20282a";ctx.fillRect(98,GROUND-92,34,36);ctx.fillRect(154,GROUND-92,34,36);ctx.fillStyle="#56605c";ctx.fillRect(445,GROUND-75,130,63);ctx.fillStyle="#171c1d";ctx.fillRect(466,GROUND-52,88,40);ctx.fillStyle="#4b534f";ctx.fillRect(880,GROUND-135,70,123);ctx.fillStyle="#171b1c";ctx.fillRect(892,GROUND-112,46,36);
 // player
 const px=s.playerX,py=s.playerY;ctx.fillStyle="#c48f67";ctx.beginPath();ctx.arc(px+20,py+10,12,0,Math.PI*2);ctx.fill();ctx.fillStyle="#202a26";ctx.fillRect(px+8,py+21,25,34);ctx.fillStyle="#101416";ctx.fillRect(px+5,py+52,10,17);ctx.fillRect(px+26,py+52,10,17);const adx=mouse.current.x-(px+20),ady=mouse.current.y-(py+28),al=Math.hypot(adx,ady)||1;ctx.save();ctx.translate(px+22,py+30);ctx.rotate(Math.atan2(ady,adx));ctx.fillStyle="#0b0d0e";ctx.fillRect(0,-4,58,8);ctx.fillStyle="#747c78";ctx.fillRect(20,-3,24,6);if(s.flash>0){ctx.fillStyle="#ffd66b";ctx.beginPath();ctx.moveTo(58,0);ctx.lineTo(77,-8);ctx.lineTo(71,0);ctx.lineTo(77,8);ctx.closePath();ctx.fill();}ctx.restore();
 // troops
 for(const t of s.support){ctx.fillStyle="#6d7f72";ctx.fillRect(t.x,t.y,20,28);ctx.fillStyle="#b98a63";ctx.beginPath();ctx.arc(t.x+10,t.y-2,7,0,Math.PI*2);ctx.fill();}
 // enemies
 for(const e of s.enemies){const boss=e.kind==="boss",col=boss?"#7f3029":e.kind==="brute"?"#572d2a":e.kind==="runner"?"#68716e":"#4a5553";ctx.fillStyle=col;ctx.fillRect(e.x,e.y-(boss?25:0),boss?56:e.kind==="brute"?40:26,boss?70:e.kind==="brute"?62:48);ctx.fillStyle="#e65d36";ctx.fillRect(e.x+6,e.y-(boss?12:8),7,7);ctx.fillRect(e.x+(boss?40:16),e.y-(boss?12:8),7,7);ctx.fillStyle="#171b1c";ctx.fillRect(e.x,e.y-18,boss?56:30,5);ctx.fillStyle="#f06422";ctx.fillRect(e.x,e.y-18,(boss?56:30)*(e.hp/e.maxHp),5);if(boss){ctx.strokeStyle="#f06422";ctx.lineWidth=2;ctx.strokeRect(e.x-3,e.y-28,62,78);}}
 // bullets
 for(const b of s.bullets){ctx.strokeStyle="#ffe9ad";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx*.65,b.y-b.vy*.65);ctx.stroke();}
 // floats
 ctx.font="900 16px system-ui";ctx.textAlign="center";for(const f of s.floats){ctx.globalAlpha=Math.max(0,f.life);ctx.fillStyle=f.accent?"#ff8a4c":"#f3eee4";ctx.fillText(f.text,f.x,f.y-(1-f.life)*30);ctx.globalAlpha=1;}
 // vignette
 const v=ctx.createRadialGradient(W/2,H/2,180,W/2,H/2,650);v.addColorStop(0,"rgba(0,0,0,0)");v.addColorStop(1,"rgba(0,0,0,.6)");ctx.fillStyle=v;ctx.fillRect(0,0,W,H);ctx.restore();
 raf.current=requestAnimationFrame(step);
 };
 const step=(now:number)=>{const dt=Math.min(.035,(now-last)/1000);last=now;const s=world.current;
 if(s.phase==="playing"){const move=(keys.current.has("a")||keys.current.has("arrowleft")?-1:0)+(keys.current.has("d")||keys.current.has("arrowright")?1:0);s.playerX=Math.max(90,Math.min(330,s.playerX+move*190*dt));if(mouse.current.down)fire();s.flash=Math.max(0,s.flash-dt);s.spawnTimer+=dt;
  if(s.medic>0)s.hp=Math.min(100,s.hp+s.medic*.22*dt);
  for(const e of s.enemies){e.x-=e.speed*60*dt;e.cooldown=Math.max(0,e.cooldown-dt);e.flash=Math.max(0,e.flash-dt);if(e.x<s.playerX+45){s.hp-=e.kind==="boss"?22*dt:e.kind==="brute"?12*dt:e.kind==="runner"?8*dt:5*dt;e.x=s.playerX+46;s.shake=3;}}
  for(const t of s.support){t.cooldown-=dt;if(t.cooldown<=0){const target=s.enemies.find(e=>e.x>t.x);if(target){target.hp-=s.damage*.8;t.cooldown=1.1;addFloat(target.x,target.y-20,"+ HIT",false);}}}
  for(const b of s.bullets){b.x+=b.vx*60*dt;b.y+=b.vy*60*dt;b.life-=dt;const target=s.enemies.find(e=>Math.hypot(e.x+15-b.x,e.y+10-b.y)<32);if(target){target.hp-=b.damage;b.life=0;target.flash=.08;s.cash+=10;s.score+=25;addFloat(target.x,target.y-25,"+$10",true);beep(520,.025,"triangle");}}
  s.bullets=s.bullets.filter(b=>b.life>0&&b.x>-20&&b.x<W+30);s.floats=s.floats.filter(f=>{f.life-=dt;f.y-=12*dt;return f.life>0});
  const dead=s.enemies.filter(e=>e.hp<=0);if(dead.length){for(const e of dead){s.kills++;s.score+=e.kind==="boss"?2500:e.kind==="brute"?120:e.kind==="runner"?70:40;if(e.kind==="boss"){s.bossSpawned=true;s.cash+=1000;addFloat(e.x,e.y,"BOSS DOWN +$1000",true);}}s.enemies=s.enemies.filter(e=>e.hp>0);}
  if(s.hp<=0){finish(false);}
  else if(s.enemies.length===0){if(s.bossSpawned){finish(true);}else{startUpgrade();}}
 }
 if(s.phase==="upgrade"){s.intermission-=dt;if(s.intermission<=0){s.phase="playing";s.wave++;spawnWave();sync();}}
 sync();draw();};
 raf.current=requestAnimationFrame(step);
 return()=>{if(raf.current)cancelAnimationFrame(raf.current);removeEventListener("resize",resize);c.removeEventListener("pointermove",onMove);c.removeEventListener("pointerdown",onDown);removeEventListener("pointerup",onUp);removeEventListener("keydown",down);removeEventListener("keyup",up);};
 },[beep,finish,sync,spawnWave]);
 const overlay=phase!=="playing";
 return <div className="relative overflow-hidden rounded-sm border border-zinc-800 bg-[#090b0c] shadow-2xl">
  <canvas ref={canvas} className="block h-auto w-full cursor-crosshair touch-none" aria-label="Last Stand game" />
  <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 md:p-5"><div className="flex gap-2 text-[9px] font-black uppercase tracking-[.16em]"><span className="bg-black/70 px-3 py-2 text-zinc-200">HP {hud.hp}</span><span className="bg-black/70 px-3 py-2 text-zinc-200">AMMO {hud.ammo}/{world.current.mag}</span><span className="bg-black/70 px-3 py-2 text-orange-400">${hud.cash}</span></div><div className="bg-black/70 px-3 py-2 text-[9px] font-black uppercase tracking-[.16em] text-zinc-200">WAVE {String(hud.wave).padStart(2,"0")} · {hud.score.toLocaleString()} XP</div></div>
  {hud.boss&&phase==="playing"&&<div className="pointer-events-none absolute left-1/2 top-20 -translate-x-1/2 bg-black/75 px-5 py-2 text-[10px] font-black uppercase tracking-[.3em] text-orange-400">BOSS WAVE</div>}
  {overlay&&<div className="absolute inset-0 flex items-center justify-center bg-black/65 p-5 backdrop-blur-[3px]"><div className="w-full max-w-2xl text-center">{phase==="menu"&&<><p className="text-[10px] font-black uppercase tracking-[.4em] text-orange-500">Small Game Lab · Game 001</p><h2 className="mt-3 text-5xl font-black uppercase tracking-[-.05em] text-[#f2eee5] md:text-7xl">Hold the line.</h2><p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-zinc-400">A fast, brutal little defence game. Aim with the mouse, move with A/D, fire with click or Space. Survive. Upgrade. Come back stronger.</p><button onClick={reset} className="pointer-events-auto mt-7 bg-orange-500 px-8 py-4 text-[10px] font-black uppercase tracking-[.22em] text-black">Deploy</button><p className="mt-4 text-[9px] font-black uppercase tracking-[.18em] text-zinc-600">R reload · M mute · best {save.best.toLocaleString()}</p></>}
  {phase==="upgrade"&&<><p className="text-[10px] font-black uppercase tracking-[.35em] text-orange-500">Wave clear</p><h2 className="mt-2 text-4xl font-black uppercase text-[#f2eee5]">Choose your edge.</h2><p className="mt-2 text-xs uppercase tracking-[.15em] text-zinc-500">Cash ${hud.cash} · Next wave {hud.wave+1}</p><div className="pointer-events-auto mt-7 grid gap-3 sm:grid-cols-2"><button onClick={()=>chooseUpgrade("damage")} className="border border-zinc-700 bg-zinc-900 p-5 text-left hover:border-orange-500"><b className="block text-sm uppercase">Heavy rounds</b><span className="mt-1 block text-xs text-zinc-500">+1 damage · $90</span></button><button onClick={()=>chooseUpgrade("mag")} className="border border-zinc-700 bg-zinc-900 p-5 text-left hover:border-orange-500"><b className="block text-sm uppercase">Extended mag</b><span className="mt-1 block text-xs text-zinc-500">+4 magazine · $110</span></button><button onClick={()=>chooseUpgrade("medic")} className="border border-zinc-700 bg-zinc-900 p-5 text-left hover:border-orange-500"><b className="block text-sm uppercase">Field medic</b><span className="mt-1 block text-xs text-zinc-500">Regenerate HP · $130</span></button><button onClick={()=>chooseUpgrade("troop")} className="border border-zinc-700 bg-zinc-900 p-5 text-left hover:border-orange-500"><b className="block text-sm uppercase">Rifleman</b><span className="mt-1 block text-xs text-zinc-500">Adds automatic support · $180</span></button></div></>}
  {(phase==="gameover"||phase==="victory")&&<><p className="text-[10px] font-black uppercase tracking-[.35em] text-orange-500">{phase==="victory"?"Sector secured":"Position lost"}</p><h2 className="mt-2 text-5xl font-black uppercase text-[#f2eee5]">{phase==="victory"?"You held the line.":"Line lost."}</h2><div className="mx-auto mt-5 grid max-w-md grid-cols-3 gap-px bg-zinc-800"><div className="bg-black/80 p-4"><b className="block text-xl">{hud.wave}</b><span className="text-[9px] uppercase tracking-widest text-zinc-500">Wave</span></div><div className="bg-black/80 p-4"><b className="block text-xl">{hud.kills}</b><span className="text-[9px] uppercase tracking-widest text-zinc-500">Kills</span></div><div className="bg-black/80 p-4"><b className="block text-xl">{hud.score.toLocaleString()}</b><span className="text-[9px] uppercase tracking-widest text-zinc-500">Score</span></div></div><button onClick={reset} className="pointer-events-auto mt-7 bg-orange-500 px-8 py-4 text-[10px] font-black uppercase tracking-[.22em] text-black">Deploy again</button></>}
  </div></div>}
  <div className="flex items-center justify-between border-t border-zinc-800 bg-[#101214] px-4 py-3 text-[9px] font-black uppercase tracking-[.16em] text-zinc-600"><span>FIELD TEST · BUILD 0.5</span><span className="hidden sm:block">A/D MOVE · CLICK/SPACE FIRE · R RELOAD · M MUTE</span><span>{hud.kills} KILLS</span></div>
 </div>;
}
