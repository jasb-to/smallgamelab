import { mara } from "../content/mara";

export function MaraCard({ compact = false }: { compact?: boolean }) {
  return <div className={`relative overflow-hidden border border-zinc-800 bg-[#0c0d0e] ${compact ? "p-4" : "p-6"}`}>
    <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#d94b2b]/10 blur-3xl" />
    <div className="relative flex gap-5">
      <div className="relative h-24 w-20 shrink-0">
        <div className="absolute left-5 top-0 h-9 w-9 rounded-full border-2 border-[#b77b5a] bg-[#6d4634]" />
        <div className="absolute left-2 top-8 h-14 w-14 rounded-t-lg border-2 border-[#111] bg-[#d94b2b]" />
        <div className="absolute left-1 top-10 h-9 w-4 rotate-12 bg-[#202326]" />
        <div className="absolute left-15 top-10 h-9 w-4 -rotate-12 bg-[#202326]" />
        <div className="absolute left-14 top-12 h-2 w-9 rotate-12 bg-[#b8bec3]" />
        <div className="absolute left-1 top-2 h-2 w-11 rounded-full bg-[#17191b]" />
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-[.3em] text-[#d94b2b]">Courier 17</p>
        <h2 className="mt-1 text-2xl font-black uppercase tracking-tight text-[#f3efe7]">{mara.name}</h2>
        <p className="mt-1 text-xs text-zinc-500">{mara.role}</p>
        {!compact && <p className="mt-4 max-w-lg text-sm leading-6 text-zinc-400">{mara.signatureLine} She knows every shortcut in the city. She just didn't know what was waiting at the other end of this delivery.</p>}
      </div>
    </div>
    {!compact && <div className="mt-5 flex flex-wrap gap-2">{mara.personality.map(x=><span key={x} className="border border-zinc-800 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-zinc-600">{x}</span>)}</div>}
  </div>;
}
