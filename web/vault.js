// The mechanism is public. The phrase, decrypted metadata and artwork are not bundled here.
const encoder=new TextEncoder();
export const VAULT_ITERATIONS=600000;
const aad=encoder.encode('LiminalHacker/room/v1');
export function normalizePhrase(words){
 const parts=Array.isArray(words)?words:String(words).split(/[|\s]+/);
 if(parts.length!==3)throw new Error('Use three words.');
 const clean=parts.map(w=>String(w).trim().toLowerCase().replace(/[\s_-]+/g,''));
 if(clean.some(w=>!/^\p{L}{2,40}$/u.test(w)))throw new Error('Each answer should be one word.');
 return clean.join('|');
}
export function bytesToBase64(bytes){let str='';for(let i=0;i<bytes.length;i+=8192)str+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(str);}
export function base64ToBytes(text){if(typeof text!=='string'||!/^[A-Za-z0-9+/]*={0,2}$/.test(text)||text.length%4!==0)throw new Error('Invalid encrypted file.');return Uint8Array.from(atob(text),c=>c.charCodeAt(0));}
async function keyFor(words,salt,usage){
 if(!globalThis.crypto?.subtle)throw new Error('This door needs HTTPS or localhost.');
 const material=await crypto.subtle.importKey('raw',encoder.encode(normalizePhrase(words)),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations:VAULT_ITERATIONS},material,{name:'AES-GCM',length:256},false,[usage]);
}
export async function sealBundle(payload,words){
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
 const key=await keyFor(words,salt,'encrypt');
 const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad,tagLength:128},key,encoder.encode(JSON.stringify(payload)));
 return {format:'lh-room-1',kdf:'PBKDF2-SHA256',iterations:VAULT_ITERATIONS,salt:bytesToBase64(salt),iv:bytesToBase64(iv),ciphertext:bytesToBase64(new Uint8Array(encrypted))};
}
export async function decryptBundle(bundle,words){
 if(!bundle||bundle.format!=='lh-room-1'||bundle.kdf!=='PBKDF2-SHA256'||bundle.iterations!==VAULT_ITERATIONS||typeof bundle.ciphertext!=='string'||bundle.ciphertext.length>8000000)throw new Error('Invalid encrypted file.');
 const salt=base64ToBytes(bundle.salt),iv=base64ToBytes(bundle.iv),ciphertext=base64ToBytes(bundle.ciphertext);
 if(salt.length!==16||iv.length!==12||ciphertext.length<17)throw new Error('Invalid encrypted file.');
 const key=await keyFor(words,salt,'decrypt');
 const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:aad,tagLength:128},key,ciphertext);
 return JSON.parse(new TextDecoder().decode(plain));
}
export function validateRoom(payload){
 const s=payload?.scene;
 const text=(v,max=300)=>typeof v==='string'&&v.length>0&&v.length<=max;
 if(!s||s.id!=='unlisted'||!text(s.name)||!text(s.level)||!text(s.time)||!text(s.subtitle)||!text(s.status)||!text(s.hint)||!text(s.description,2000)||!Array.isArray(s.heading)||s.heading.length!==2||!s.heading.every(v=>text(v))||!/^#[0-9a-f]{6}$/i.test(s.accent)||!text(payload.letter?.title)||!text(payload.letter?.body,10000)||payload.image?.mime!=='image/webp'||typeof payload.image.base64!=='string'||payload.image.base64.length>6000000)throw new Error('The room is not in the expected format.');
 const bytes=base64ToBytes(payload.image.base64);
 if(new TextDecoder().decode(bytes.slice(0,4))!=='RIFF'||new TextDecoder().decode(bytes.slice(8,12))!=='WEBP')throw new Error('The room image is not a WebP.');
 return {scene:s,letter:payload.letter,image:bytes};
}
export const doorPrerequisites=['library-signal','pool-signal','platform-signal','tea'];
export function doorReady(found){return doorPrerequisites.every(id=>found.includes(id));}
