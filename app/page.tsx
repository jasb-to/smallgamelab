import Link from "next/link";

const nav = [{ href:"/games", label:"Games" }, { href:"/studio", label:"Studio" }, { href:"/operators", label:"Operators" }];

export default function Home() {
  return <main className="min-h-screen sgl-grid">
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
      <Link href="/" className="text-sm font-black uppercase tracking-[0.18em]">Small Game Lab<span className="text-orange-500">.</span></Link>
      <div className="hidden gap-7 text-sm text-zinc-400 md:flex">{nav.map(n=><Link key={n.href} href={n.href} className="hover:text-white">{n.label}</Link>)}</div>
    </nav>
    <section className="mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-center px-6 pb-20 lg:px-10">
      <p className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-orange-500">Independent game studio · London</p>
      <h1 className="max-w-5xl text-6xl font-black leading-[0.88] tracking-[-0.06em] sm:text-8xl lg:text-[10rem]">SMALL<br/>GAMES.<br/><span className="text-orange-500">BIG</span><br/>DISTRIBUTION.</h1>
      <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center">
        <Link href="/games/last-stand" className="inline-flex w-fit items-center bg-orange-500 px-7 py-4 text-sm font-black uppercase tracking-wider text-black hover:bg-orange-400">Play Game 001 →</Link>
        <p className="max-w-md text-sm leading-6 text-zinc-500">Tiny teams. Simple ideas. Obsessive execution. We build games people understand in seconds and remember for years.</p>
      </div>
    </section>
    <section className="border-t border-zinc-800 bg-black/40"><div className="mx-auto grid max-w-7xl gap-px px-6 py-20 md:grid-cols-3 lg:px-10">
      <div className="border-zinc-800 md:border-r md:pr-10"><p className="text-xs uppercase tracking-widest text-zinc-600">001</p><h2 className="mt-3 text-2xl font-black">MAKE</h2><p className="mt-3 text-sm leading-6 text-zinc-500">We prototype tiny ideas until the core loop is impossible to ignore.</p></div>
      <div className="border-zinc-800 md:border-r md:px-10"><p className="text-xs uppercase tracking-widest text-zinc-600">002</p><h2 className="mt-3 text-2xl font-black">MEASURE</h2><p className="mt-3 text-sm leading-6 text-zinc-500">We play, test, learn and ruthlessly improve what isn't fun.</p></div>
      <div className="md:pl-10"><p className="text-xs uppercase tracking-widest text-zinc-600">003</p><h2 className="mt-3 text-2xl font-black">DISTRIBUTE</h2><p className="mt-3 text-sm leading-6 text-zinc-500">The winners go everywhere — web, mobile, platforms and partners.</p></div>
    </div></section>
  </main>;
}