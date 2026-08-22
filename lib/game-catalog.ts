export type GameEntry = { n:string; title:string; desc:string; href:string; state:string; series:string; status:"PLAYABLE"|"IN BUILD" };
export const GAME_CATALOG: GameEntry[] = [
 {n:"01",title:"Rooftop Runner",desc:"Mara Vale. One delivery. One lockdown. Run the shard across the rooftops.",href:"/games/last-stand",state:"PLAY",series:"The Long Run",status:"PLAYABLE"},
 {n:"02",title:"One More Room",desc:"The shard leads underground. Fight through the relay complex.",href:"/games/one-more-room",state:"ENTER",series:"The Long Run",status:"PLAYABLE"},
 {n:"03",title:"The Getaway",desc:"District 9 is closing in. Drive hard, manage the heat and reach the relay.",href:"/games/the-getaway",state:"DRIVE",series:"The Long Run",status:"PLAYABLE"},
 {n:"04",title:"Dungeon 7",desc:"Five security waves stand between Mara and the source beneath the city.",href:"/games/dungeon-7",state:"DESCEND",series:"The Long Run",status:"PLAYABLE"},
 {n:"05",title:"The Final Run",desc:"Meridian Tower. The Director. The truth behind Courier 17.",href:"/games/the-final-run",state:"FINALE",series:"The Long Run",status:"PLAYABLE"},
];
