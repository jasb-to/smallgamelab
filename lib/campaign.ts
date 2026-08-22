export type CampaignState={unlocked:number;completed:number[];credits:number;level:number;damage:number;maxHp:number;energy:number;weapon:number};
export const DEFAULT_CAMPAIGN:CampaignState={unlocked:1,completed:[],credits:0,level:1,damage:1,maxHp:100,energy:100,weapon:1};
const KEY="small-game-lab:the-long-run:v1";
export function loadCampaign():CampaignState{if(typeof window==="undefined")return DEFAULT_CAMPAIGN;try{const raw=localStorage.getItem(KEY);if(!raw)return DEFAULT_CAMPAIGN;return {...DEFAULT_CAMPAIGN,...JSON.parse(raw)}}catch{return DEFAULT_CAMPAIGN}}
export function saveCampaign(state:CampaignState){if(typeof window!=="undefined")localStorage.setItem(KEY,JSON.stringify(state))}
export function completeChapter(state:CampaignState,chapter:number):CampaignState{const completed=state.completed.includes(chapter)?state.completed:[...state.completed,chapter];return {...state,completed,unlocked:Math.max(state.unlocked,Math.min(5,chapter+1)),credits:state.credits+100,level:state.level+1,damage:state.damage+(chapter%2===0?1:0),maxHp:Math.min(150,state.maxHp+5),energy:Math.min(150,state.energy+5),weapon:Math.min(3,state.weapon+(chapter===2?1:0))}}
