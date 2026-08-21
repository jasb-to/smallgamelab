import Link from "next/link";
import LastStandGame from "../../../components/last-stand-complete";

export default function LastStandPage() {
  return (
    <main className="min-h-screen bg-[#090909] px-4 py-6 text-[#f5f2ea] md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-xs font-black uppercase tracking-[0.22em]">Small Game Lab.</Link>
          <Link href="/games" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white">All games →</Link>
        </header>
        <section className="mx-auto mt-10 max-w-5xl">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-orange-500">GAME 001 · COMPLETE FIELD TEST</p>
              <h1 className="mt-2 text-5xl font-black uppercase tracking-[-0.04em] md:text-7xl">Last Stand.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">One soldier. One position. One more wave. Move, aim, shoot, upgrade and hold the line.</p>
            </div>
            <div className="text-left text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600 md:text-right">Small Game Lab<br />Build 0.5</div>
          </div>
          <LastStandGame />
          <div className="mt-8 grid gap-px overflow-hidden border border-zinc-800 bg-zinc-800 md:grid-cols-3">
            <div className="bg-[#0d0d0d] p-5"><p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">01</p><h2 className="mt-2 font-black uppercase">Move & aim</h2><p className="mt-2 text-sm text-zinc-500">Mouse/touch aiming with A/D movement and instant firing.</p></div>
            <div className="bg-[#0d0d0d] p-5"><p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">02</p><h2 className="mt-2 font-black uppercase">Build the run</h2><p className="mt-2 text-sm text-zinc-500">Clear waves, earn cash and choose upgrades that change the next run.</p></div>
            <div className="bg-[#0d0d0d] p-5"><p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">03</p><h2 className="mt-2 font-black uppercase">Survive the boss</h2><p className="mt-2 text-sm text-zinc-500">Every fifth wave escalates into a boss encounter and a run-ending victory state.</p></div>
          </div>
        </section>
      </div>
    </main>
  );
}
