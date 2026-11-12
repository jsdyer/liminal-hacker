const artEncoder = new TextEncoder();
export function fromBase64(value) { return Uint8Array.from(atob(value), c => c.charCodeAt(0)); }
export function toBase64(bytes) { let out=''; for(let i=0;i<bytes.length;i+=8192)out+=String.fromCharCode(...bytes.subarray(i,i+8192)); return btoa(out); }
export async function artKey(secret, usage) {
  if (typeof secret !== 'string' || fromBase64(secret).length !== 32) throw new Error('Artwork key is not configured.');
  return crypto.subtle.importKey('raw',fromBase64(secret),'AES-GCM',false,[usage]);
}
export async function encryptArt(bytes,id,secret) {
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const data=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:artEncoder.encode('lh-art:'+id+':v1')},await artKey(secret,'encrypt'),bytes);
  return {version:1,iv:toBase64(iv),ciphertext:toBase64(new Uint8Array(data))};
}
export async function decryptArt(packet,id,secret) {
  if(packet?.version!==1)throw new Error('Unsupported artwork format.');
  return crypto.subtle.decrypt({name:'AES-GCM',iv:fromBase64(packet.iv),additionalData:artEncoder.encode('lh-art:'+id+':v1')},await artKey(secret,'decrypt'),fromBase64(packet.ciphertext));
}
