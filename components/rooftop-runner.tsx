"use client";

import { useEffect, useRef, useState } from "react";

type Player = { x: number; y: number; vy: number; onGround: boolean; dash: number };
type Block = { x: number; y: number; w: number; h: number; kind: "roof" | "crate" | "drone" };

const W = 960;
const H = 540;
const GRAVITY = 0.75;

export default function RooftopRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);
  const [dead, setDead] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const keys = useRef(new Set<string>());

  useEffect(() => {
    const saved = Number(localStorage.getItem("mara-best") || 0);
    setBest(saved);
    const down = (e: KeyboardEvent) => keys.current.add(e.key.toLowerCase());
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  useEffect(() => {
    if (!started || dead) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let raf = 0, last = performance.now(), world = 0, runScore = 0;
    const p: Player = { x: 180, y: 390, vy: 0, onGround: true, dash: 0 };
    let blocks: Block[] = [];
    for (let i = 0; i < 16; i++) blocks.push({ x: i * 260, y: 430 - (i % 3) * 25, w: 220, h: 110, kind: "roof" });
    blocks.push({ x: 760, y: 345, w: 48, h: 85, kind: "crate" });
    blocks.push({ x: 1210, y: 310, w: 48, h: 70, kind: "drone" });
    const resetBlocks = () => {
      const furthest = Math.max(...blocks.map(b => b.x + b.w));
      while (furthest + world < 1800) { const prev = blocks[blocks.length - 1]; const gap = 45 + Math.random() * 80; blocks.push({ x: prev.x + prev.w + gap, y: 345 + Math.random() * 65, w: 180 + Math.random() * 100, h: 120, kind: "roof" }); }
    };
    const jump = () => { if (p.onGround) { p.vy = -14; p.onGround = false; } };
    const drawMara = () => {
      const x = p.x, y = p.y;
      ctx.save(); ctx.translate(x, y);
      ctx.fillStyle = "#17191b"; ctx.fillRect(-13, 18, 10, 30); ctx.fillRect(3, 18, 10, 30);
      ctx.fillStyle = "#d94b2b"; ctx.fillRect(-17, -15, 34, 38);
      ctx.fillStyle = "#202326"; ctx.fillRect(-22, -5, 6, 24); ctx.fillRect(16, -5, 6, 24);
      ctx.fillStyle = "#b8bec3"; ctx.fillRect(12, -2, 23, 5);
      ctx.fillStyle = "#b77b5a"; ctx.beginPath(); ctx.arc(0, -28, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#17191b"; ctx.fillRect(-14, -38, 28, 8);
      ctx.fillStyle = "#b8bec3"; ctx.fillRect(10, -34, 9, 5);
      ctx.restore();
    };
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 2); last = now;
      const moving = keys.current.has("d") || keys.current.has("arrowright");
      if (moving) p.x += 3.4 * dt;
      if (keys.current.has("a") || keys.current.has("arrowleft")) p.x -= 2.5 * dt;
      if (keys.current.has(" ") || keys.current.has("w") || keys.current.has("arrowup")) jump();
      p.vy += GRAVITY * dt; p.y += p.vy * dt;
      world = Math.max(world, p.x - 180);
      if (p.x > 520) world += 2.2 * dt;
      blocks.forEach(b => {
        const bx = b.x - world;
        if (b.kind === "roof" && p.x > b.x && p.x < b.x + b.w && p.y + 48 >= b.y && p.y + 48 <= b.y + 20 && p.vy >= 0) { p.y = b.y - 48; p.vy = 0; p.onGround = true; }
      });
      const ground = blocks.find(b => b.kind === "roof" && p.x > b.x && p.x < b.x + b.w);
      if (!ground) p.onGround = false;
      if (p.y > H + 80) { const s = Math.floor(runScore); setScore(s); setBest(v => { const n = Math.max(v, s); localStorage.setItem("mara-best", String(n)); return n; }); setDead(true); return; }
      runScore += 0.7 * dt; setScore(Math.floor(runScore)); resetBlocks();
      ctx.clearRect(0, 0, W, H);
      const grad = ctx.createLinearGradient(0,0,0,H); grad.addColorStop(0,"#17243a"); grad.addColorStop(1,"#07090d"); ctx.fillStyle=grad; ctx.fillRect(0,0,W,H);
      for (let i=0;i<14;i++){ ctx.fillStyle=i%2?"#111722":"#0e141d"; const bh=90+(i*37)%190; ctx.fillRect(i*82-(world*.12%82),H-bh-30,64,bh); }
      blocks.forEach(b=>{ const x=b.x-world; if(x<-150||x>W+150)return; ctx.fillStyle="#252a32"; ctx.fillRect(x,b.y,b.w,b.h); ctx.fillStyle="#d94b2b"; ctx.fillRect(x,b.y,b.w,4); if(b.kind==="crate"){ctx.fillStyle="#b77b5a";ctx.fillRect(x,b.y-36,b.w,36)} if(b.kind==="drone"){ctx.fillStyle="#c9ced3";ctx.fillRect(x-12,b.y+25,b.w+24,7);ctx.fillStyle="#d94b2b";ctx.fillRect(x+17,b.y+7,14,14)}});
      ctx.fillStyle="#e8e1d6"; ctx.font="900 16px Arial"; ctx.fillText(`COURIER 17   ${String(Math.floor(runScore)).padStart(5,"0")}`,30,38); ctx.fillStyle="#7f8791"; ctx.font="700 11px Arial"; ctx.fillText(`BEST ${String(best).padStart(5,"0")}`,30,58);
      drawMara();
      ctx.fillStyle="rgba(255,255,255,.5)"; ctx.font="900 12px Arial"; ctx.fillText("RUN  •  JUMP  •  SURVIVE",W-220,38);
      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, dead, best]);

  const start = () => { setDead(false); setScore(0); setStarted(true); };
  return <div className="overflow-hidden border border-zinc-800 bg-[#08090b] shadow-2xl">
    <div className="relative aspect-[16/9] w-full">
      <canvas ref={canvasRef} width={W} height={H} className="h-full w-full object-cover" />
      {!started && <div className="absolute inset-0 grid place-items-center bg-[#07080b]/55 p-6 text-center"><div><p className="text-[10px] font-black uppercase tracking-[.35em] text-[#d94b2b]">The Long Run · Chapter 01</p><h2 className="mt-3 text-5xl font-black uppercase tracking-[-.05em]">Rooftop Runner</h2><p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">Mara has one delivery. The city has one lockdown. Run.</p><button onClick={start} className="mt-7 bg-[#d94b2b] px-8 py-4 text-[10px] font-black uppercase tracking-[.2em] text-black">Start the run</button></div></div>}
      {dead && <div className="absolute inset-0 grid place-items-center bg-black/70 p-6 text-center"><div><p className="text-[10px] font-black uppercase tracking-[.35em] text-[#d94b2b]">Courier 17 · Down</p><h2 className="mt-3 text-5xl font-black uppercase">Run over.</h2><p className="mt-3 text-zinc-500">Score {score} · Best {best}</p><button onClick={start} className="mt-7 border border-zinc-700 px-8 py-4 text-[10px] font-black uppercase tracking-[.2em]">Run again</button></div></div>}
    </div>
    <div className="flex items-center justify-between border-t border-zinc-900 px-4 py-3 text-[9px] font-black uppercase tracking-[.15em] text-zinc-600"><span>Keyboard: A/D + Space</span><span>Mobile controls next</span></div>
  </div>;
}
