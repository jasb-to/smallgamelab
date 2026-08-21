"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Enemy = { id: number; x: number; hp: number; speed: number; kind: "grunt" | "runner" };
type Shot = { id: number; x: number; y: number };

const WIDTH = 1000;
const GROUND = 78;

export default function LastStandGame() {
  const [running, setRunning] = useState(false);
  const [hp, setHp] = useState(100);
  const [ammo, setAmmo] = useState(12);
  const [cash, setCash] = useState(120);
  const [wave, setWave] = useState(1);
  const [kills, setKills] = useState(0);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);
  const [flash, setFlash] = useState(false);
  const nextId = useRef(1);
  const keys = useRef(new Set<string>());

  const spawnWave = useCallback((waveNumber: number) => {
    const count = Math.min(4 + waveNumber * 2, 18);
    const next: Enemy[] = Array.from({ length: count }, (_, i) => ({
      id: nextId.current++,
      x: WIDTH + i * 75 + Math.random() * 120,
      hp: 1 + Math.floor(waveNumber / 5),
      speed: 0.55 + Math.random() * 0.55 + waveNumber * 0.025,
      kind: Math.random() > 0.82 ? "runner" : "grunt",
    }));
    setEnemies(next);
  }, []);

  const start = () => {
    setRunning(true);
    setHp(100);
    setAmmo(12);
    setCash(120);
    setWave(1);
    setKills(0);
    spawnWave(1);
  };

  const shoot = useCallback(() => {
    if (!running || ammo <= 0) return;
    setAmmo((value) => value - 1);
    setShots((current) => [...current, { id: nextId.current++, x: 225, y: 49 }]);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 70);
  }, [ammo, running]);

  const reload = useCallback(() => setAmmo(12), []);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      keys.current.add(event.key.toLowerCase());
      if (event.key === " ") {
        event.preventDefault();
        shoot();
      }
      if (event.key.toLowerCase() === "r") reload();
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [reload, shoot]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setShots((current) => current.map((shot) => ({ ...shot, x: shot.x + 28 })).filter((shot) => shot.x < WIDTH));
      setEnemies((current) => current.map((enemy) => ({ ...enemy, x: enemy.x - enemy.speed })).filter((enemy) => {
        if (enemy.x <= 210) {
          setHp((value) => Math.max(0, value - (enemy.kind === "runner" ? 8 : 5)));
          return false;
        }
        return true;
      }));
    }, 45);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    setShots((currentShots) => {
      let reward = 0;
      let hitCount = 0;
      const remainingEnemies = [...enemies];
      const remainingShots = currentShots.filter((shot) => {
        const targetIndex = remainingEnemies.findIndex((enemy) => Math.abs(enemy.x - shot.x) < 35);
        if (targetIndex === -1) return true;
        const target = remainingEnemies[targetIndex];
        target.hp -= 1;
        if (target.hp <= 0) {
          remainingEnemies.splice(targetIndex, 1);
          reward += target.kind === "runner" ? 18 : 12;
          hitCount += 1;
        }
        return false;
      });
      if (hitCount) {
        setEnemies(remainingEnemies);
        setCash((value) => value + reward);
        setKills((value) => value + hitCount);
      }
      return remainingShots;
    });
  }, [enemies, running, shots]);

  useEffect(() => {
    if (!running || enemies.length > 0) return;
    const nextWave = wave + 1;
    setWave(nextWave);
    const timeout = window.setTimeout(() => spawnWave(nextWave), 900);
    return () => window.clearTimeout(timeout);
  }, [enemies.length, running, spawnWave, wave]);

  useEffect(() => {
    if (hp > 0) return;
    setRunning(false);
    setEnemies([]);
    setShots([]);
  }, [hp]);

  return (
    <div className="overflow-hidden border border-zinc-800 bg-[#080808] shadow-2xl">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-[#101010] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em]">
        <span>LAST STAND · GAME 001</span>
        <span className="text-orange-500">WAVE {String(wave).padStart(2, "0")}</span>
      </div>
      <div className="relative aspect-[16/9] min-h-[360px] overflow-hidden bg-[radial-gradient(circle_at_70%_30%,#252525,transparent_25%),linear-gradient(180deg,#181818_0%,#0b0b0b_72%)]">
        <div className="absolute inset-x-0 bottom-0 h-[22%] border-t border-zinc-800 bg-[#0a0a0a]" />
        <div className="absolute bottom-[22%] left-[12%] h-24 w-10 bg-zinc-700" />
        <div className="absolute bottom-[22%] left-[7%] h-2 w-32 bg-zinc-800" />
        <div className="absolute bottom-[22%] left-[18%] h-14 w-5 bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,.3)]" />
        <div className="absolute bottom-[22%] left-[15%] h-4 w-20 rotate-[-8deg] bg-orange-500" />
        {enemies.map((enemy) => (
          <div key={enemy.id} className={`absolute bottom-[22%] h-7 w-7 rounded-sm ${enemy.kind === "runner" ? "bg-red-400" : "bg-zinc-500"}`} style={{ left: `${(enemy.x / WIDTH) * 100}%` }}>
            <div className="absolute -top-2 left-0 h-1 w-full bg-zinc-800"><div className="h-full bg-red-500" style={{ width: `${Math.max(0, enemy.hp) * 50}%` }} /></div>
          </div>
        ))}
        {shots.map((shot) => <div key={shot.id} className="absolute h-1 w-8 bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,.8)]" style={{ left: `${(shot.x / WIDTH) * 100}%`, bottom: "26%" }} />)}
        {flash && <div className="absolute bottom-[24%] left-[22%] h-4 w-10 rounded-full bg-yellow-200 blur-sm" />}

        <div className="absolute left-4 top-4 flex gap-5 text-[11px] font-black uppercase tracking-widest">
          <span>HP {hp}</span><span>AMMO {ammo}/12</span><span>${cash}</span><span>KILLS {kills}</span>
        </div>

        {!running && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[2px]">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-orange-500">Small Game Lab</p>
              <h2 className="mt-3 text-4xl font-black uppercase tracking-tight">{hp <= 0 ? "You fell." : "Hold the line."}</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm text-zinc-400">Shoot, survive, earn cash and push through the next wave.</p>
              <button onClick={start} className="mt-7 bg-orange-500 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-black transition hover:bg-orange-400">{hp <= 0 ? "Run it back" : "Start game"}</button>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 p-4 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
        <span>SPACE · FIRE</span><span>R · RELOAD</span><span>Every kill earns cash</span>
        <button onClick={reload} className="border border-zinc-700 px-3 py-2 text-zinc-300 hover:border-zinc-500">Reload</button>
      </div>
    </div>
  );
}
