"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Enemy = {
  id: number;
  x: number;
  hp: number;
  maxHp: number;
  speed: number;
  kind: "grunt" | "runner" | "brute";
};
type Shot = { id: number; x: number; damage: number };
type Upgrade = "damage" | "ammo" | "medic";

const WIDTH = 1000;
const BASE_AMMO = 12;

const upgrades: Record<Upgrade, { title: string; description: string }> = {
  damage: { title: "Hotter rounds", description: "+1 damage per shot" },
  ammo: { title: "Bigger mag", description: "+4 maximum ammo" },
  medic: { title: "Field medic", description: "+20 HP" },
};

export default function LastStandGame() {
  const [running, setRunning] = useState(false);
  const [hp, setHp] = useState(100);
  const [ammo, setAmmo] = useState(BASE_AMMO);
  const [maxAmmo, setMaxAmmo] = useState(BASE_AMMO);
  const [cash, setCash] = useState(120);
  const [wave, setWave] = useState(1);
  const [kills, setKills] = useState(0);
  const [damage, setDamage] = useState(1);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);
  const [flash, setFlash] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);
  const [intermission, setIntermission] = useState(false);
  const nextId = useRef(1);

  const spawnWave = useCallback((waveNumber: number) => {
    const count = Math.min(4 + waveNumber * 2, 20);
    setEnemies(
      Array.from({ length: count }, (_, i) => {
        const roll = Math.random();
        const kind = waveNumber >= 4 && roll > 0.9 ? "brute" : roll > 0.78 ? "runner" : "grunt";
        const baseHp = kind === "brute" ? 4 + Math.floor(waveNumber / 3) : 1 + Math.floor(waveNumber / 5);
        return {
          id: nextId.current++,
          x: WIDTH + i * 75 + Math.random() * 120,
          hp: baseHp,
          maxHp: baseHp,
          speed: kind === "brute" ? 0.32 + waveNumber * 0.012 : kind === "runner" ? 0.95 + waveNumber * 0.03 : 0.55 + Math.random() * 0.55 + waveNumber * 0.025,
          kind,
        };
      }),
    );
  }, []);

  const start = () => {
    setRunning(true);
    setHp(100);
    setAmmo(BASE_AMMO);
    setMaxAmmo(BASE_AMMO);
    setCash(120);
    setWave(1);
    setKills(0);
    setDamage(1);
    setShots([]);
    setIntermission(false);
    spawnWave(1);
  };

  const shoot = useCallback(() => {
    if (!running || intermission || ammo <= 0) return;
    setAmmo((value) => value - 1);
    setShots((current) => [...current, { id: nextId.current++, x: 225, damage }]);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 70);
  }, [ammo, damage, intermission, running]);

  const reload = useCallback(() => {
    if (running && !intermission) setAmmo(maxAmmo);
  }, [intermission, maxAmmo, running]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === " ") {
        event.preventDefault();
        shoot();
      }
      if (event.key.toLowerCase() === "r") reload();
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [reload, shoot]);

  useEffect(() => {
    if (!running || intermission) return;
    const timer = window.setInterval(() => {
      setShots((current) => current.map((shot) => ({ ...shot, x: shot.x + 30 })).filter((shot) => shot.x < WIDTH));
      setEnemies((current) =>
        current
          .map((enemy) => ({ ...enemy, x: enemy.x - enemy.speed }))
          .filter((enemy) => {
            if (enemy.x <= 210) {
              setHp((value) => Math.max(0, value - (enemy.kind === "runner" ? 8 : enemy.kind === "brute" ? 15 : 5)));
              setHitFlash(true);
              window.setTimeout(() => setHitFlash(false), 90);
              return false;
            }
            return true;
          }),
      );
    }, 45);
    return () => window.clearInterval(timer);
  }, [intermission, running]);

  useEffect(() => {
    if (!running || intermission || shots.length === 0 || enemies.length === 0) return;
    setShots((currentShots) => {
      const remainingEnemies = enemies.map((enemy) => ({ ...enemy }));
      let reward = 0;
      let hitCount = 0;
      let changed = false;
      const remainingShots = currentShots.filter((shot) => {
        const targetIndex = remainingEnemies.findIndex((enemy) => Math.abs(enemy.x - shot.x) < 35);
        if (targetIndex === -1) return true;
        changed = true;
        const target = remainingEnemies[targetIndex];
        target.hp -= shot.damage;
        if (target.hp <= 0) {
          remainingEnemies.splice(targetIndex, 1);
          reward += target.kind === "runner" ? 18 : target.kind === "brute" ? 35 : 12;
          hitCount += 1;
        }
        return false;
      });
      if (!changed) return currentShots;
      setEnemies(remainingEnemies);
      setCash((value) => value + reward);
      setKills((value) => value + hitCount);
      return remainingShots;
    });
  }, [enemies, intermission, running, shots]);

  useEffect(() => {
    if (!running || intermission || enemies.length > 0) return;
    setIntermission(true);
    const timeout = window.setTimeout(() => {
      setWave((current) => current + 1);
    }, 800);
    return () => window.clearTimeout(timeout);
  }, [enemies.length, intermission, running]);

  useEffect(() => {
    if (!running || !intermission) return;
    const nextWave = wave + 1;
    if (wave === 1) return;
    const timeout = window.setTimeout(() => {
      setIntermission(false);
      spawnWave(wave);
    }, 900);
    return () => window.clearTimeout(timeout);
  }, [intermission, running, spawnWave, wave]);

  useEffect(() => {
    if (hp > 0) return;
    setRunning(false);
    setIntermission(false);
    setEnemies([]);
    setShots([]);
  }, [hp]);

  const chooseUpgrade = (upgrade: Upgrade) => {
    if (upgrade === "damage") setDamage((value) => value + 1);
    if (upgrade === "ammo") {
      setMaxAmmo((value) => value + 4);
      setAmmo((value) => value + 4);
    }
    if (upgrade === "medic") setHp((value) => Math.min(100, value + 20));
    setIntermission(false);
    spawnWave(wave);
  };

  return (
    <div className="overflow-hidden border border-zinc-800 bg-[#080808] shadow-2xl">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-[#101010] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em]">
        <span>LAST STAND · GAME 001</span>
        <span className="text-orange-500">WAVE {String(wave).padStart(2, "0")}</span>
      </div>
      <div
        className="relative aspect-[16/9] min-h-[360px] overflow-hidden bg-[radial-gradient(circle_at_70%_30%,#252525,transparent_25%),linear-gradient(180deg,#181818_0%,#0b0b0b_72%)]"
        onPointerDown={(event) => {
          if (running && !intermission && event.pointerType !== "mouse") shoot();
        }}
      >
        <div className="absolute inset-x-0 bottom-0 h-[22%] border-t border-zinc-800 bg-[#0a0a0a]" />
        <div className="absolute bottom-[22%] left-[12%] h-24 w-10 bg-zinc-700" />
        <div className="absolute bottom-[22%] left-[7%] h-2 w-32 bg-zinc-800" />
        <div className="absolute bottom-[22%] left-[18%] h-14 w-5 bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,.3)]" />
        <div className="absolute bottom-[22%] left-[15%] h-4 w-20 rotate-[-8deg] bg-orange-500" />
        {enemies.map((enemy) => (
          <div
            key={enemy.id}
            className={`absolute bottom-[22%] h-7 rounded-sm transition-transform ${enemy.kind === "runner" ? "h-6 w-5 bg-red-400" : enemy.kind === "brute" ? "h-11 w-11 bg-red-700" : "w-7 bg-zinc-500"}`}
            style={{ left: `${(enemy.x / WIDTH) * 100}%` }}
          >
            <div className="absolute -top-2 left-0 h-1 w-full bg-zinc-800">
              <div className="h-full bg-red-500" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
            </div>
          </div>
        ))}
        {shots.map((shot) => (
          <div
            key={shot.id}
            className="absolute h-1 w-8 bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,.8)]"
            style={{ left: `${(shot.x / WIDTH) * 100}%`, bottom: "26%" }}
          />
        ))}
        {flash && <div className="absolute bottom-[24%] left-[22%] h-4 w-10 rounded-full bg-yellow-200 blur-sm" />}
        {hitFlash && <div className="pointer-events-none absolute inset-0 bg-red-500/15" />}
        <div className="absolute left-4 top-4 flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest md:gap-5 md:text-[11px]">
          <span>HP {hp}</span><span>AMMO {ammo}/{maxAmmo}</span><span>${cash}</span><span>KILLS {kills}</span><span>DMG {damage}</span>
        </div>

        {intermission && running && hp > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/65 backdrop-blur-[2px]">
            <div className="w-full max-w-xl px-5 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-orange-500">Wave cleared</p>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-tight md:text-5xl">Choose your edge.</h2>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {(Object.keys(upgrades) as Upgrade[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => chooseUpgrade(key)}
                    className="border border-zinc-700 bg-zinc-950 p-4 text-left transition hover:border-orange-500 hover:bg-zinc-900"
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">{upgrades[key].title}</p>
                    <p className="mt-2 text-xs text-zinc-400">{upgrades[key].description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {!running && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[2px]">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-orange-500">Small Game Lab</p>
              <h2 className="mt-3 text-4xl font-black uppercase tracking-tight">{hp <= 0 ? "You fell." : "Hold the line."}</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm text-zinc-400">Shoot, survive, earn cash and choose an upgrade after every wave.</p>
              <button onClick={start} className="mt-7 bg-orange-500 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-black transition hover:bg-orange-400">{hp <= 0 ? "Run it back" : "Start game"}</button>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 p-4 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
        <span>SPACE / TAP · FIRE</span><span>R · RELOAD</span><span>Kill enemies. Earn cash. Upgrade.</span>
        <button onClick={reload} className="border border-zinc-700 px-3 py-2 text-zinc-300 hover:border-zinc-500">Reload</button>
      </div>
    </div>
  );
}
