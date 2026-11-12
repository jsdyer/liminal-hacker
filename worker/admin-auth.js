const authEncoder=new TextEncoder();
const listEnv=value=>String(value||'').split(',').map(x=>x.trim()).filter(Boolean);
async function operatorHmac(secret){return crypto.subtle.importKey('raw',authEncoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
const authHex=bytes=>Array.from(new Uint8Array(bytes),n=>n.toString(16).padStart(2,'0')).join('');
const authUnhex=value=>Uint8Array.from(value.match(/../g)||[],x=>parseInt(x,16));
export async function adminActor(request,env,now=Date.now()){
 const mode=env.IDENTITY_MODE||'sites';
 if(mode==='sites'){
  const id=request.headers.get('oai-authenticated-user-id'),email=request.headers.get('oai-authenticated-user-email');
  if(id&&email&&listEnv(env.ADMIN_EMAILS).map(x=>x.toLowerCase()).includes(email.toLowerCase()))return 'site:'+authHex(await crypto.subtle.digest('SHA-256',authEncoder.encode(id))).slice(0,20);
 }
 if(mode==='proxy'){
  const id=request.headers.get('x-liminal-user');if(id&&listEnv(env.ADMIN_USER_IDS).includes(id))return 'proxy:'+authHex(await crypto.subtle.digest('SHA-256',authEncoder.encode(id))).slice(0,20);
 }
 if(mode==='anonymous'&&env.ADMIN_TOKEN?.length>=32){
  const match=(request.headers.get('cookie')||'').match(/(?:^|;\s*)lh_operator=(\d{13})\.([a-f0-9]{32})\.([a-f0-9]{64})(?:;|$)/);
  if(match&&Number(match[1])>now&&Number(match[1])<=now+8*3600000&&await crypto.subtle.verify('HMAC',await operatorHmac(env.ADMIN_TOKEN),authUnhex(match[3]),authEncoder.encode(match[1]+'.'+match[2])))return 'local-operator';
 }
 return null;
}
export async function operatorLogin(request,env,token,now){
 if(env.IDENTITY_MODE!=='anonymous'||typeof env.ADMIN_TOKEN!=='string'||env.ADMIN_TOKEN.length<32||typeof token!=='string'||token.length<1||token.length>256)return null;
 const probe=authEncoder.encode('liminal-night-desk/login');
 const offered=await crypto.subtle.sign('HMAC',await operatorHmac(token),probe);
 if(!await crypto.subtle.verify('HMAC',await operatorHmac(env.ADMIN_TOKEN),offered,probe))return null;
 const value=(now+8*3600000)+'.'+crypto.randomUUID().replaceAll('-','');
 const sig=authHex(await crypto.subtle.sign('HMAC',await operatorHmac(env.ADMIN_TOKEN),authEncoder.encode(value)));
 return `lh_operator=${value}.${sig}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800${new URL(request.url).protocol==='https:'?'; Secure':''}`;
}
