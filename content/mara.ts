export const mara = {
  name: "Mara Vale",
  age: 27,
  role: "Courier 17 / runner / reluctant outlaw",
  origin: "Mara grew up learning the city by moving through it: rooftops, service tunnels, markets and forgotten rail lines. She became a courier because speed meant freedom and because nobody asked questions about what was inside the bag.",
  incitingIncident: "The first delivery changes everything. A routine run becomes a pursuit when Mara discovers that the package is a living access key: a data shard capable of opening Meridian's hidden network.",
  visual: { hair:"short dark hair", jacket:"red utility jacket", trousers:"charcoal trousers", shoes:"worn trainers", bag:"weathered messenger bag", tag:"silver courier tag 17", silhouette:"lean athletic runner with a forward, alert posture" },
  palette: { jacket:"#d94b2b", charcoal:"#202326", skin:"#b77b5a", metal:"#b8bec3" },
  personality:["fast-thinking","dry humour","stubborn","protective"],
  signatureLine:"If it fits in the bag, it gets there.",
  continuity:{inventory:["courier tag 17","messenger bag","data shard"],scars:"A small cut above the right eyebrow after Chapter 2.",progression:"Mara keeps the same jacket and tag through all five chapters; wear, damage and upgrades accumulate rather than resetting her identity."},
} as const;

export const maraChapterState = {
  rooftopRunner:{title:"The Delivery",summary:"Mara takes what should be an ordinary courier job across the rooftops. The package is not ordinary.",ability:"Parkour",unlock:"Data shard"},
  oneMoreRoom:{title:"Below Ground",summary:"The shard points beneath the city. Mara enters an abandoned relay station and learns somebody has been waiting for her.",ability:"Improvised combat",unlock:"Relay key"},
  getaway:{title:"No Way Back",summary:"The network wakes up. Every exit closes. Mara takes the wheel and runs toward the only route that has not been erased.",ability:"Precision driving",unlock:"Vehicle access"},
  dungeonDash:{title:"The Old City",summary:"The chase leads into the buried city beneath the new one. Mara finds the missing pieces of the message hidden in Dungeon 7.",ability:"Network traversal",unlock:"Blackout key"},
  streetHeat:{title:"The Last Run",summary:"Meridian Tower opens. Mara finally learns why Courier 17 was chosen and decides what to do with the truth.",ability:"Everything learned",unlock:"The truth"},
} as const;
