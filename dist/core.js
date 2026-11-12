import {themes} from './themes.js';
export function prepareScene(theme){
 const s={...theme};
 s.hotspots ??= [{x:71,y:52,label:'A note left behind',type:'fragment',fragment:s.id+'-note'},{x:43,y:65,label:'A faint transmission',type:'radio'},{x:82,y:65,label:'The waiting terminal',type:'terminal'}];
 return s;
}
export const scenes=themes.filter(s=>s.enabled!==false).map(prepareScene);
export const fragments=Object.fromEntries(scenes.flatMap(s=>[
 [s.id+'-note',{...s.note,source:s.note.source||s.name.toUpperCase()+' / LEFT BEHIND'}],
 [s.id+'-signal',{...s.signal,source:s.signal.source||s.name.toUpperCase()+' / '+s.frequency.toFixed(1)+' MHz'}]
]));
fragments.tea = {"title": "Permission to stay", "source": "TERMINAL / A SMALL RITUAL", "body": "The kettle clicks off. Nothing needs to happen.\n\nOutside, a city full of sleeping people continues to exist without your supervision. Inside, for a moment, you are not late for anything.\n\nWelcome back, liminal hacker."};
export const observations=[
 {time:'02:17',title:'The hum is a kind of company.',body:'A server room is never really empty.\n\nThere are fans remembering their speed. Disks keeping a small promise. A UPS holding its breath for a power cut that may never come.\n\nIn the daytime, this is infrastructure. At two in the morning, it feels more like weather.\n\nYou sit down at the terminal and type a command you already know the answer to. Not because anything is broken. Just to hear something answer.\n\nThe hum continues. For now, that is enough.'},
 {time:'03:06',title:'Permission to be nowhere.',body:'A corridor is designed to be passed through. A lobby expects an arrival. A departure lounge insists that you are going somewhere.\n\nBut occasionally the purpose drains out of a place, and something gentler appears in its absence.\n\nA chair is just a chair. A window is a rectangle of dark. There is no one here to ask what you are doing.\n\nWe call these places empty. Perhaps we mean available.\n\nPerhaps the strange comfort is simply this: for once, the space has no expectations of you.'},
 {time:'04:41',title:'Someone left a port open.',body:'Curiosity is a quiet thing when nobody is watching.\n\nAn unfamiliar connector. A forgotten manual. A little board with a serial header and no explanation.\n\nHacking, here, means learning how a thing thinks. Following the traces. Reading the source. Repairing something you were told to replace.\n\nThe systems are yours, or you have permission. The tea is hot. The next question is more interesting than the last answer.\n\nThere are plenty of doors you do not need to force. Some were waiting for you to notice the handle.'}
];
export function chooseScene({locked=null,last=null,requested=null}={},random=Math.random,available=scenes){
 if(!available.length)throw new Error('Enable at least one theme in themes.js.');
 const valid=id=>available.some(s=>s.id===id);
 if(valid(requested))return requested;
 if(valid(locked))return locked;
 const alternatives=available.filter(s=>s.id!==last),choices=alternatives.length?alternatives:available;
 return choices[Math.min(choices.length-1,Math.max(0,Math.floor(random()*choices.length)))].id;
}
export function signalStrength(value,target){return Math.max(0,1-Math.abs(Number(value)-target)/3);}
export function isTuned(value,target){return Number.isFinite(Number(value))&&Math.abs(Number(value)-target)<.051;}
export function readState(raw){
 const empty={version:1,found:[],notes:'',locked:null,last:null};
 try{const d=JSON.parse(raw);if(!d||typeof d!=='object')return empty;return {...empty,found:Array.isArray(d.found)?[...new Set(d.found.filter(x=>Object.hasOwn(fragments,x)))]:[],notes:typeof d.notes==='string'?d.notes.slice(0,20000):'',locked:scenes.some(s=>s.id===d.locked)?d.locked:null,last:scenes.some(s=>s.id===d.last)?d.last:null};}catch{return empty;}
}
