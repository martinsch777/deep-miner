import {C} from './config.js';
import {rng} from './rng.js';
export const index=(x,y)=>y*C.width+x;
export const biome=y=>y<=30?0:y<=70?1:2;
export function generate(seed){
 const r=rng(seed),cells=Array.from({length:C.width*C.height},(_,i)=>{const y=Math.floor(i/C.width),b=biome(y);return{rock:1+Math.min(2,b+(r()<.22?1:0)),ore:null,special:null};});
 for(let n=0;n<140;n++){const x=1+Math.floor(r()*29),y=3+Math.floor(r()*117),b=biome(y),ore=b===0?(r()<.85?'copper':'silver'):b===1?(r()<.55?'silver':'gold'):(r()<.55?'gold':'crystal');for(let j=0;j<3+Math.floor(r()*5);j++){const xx=Math.max(1,Math.min(29,x+Math.floor(r()*5)-2)),yy=Math.max(1,Math.min(120,y+Math.floor(r()*3)-1));cells[index(xx,yy)].ore=ore;}}
 for(let n=0;n<42;n++){const x=2+Math.floor(r()*27),y=5+Math.floor(r()*114);for(let dy=-1;dy<=1;dy++)for(let dx=-2;dx<=2;dx++)if(r()<.8){const c=cells[index(x+dx,y+dy)];c.rock=0;c.ore=null;}}
 for(let n=0;n<16;n++){const x=1+Math.floor(r()*29),y=5+Math.floor(r()*112);cells[index(x,y)].special='capsule';}
 for(let y=0;y<3;y++)for(let x=12;x<=18;x++)cells[index(x,y)]={rock:0,ore:null,special:null};
 for(const [x,y] of [[14,3],[15,3],[16,3],[15,4],[16,4],[14,4]])cells[index(x,y)]={rock:1,ore:'copper',special:null};
 // Ruta de suministros: hace posible el objetivo con mejoras, en cualquier semilla.
 for(let y=3;y<121;y++)cells[index(15,y)].rock=1+biome(y);
 for(let y=12;y<=108;y+=12)cells[index(15,y)]={rock:1+biome(y),ore:null,special:'capsule'};
 const core={x:2+Math.floor(r()*27),y:110+Math.floor(r()*11)};cells[index(core.x,core.y)]={rock:3,ore:null,special:'core'};
 return{cells,core};
}
