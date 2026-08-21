import Link from "next/link";
import { demoEvents, demoOperator, demoSessions, games, money } from "../../../lib/platform";

const stat = [
  ["Active sessions", "12"],
  ["Sandbox GGR", money(1842.4)],
  ["Events today", "1,284"],
  ["API health", "99.98%"],
];

export default function PlatformPage() {
  return <main className="min-h-screen bg-[#080808] text-[#f4f1e9]">
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      <header className="flex items-center justify-between border-b border-zinc-900 pb-6">
        <div><Link href="/" className="text-xs font-black uppercase tracking-[.24em]">Small Game Lab.</Link><p className="mt-2 text-[9px] font-black uppercase tracking-[.25em] text-orange-500">Operator Platform / Sandbox</p></div>
        <div className="flex gap-5 text-[10px] font-black uppercase tracking-[.16em] text-zinc-500"><Link href="/operators">Operators</Link><Link href="/operators/simulator">Simulator</Link></div>
      </header>
      <section className="py-10"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-[10px] font-black uppercase tracking-[.3em] text-zinc-600">{demoOperator.name}</p><h1 className="mt-2 text-5xl font-black tracking-[-.05em] md:text-6xl">Control room.</h1></div><span className="w-fit border border-emerald-900 bg-emerald-950/30 px-3 py-2 text-[9px] font-black uppercase tracking-[.2em] text-emerald-400">Sandbox connected</span></div>
      <div className="mt-10 grid gap-px border border-zinc-900 bg-zinc-900 md:grid-cols-4">{stat.map(([label,value])=><div key={label} className="bg-[#0d0d0d] p-6"><p className="text-[9px] font-black uppercase tracking-[.2em] text-zinc-600">{label}</p><p className="mt-3 text-2xl font-black">{value}</p></div>)}</div></section>
      <section className="grid gap-8 lg:grid-cols-[1.3fr_.7fr]"><div className="border border-zinc-900"><div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4"><h2 className="text-xs font-black uppercase tracking-[.18em]">Game catalogue</h2><span className="text-[9px] text-zinc-600">{games.length} titles</span></div>{games.map(g=><div key={g.id} className="flex items-center justify-between border-b border-zinc-900 px-5 py-5 last:border-0"><div><p className="font-black uppercase">{g.name}</p><p className="mt-1 text-xs text-zinc-600">{g.category} · v{g.version}</p></div><span className="text-[9px] font-black uppercase tracking-[.15em] text-zinc-500">{g.status}</span></div>)}</div>
      <div className="border border-zinc-900"><div className="border-b border-zinc-900 px-5 py-4"><h2 className="text-xs font-black uppercase tracking-[.18em]">Live event ledger</h2></div>{demoEvents.map(e=><div key={e.id} className="border-b border-zinc-900 px-5 py-4 last:border-0"><div className="flex justify-between"><span className="text-[10px] font-black uppercase">{e.type}</span><span className="text-[10px] text-zinc-500">{e.id}</span></div><p className="mt-1 text-xs text-zinc-500">{money(e.amount)} · balance {money(e.balanceAfter)}</p></div>)}</div></section>
      <section className="mt-8 border border-zinc-900"><div className="border-b border-zinc-900 px-5 py-4"><h2 className="text-xs font-black uppercase tracking-[.18em]">Sessions</h2></div>{demoSessions.map(s=><div key={s.id} className="grid gap-2 border-b border-zinc-900 px-5 py-4 text-xs last:border-0 md:grid-cols-4"><span className="font-black">{s.id}</span><span className="text-zinc-500">{s.playerId}</span><span className="text-zinc-500">{s.status}</span><span className="md:text-right">{money(s.balance)}</span></div>)}</section>
    </div>
  </main>;
}
