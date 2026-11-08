export class Input{
 constructor(root,onAction){this.abort=new AbortController();this.held=new Map();this.order=0;const dirs={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
 root.querySelectorAll('[data-dir]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);this.held.set(e.pointerId,{dir:JSON.parse(b.dataset.dir),order:++this.order});b.classList.add('held');});const release=e=>{this.held.delete(e.pointerId);b.classList.remove('held');};for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,release);});
 window.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const k=e.key.length===1?e.key.toLowerCase():e.key;if(dirs[k]){e.preventDefault();if(!e.repeat)this.held.set(k,{dir:dirs[k],order:++this.order});}if(!e.repeat&&k===' ') {e.preventDefault();onAction('scan');}if(!e.repeat&&k==='Escape')onAction('pause');},{signal:this.abort.signal});window.addEventListener('keyup',e=>this.held.delete(e.key.length===1?e.key.toLowerCase():e.key),{signal:this.abort.signal});window.addEventListener('blur',()=>this.clear(),{signal:this.abort.signal});
 }
 get direction(){return [...this.held.values()].sort((a,b)=>b.order-a.order)[0]?.dir;}
 destroy(){this.clear();this.abort.abort();}
 clear(){this.held.clear();document.querySelectorAll('.held').forEach(b=>b.classList.remove('held'));}
}
