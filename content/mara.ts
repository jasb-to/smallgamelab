export const mara = {
  name: "Mara Vale",
  age: 27,
  role: "Courier / runner / reluctant outlaw",
  visual: {
    hair: "short dark hair",
    jacket: "red utility jacket",
    trousers: "charcoal trousers",
    shoes: "worn trainers",
    bag: "weathered messenger bag",
    tag: "silver courier tag 17",
    silhouette: "lean athletic runner with a forward, alert posture",
  },
  palette: { jacket: "#d94b2b", charcoal: "#202326", skin: "#b77b5a", metal: "#b8bec3" },
  personality: ["fast-thinking", "dry humour", "stubborn", "protective"],
  signatureLine: "If it fits in the bag, it gets there.",
  continuity: {
    inventory: ["courier tag 17", "messenger bag", "data shard"],
    scars: "A small cut above the right eyebrow after Chapter 2.",
    progression: "Mara keeps the same jacket and tag through all five chapters; wear, damage and upgrades accumulate rather than resetting her identity.",
  },
} as const;

export const maraChapterState = {
  rooftopRunner: { title: "The Delivery", ability: "Parkour", unlock: "Data shard" },
  oneMoreRoom: { title: "Below Ground", ability: "Improvised combat", unlock: "Relay key" },
  getaway: { title: "No Way Back", ability: "Precision driving", unlock: "Vehicle access" },
  dungeonDash: { title: "The Old City", ability: "Network traversal", unlock: "Blackout key" },
  streetHeat: { title: "The Last Run", ability: "Everything learned", unlock: "The truth" },
} as const;
