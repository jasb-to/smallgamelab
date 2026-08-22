export type InputState={left:boolean;right:boolean;up:boolean;down:boolean;fire:boolean;dash:boolean};
export const EMPTY_INPUT:InputState={left:false,right:false,up:false,down:false,fire:false,dash:false};
export const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
export const distance=(ax:number,ay:number,bx:number,by:number)=>Math.hypot(ax-bx,ay-by);
export const scoreFor=(base:number,streak:number)=>Math.round(base*(1+Math.min(streak,20)*0.05));
export const nextLevelXp=(level:number)=>100+level*60;
export function xpAfter(current:number,gain:number,level:number){let xp=current+gain,l=level;while(xp>=nextLevelXp(l)){xp-=nextLevelXp(l);l++}return{xp,level:l}}
