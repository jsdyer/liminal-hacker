import {decryptArt,fromBase64} from './art.js';

const PRIVATE={'Cache-Control':'private, no-store','Vary':'Cookie, oai-authenticated-user-id','X-Content-Type-Options':'nosniff'};
function json(value,status=200,extra={}) { return new Response(JSON.stringify(value),{status,headers:{...PRIVATE,'Content-Type':'application/json; charset=utf-8',...extra}}); }
function pick(list,random){return list[Math.min(list.length-1,Math.floor(random()*list.length))];}
function waitMs(config,first,random){
  const minutes=first?config.firstWaitMinutes:config.waitMinutes+(random()*2-1)*config.jitterMinutes;
  return Math.round(Math.max(1,minutes)*60000);
}
export function createService({themes,art,files,config,clock=Date.now,random=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296}) {
  const enabled=themes.filter(s=>s.enabled!==false),byId=new Map(enabled.map(s=>[s.id,s]));
  if(![config.firstWaitMinutes,config.waitMinutes,config.jitterMinutes].every(n=>Number.isFinite(n)&&n>=0))throw new Error('Journey timing must contain non-negative minutes.');
  if(!enabled.length)throw new Error('Enable at least one location.');
  async function identity(request,env){
    const mode=env.IDENTITY_MODE||'sites';let subject,cookie;
    if(mode==='sites')subject=request.headers.get('oai-authenticated-user-id');
    else if(mode==='proxy')subject=request.headers.get('x-liminal-user');
    else if(mode==='anonymous'){
      const match=(request.headers.get('cookie')||'').match(/(?:^|;\s*)lh_visit=([a-f0-9]{64})(?:;|$)/);
      subject=match?.[1];
      if(!subject){subject=Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');cookie=`lh_visit=${subject}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${new URL(request.url).protocol==='https:'?'; Secure':''}`;}
    }else throw new Error('Invalid identity mode.');
    if(!subject)return null;
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(mode+':'+subject));
    return {key:Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join(''),cookie,mode};
  }
  const load=(db,key)=>db.prepare('SELECT * FROM journeys WHERE user_key = ?').bind(key).first();
  async function ensure(db,key){
    let row=await load(db,key);
    if(row&&JSON.parse(row.visited).some(id=>byId.has(id)))return row;
    if(row){
      // If every remembered room was disabled, replace the missing arrival once.
      const now=clock(),id=pick(enabled,random).id;
      await db.prepare('UPDATE journeys SET current_room=?, visited=?, next_at=?, revision=revision+1, updated_at=? WHERE user_key=? AND revision=?').bind(id,JSON.stringify([...JSON.parse(row.visited),id]),now+waitMs(config,true,random),now,key,row.revision).run();
      return load(db,key);
    }
    const now=clock(),id=pick(enabled,random).id;
    await db.prepare('INSERT INTO journeys (user_key,current_room,visited,next_at,revision,created_at,updated_at) VALUES (?,?,?,?,0,?,?) ON CONFLICT(user_key) DO NOTHING').bind(key,id,JSON.stringify([id]),now+waitMs(config,true,random),now,now).run();
    return load(db,key);
  }
  function view(row,mode){
    const visited=JSON.parse(row.visited).filter(id=>byId.has(id));
    const current=visited.includes(row.current_room)?row.current_room:visited.at(-1);
    return {current,scenes:visited.map(id=>({...byId.get(id),image:'api/art/'+id})),total:enabled.length,remaining:enabled.length-visited.length,nextAt:row.next_at,serverNow:clock(),identityMode:mode};
  }
  return {async fetch(request,env){
    const url=new URL(request.url),path=url.pathname;
    if(!path.startsWith('/api/')){
      if(!['GET','HEAD'].includes(request.method))return json({error:'Method not allowed.'},405);
      const file=Object.hasOwn(files,path==='/'?'/index.html':path)?files[path==='/'?'/index.html':path]:null;
      if(!file)return new Response('This passage is not open.',{status:404,headers:PRIVATE});
      return new Response(request.method==='HEAD'?null:fromBase64(file.body),{headers:{'Content-Type':file.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'}});
    }
    try {
      if(!env.DB)return json({error:'The building is resting. Please return shortly.'},503);
      const who=await identity(request,env);if(!who)return json({error:'Sign in to keep your place in this building.',signIn:'/signin-with-chatgpt?return_to=%2F'},401);
      const extra=who.cookie?{'Set-Cookie':who.cookie}:{};
      // Always route state reads to D1's primary. A stale replica must not issue passages.
      const db=env.DB.withSession?env.DB.withSession('first-primary'):env.DB;
      if(request.method==='GET'&&path==='/api/journey')return json(view(await ensure(db,who.key),who.mode),200,extra);
      if(request.method==='GET'&&path.startsWith('/api/art/')){
        const id=path.slice('/api/art/'.length),row=await load(db,who.key);
        if(!byId.has(id)||!row||!JSON.parse(row.visited).includes(id))return json({error:'You have not reached this place.'},404,extra);
        const bytes=await decryptArt(art[id],id,env.ART_KEY);
        return new Response(bytes,{headers:{...PRIVATE,...extra,'Content-Type':'image/webp'}});
      }
      if(request.method!=='POST'||!['/api/discover','/api/visit'].includes(path))return json({error:'Unknown passage.'},404,extra);
      // Same-origin writes. No cross-origin read or write permissions are granted.
      if(request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return json({error:'This door opens from inside.'},403);
      if(request.headers.get('sec-fetch-site')==='cross-site')return json({error:'This door opens from inside.'},403);
      if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Expected JSON.'},415);
      if(Number(request.headers.get('content-length')||0)>4096)return json({error:'Request too large.'},413);
      const bodyText=await request.text();if(bodyText.length>4096)return json({error:'Request too large.'},413);
      let body;try{body=JSON.parse(bodyText);}catch{return json({error:'Invalid request.'},400);}
      let row=await ensure(db,who.key);
      if(path==='/api/visit'){
        if(!byId.has(body.id)||!JSON.parse(row.visited).includes(body.id))return json({error:'That place has not found you yet.'},403,extra);
        await db.prepare('UPDATE journeys SET current_room=?, revision=revision+1, updated_at=? WHERE user_key=?').bind(body.id,clock(),who.key).run();
        return json(view(await load(db,who.key),who.mode),200,extra);
      }
      const unseen=enabled.filter(s=>!JSON.parse(row.visited).includes(s.id));
      if(!unseen.length)return json({...view(row,who.mode),discovered:false,message:'Every listed place remembers you.'},200,extra);
      const now=clock();if(row.next_at>now)return json({...view(row,who.mode),discovered:false,message:'The building is quiet. Let a little time pass.'},200,extra);
      const id=pick(unseen,random).id,visited=[...JSON.parse(row.visited),id];
      const claim=await db.prepare('UPDATE journeys SET current_room=?, visited=?, next_at=?, revision=revision+1, updated_at=? WHERE user_key=? AND revision=? AND next_at<=?').bind(id,JSON.stringify(visited),now+waitMs(config,false,random),now,who.key,row.revision,now).run();
      row=await load(db,who.key);
      return json({...view(row,who.mode),discovered:claim.meta.changes===1,message:claim.meta.changes===1?'A passage opened. Somewhere you have not been.':'Another window already found the passage.'},200,extra);
    }catch(error){console.error('Journey request failed:',error.name);return json({error:'The building is resting. Please try again shortly.'},503);}
  }};
}
