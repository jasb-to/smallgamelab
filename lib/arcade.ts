export const ARCADE_RULES = {
  inputLatencyTargetMs: 50,
  restartTargetMs: 900,
  tutorialSeconds: 10,
  scoreIsAlwaysVisible: true,
  pauseDuringStory: true,
} as const;

export function clamp(value:number,min:number,max:number){return Math.max(min,Math.min(max,value));}
export function approach(current:number,target:number,amount:number){return current<target?Math.min(target,current+amount):Math.max(target,current-amount);}
export function lerp(a:number,b:number,t:number){return a+(b-a)*clamp(t,0,1);}
export function distance(ax:number,ay:number,bx:number,by:number){return Math.hypot(ax-bx,ay-by);}
export function scoreFor(style:number,base:number,streak:number){return Math.round(base*(1+Math.min(streak,20)*0.1)*Math.max(1,style));}
