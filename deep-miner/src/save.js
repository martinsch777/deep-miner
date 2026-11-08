import {fresh} from './game.js';
import {UPGRADES,C,capacity,batteryMax} from './config.js';
const KEY='deep-miner-v1';let db;
const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
export function validate(p){
 if(!p||p.version!==1||!integer(p.credits,0,1e12))throw Error('Formato o versión de partida inválidos.');
 for(const [k,u]of Object.entries(UPGRADES))if(!integer(p.upgrades?.[k],0,u.costs.length))throw Error('Mejoras inválidas.');
 for(const k of ['expeditions','minerals','best'])if(!integer(p.stats?.[k],0,1e12))throw Error('Estadísticas inválidas.');
 if(!integer(p.stats.depth,0,120)||typeof p.stats.core!=='boolean'||typeof p.tutorial!=='boolean')throw Error('Objetivos inválidos.');
 for(const k of ['audio','left','reduced'])if(typeof p.settings?.[k]!=='boolean')throw Error('Ajustes inválidos.');
 if(p.run){const r=p.run;if(r.kit)for(const [k,u]of Object.entries(UPGRADES))if(!integer(r.kit[k],0,u.costs.length))throw Error('Equipo inválido.');if(!integer(r.seed,0,4294967295)||!integer(r.x,1,29)||!integer(r.y,0,120)||!integer(r.depth,r.y,120)||!Number.isFinite(r.battery)||r.battery<0||r.battery>batteryMax(p)||!integer(r.bonus,0,100000)||typeof r.core!=='boolean'||!Number.isFinite(r.cooldown)||r.cooldown<0||r.cooldown>9)throw Error('Expedición inválida.');
 for(const k of ['copper','silver','gold','crystal'])if(!integer(r.bag?.[k],0,capacity(p)))throw Error('Inventario inválido.');
 if(Object.values(r.bag).length!==4||Object.values(r.bag).reduce((a,b)=>a+b,0)>capacity(p))throw Error('Carga inválida.');
 if(!r.changes||typeof r.changes!=='object'||Object.keys(r.changes).length>C.width*C.height)throw Error('Mapa inválido.');
 for(const [i,c]of Object.entries(r.changes))if(!/^\d+$/.test(i)||!integer(+i,0,C.width*C.height-1)||!c||!integer(c.rock,0,3)||![null,'copper','silver','gold','crystal'].includes(c.ore)||![null,'capsule','core'].includes(c.special))throw Error('Casillas inválidas.');
 }return p;
}
function open(){return new Promise((res,rej)=>{const q=indexedDB.open(KEY,1);q.onupgradeneeded=()=>q.result.createObjectStore('data');q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);});}
export class Storage{
 constructor(){this.warning='';this.pending=Promise.resolve();}
 async load(){let local,localData;try{local=localStorage.getItem(KEY);if(local)try{localData=JSON.parse(local);}catch{this.warning='Copia local dañada: intentando recuperar IndexedDB.';localStorage.setItem(KEY+'-recovery',local);}}catch{}try{db=await open();const saved=await new Promise((res,rej)=>{const q=db.transaction('data').objectStore('data').get('save');q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);});const candidates=[localData,saved].filter(Boolean).sort((a,b)=>(b.savedAt||0)-(a.savedAt||0));for(const candidate of candidates){try{return validate(candidate);}catch{this.warning='Se encontró un guardado dañado. Se usó la copia válida disponible.';}}if(candidates.length)this.warning='Guardado dañado: exportá una copia antes de seguir.';}catch{if(local)try{return validate(JSON.parse(local));}catch{this.warning='El guardado local no es válido.';}this.warning||='IndexedDB no disponible; usando guardado local.';}return fresh();}
 save(p){p.savedAt=Date.now();const snapshot=JSON.parse(JSON.stringify(p));try{localStorage.setItem(KEY,JSON.stringify(snapshot));}catch{this.warning='No se pudo escribir la copia local. Exportá tu partida.';}if(!db)return Promise.resolve();this.pending=this.pending.catch(()=>{}).then(()=>new Promise((res,rej)=>{const t=db.transaction('data','readwrite');t.objectStore('data').put(snapshot,'save');t.oncomplete=res;t.onerror=()=>{this.warning='Error al guardar; exportá una copia.';rej(t.error);};}));return this.pending.catch(()=>{});}
}
