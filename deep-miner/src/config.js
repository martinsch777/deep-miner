export const C={width:31,height:121,moveCost:.2,moveTime:.13,scanCost:8,scanDuration:6,scanCooldown:9,hardness:[0,.3,.6,1],energy:[0,2,4,6]};
export const ORES={copper:{name:'Cobre',value:10,color:'#f3a064',symbol:'◆'},silver:{name:'Plata',value:25,color:'#d8edf0',symbol:'▰'},gold:{name:'Oro',value:55,color:'#ffd15b',symbol:'✦'},crystal:{name:'Cristal raro',value:100,color:'#8bf3df',symbol:'⬟'}};
export const UPGRADES={battery:{name:'Batería',costs:[80,160,320,640,1280],desc:l=>`${100+30*l} → ${130+30*l} puntos`},drill:{name:'Taladro',costs:[120,240,480,960],desc:l=>`Velocidad y eficiencia +12% · nivel ${l+1}`},bag:{name:'Mochila',costs:[90,180,360,720],desc:l=>`${12+5*l} → ${17+5*l} espacios`},scanner:{name:'Escáner',costs:[110,220,440],desc:l=>`Radio ${4+2*l} → ${6+2*l} casillas`}};
export const capacity=p=>12+5*(p.run?.kit||p.upgrades).bag;
export const batteryMax=p=>100+30*(p.run?.kit||p.upgrades).battery;
