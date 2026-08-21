export const universe = {
  title: "The Long Run",
  premise: "Five games. One courier. One city collapsing in real time.",
  hero: {
    name: "Mara Vale",
    age: 27,
    role: "Runner / courier / reluctant outlaw",
    look: "short dark hair, red utility jacket, charcoal trousers, worn trainers, messenger bag, expressive face",
    personality: ["fast-thinking", "dry humour", "stubborn", "protective"],
    signature: "red jacket and silver courier tag marked 17",
  },
  timeline: [
    { game: 1, title: "Rooftop Runner", role: "Mara discovers the city is being locked down and carries a stolen data shard across the rooftops." },
    { game: 2, title: "One More Room", role: "The shard points to an underground relay. Mara fights through security rooms to reach it." },
    { game: 3, title: "The Getaway", role: "The relay exposes Mara. She steals a car and races through the city while every faction hunts her." },
    { game: 4, title: "Dungeon Dash", role: "The chase ends beneath the old city, where Mara finds the abandoned network controlling the blackout." },
    { game: 5, title: "Street Heat", role: "Mara returns above ground for one final run, delivering the network key before the city goes dark." },
  ],
  continuity: {
    recurringItems: ["silver courier tag 17", "red jacket", "data shard", "blackout countdown"],
    recurringCharacters: ["Mara Vale", "The Dispatcher", "Inspector Voss"],
    centralMystery: "Who ordered the city blackout, and why was Mara the courier chosen to stop it?",
  },
} as const;
