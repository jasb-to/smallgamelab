import MaraChapterOne from "../../../components/mara-chapter-one";
import GameShell from "../../../components/game-shell";

export default function LastStandPage(){
  return <GameShell chapter="CHAPTER 01" title="The Delivery.">
    <p className="mb-5 max-w-xl text-sm leading-6 text-zinc-400">Mara Vale has one delivery. The city has one lockdown. Run the rooftops, fight through the swarm and find out why everyone wants the shard.</p>
    <MaraChapterOne/>
  </GameShell>
}
