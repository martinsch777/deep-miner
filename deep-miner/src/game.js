import {C,ORES,UPGRADES,capacity,batteryMax} from './config.js';
import {generate,index} from './world.js';
export function fresh(){return{version:1,credits:0,upgrades:{battery:0,drill:0,bag:0,scanner:0},stats:{expeditions:0,minerals:0,depth:0,best:0,core:false},settings:{audio:true,left:true,reduced:false},tutorial:false,run:null};}
export function expedition(p,seed){return{seed:seed>>>0,x:15,y:1,battery:batteryMax({...p,run:null}),kit:{...p.upgrades},bag:{copper:0,silver:0,gold:0,crystal:0},changes:{},depth:1,core:false,bonus:0,cooldown:0};}
export const count=r=>Object.values(r.bag).reduce((a,b)=>a+b,0);
export const value=r=>Object.entries(r.bag).reduce((a,[k,n])=>a+ORES[k].value*n,0)+r.bonus;
export function buy(p,key){const u=UPGRADES[key],l=p.upgrades[key];if(!u||l>=u.costs.length||p.credits<u.costs[l])return false;p.credits-=u.costs[l];p.upgrades[key]++;return true;}
export function settle(p,rescue=false){const r=p.run;if(!r)return null;const gross=value(r),earned=Math.floor(gross*(rescue?.5:1)),summary={bag:{...r.bag},bonus:r.bonus,gross,earned,rescue,depth:r.depth,core:r.core&&!rescue,record:r.depth>p.stats.depth};p.credits+=earned;p.stats.expeditions++;p.stats.minerals+=count(r);p.stats.depth=Math.max(p.stats.depth,r.depth);p.stats.best=Math.max(p.stats.best,earned);p.stats.core||=summary.core;p.run=null;return summary;}
export class Game{
 constructor(p,event=()=>{}){this.p=p;this.event=event;this.progress=0;this.target=null;this.wait=0;this.scan=0;this.world=generate(p.run.seed);for(const [i,c]of Object.entries(p.run.changes))this.world.cells[i]={...c};}
 spend(cost){const r=this.p.run;if(r.battery+1e-8<cost){r.battery=0;this.event('rescue');return false;}r.battery=Math.max(0,r.battery-cost);return true;}
 scanner(){const r=this.p.run;if(!r||r.cooldown>0)return;if(this.spend(C.scanCost)){this.scan=C.scanDuration;r.cooldown=C.scanCooldown;this.event('scan');if(r.battery===0)this.event('rescue');}}
 step(dt,dir){const r=this.p.run;if(!r)return;r.cooldown=Math.max(0,r.cooldown-dt);this.scan=Math.max(0,this.scan-dt);this.wait=Math.max(0,this.wait-dt);if(!dir){this.progress=0;this.target=null;return;}const x=r.x+dir[0],y=r.y+dir[1];if(x<1||x>=C.width-1||y<0||y>=C.height)return;const i=index(x,y),c=this.world.cells[i];if(this.target!==i){this.progress=0;this.target=i;}
 if(c.rock){const factor=Math.pow(.88,(this.p.run.kit||this.p.upgrades).drill);this.progress+=dt;if(this.progress<C.hardness[c.rock]*factor)return;this.progress=0;if(!this.spend(C.energy[c.rock]*factor))return;c.rock=0;r.changes[i]={...c};this.event('drill',{x,y});this.wait=0;}
 if(this.wait>0)return;if(!this.spend(C.moveCost))return;r.x=x;r.y=y;r.depth=Math.max(r.depth,y);this.wait=C.moveTime;this.target=null;this.collect(i);if(r.battery<=0)this.event('rescue');
 }
 collect(i){const r=this.p.run,c=this.world.cells[i];if(c.ore){if(count(r)<capacity(this.p)){r.bag[c.ore]++;c.ore=null;this.event('collect');}else this.event('full');}if(c.special==='core'){r.core=true;c.special=null;this.event('core');}if(c.special==='capsule'){r.bonus+=30;r.battery=Math.min(batteryMax(this.p),r.battery+18);c.special=null;this.event('capsule');}r.changes[i]={...c};}
}
