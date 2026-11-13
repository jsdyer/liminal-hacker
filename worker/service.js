import {journalPublic} from './journal.js';
import {fromBase64} from './art.js';
import {createDesk,readWorld,availableRooms,chooseWeighted,roomArtwork,recordActivity} from './control.js';
import {adminActor} from './admin-auth.js';

const PRIVATE={'Cache-Control':'private, no-store','Vary':'Cookie, oai-authenticated-user-id','X-Content-Type-Options':'nosniff'};
function json(value,status=200,extra={}) { return new Response(JSON.stringify(value),{status,headers:{...PRIVATE,'Content-Type':'application/json; charset=utf-8',...extra}}); }
function pick(list,random){return list[Math.min(list.length-1,Math.floor(random()*list.length))];}
function waitMs(config,first,random){
  const minutes=first?config.firstWaitMinutes:config.waitMinutes+(random()*2-1)*config.jitterMinutes;
  return Math.round(Math.max(1,minutes)*60000);
}
export function createService({themes,art,files,config,clock=Date.now,random=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296}) {
  const desk=createDesk({themes,art,config,files,clock});
  const initial=themes.filter(s=>s.enabled!==false);
  if(![config.firstWaitMinutes,config.waitMinutes,config.jitterMinutes].every(n=>Number.isFinite(n)&&n>=0))throw new Error('Journey timing must contain non-negative minutes.');
  if(!initial.length)throw new Error('Enable at least one location.');
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
  async function ensure(db,key,world){
    const enabled=availableRooms(world,clock()),byId=new Map(world.rooms.map(s=>[s.id,s]));
    let row=await load(db,key);
    if(row&&JSON.parse(row.visited).some(id=>byId.has(id)))return row;
    if(row){
      // If every remembered room was removed from the source seed, replace the missing arrival once.
      if(!enabled.length)throw new Error('No active arrival.');
    const now=clock(),id=chooseWeighted(enabled,random).id;
      await db.prepare('UPDATE journeys SET current_room=?, visited=?, next_at=?, revision=revision+1, updated_at=? WHERE user_key=? AND revision=?').bind(id,JSON.stringify([...JSON.parse(row.visited),id]),now+waitMs(world.settings,true,random),now,key,row.revision).run();
      return load(db,key);
    }
    if(!enabled.length)throw new Error('No active arrival.');
    const now=clock(),id=chooseWeighted(enabled,random).id;
    const inserted=await db.prepare('INSERT INTO journeys (user_key,current_room,visited,next_at,revision,created_at,updated_at) VALUES (?,?,?,?,0,?,?) ON CONFLICT(user_key) DO NOTHING').bind(key,id,JSON.stringify([id]),now+waitMs(world.settings,true,random),now,now).run();
    if(inserted.meta.changes===1)await recordActivity(db,id,'arrivals',now);
    return load(db,key);
  }
  function view(row,mode,world,isAdmin){
    const enabled=availableRooms(world,clock()),byId=new Map(world.rooms.map(s=>[s.id,s]));
    const visited=JSON.parse(row.visited).filter(id=>byId.has(id));
    const current=visited.includes(row.current_room)?row.current_room:visited.at(-1);
    return {current,scenes:visited.map(id=>({...byId.get(id),image:'api/art/'+id})),total:new Set([...visited,...enabled.map(s=>s.id)]).size,remaining:enabled.filter(s=>!visited.includes(s.id)).length,nextAt:row.next_at,serverNow:clock(),identityMode:mode,isAdmin,paused:world.settings.paused,pauseMessage:world.settings.pauseMessage,broadcast:world.broadcast.text&&(!world.broadcast.expiresAt||world.broadcast.expiresAt>clock())?world.broadcast.text:''};
  }
  return {async fetch(request,env){
    const url=new URL(request.url),path=url.pathname;
    if(path==='/journal'||path.startsWith('/journal/')||path.startsWith('/media/photos/')||path==='/api/journal/recent'){
      try{if(!env.DB)return new Response('The journal is resting. Please return shortly.',{status:503});const db=env.DB.withSession?env.DB.withSession('first-primary'):env.DB;return await journalPublic(request,env,db,!!await adminActor(request,env,clock()));}catch(error){console.error('Journal request failed:',error.name);return new Response('The journal is resting. Please return shortly.',{status:503,headers:PRIVATE});}
    }
    if(path==='/admin'||path==='/admin/')return new Response(fromBase64(files['/admin/index.html'].body),{headers:{...PRIVATE,'Content-Type':'text/html; charset=utf-8'}});
    if(!path.startsWith('/api/')){
      if(!['GET','HEAD'].includes(request.method))return json({error:'Method not allowed.'},405);
      const file=Object.hasOwn(files,path==='/'?'/index.html':path)?files[path==='/'?'/index.html':path]:null;
      if(!file)return new Response('This passage is not open.',{status:404,headers:PRIVATE});
      return new Response(request.method==='HEAD'?null:fromBase64(file.body),{headers:{'Content-Type':file.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'}});
    }
    try {
      if(path.startsWith('/api/admin/')){const adminDb=env.DB?.withSession?env.DB.withSession('first-primary'):env.DB;return await desk(request,env,adminDb);}
      if(!env.DB)return json({error:'The building is resting. Please return shortly.'},503);
      const who=await identity(request,env);if(!who)return json({error:'Sign in to keep your place in this building.',signIn:'/signin-with-chatgpt?return_to=%2F'},401);
      const extra=who.cookie?{'Set-Cookie':who.cookie}:{};
      // Always route state reads to D1's primary. A stale replica must not issue passages.
      const db=env.DB.withSession?env.DB.withSession('first-primary'):env.DB;
      const world=(await readWorld(db,themes,config)).live;
      if(!env.ARCHIVE_ART_KEY){
        // Standalone deployments can keep serving their original rotation until the new key is set.
        world.rooms=world.rooms.map(room=>!room.artRef&&art[room.id]?.key==='archive'?{...room,enabled:false}:room);
      }
      const enabled=availableRooms(world,clock()),byId=new Map(world.rooms.map(s=>[s.id,s]));
      const isAdmin=!!await adminActor(request,env,clock());
      if(request.method==='GET'&&path==='/api/journey')return json(view(await ensure(db,who.key,world),who.mode,world,isAdmin),200,extra);
      if(request.method==='GET'&&path.startsWith('/api/art/')){
        const id=path.slice('/api/art/'.length),row=await load(db,who.key);
        if(!byId.has(id)||!row||!JSON.parse(row.visited).includes(id))return json({error:'You have not reached this place.'},404,extra);
        const bytes=await roomArtwork(byId.get(id),env,art);
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
      let row=await ensure(db,who.key,world);
      if(path==='/api/visit'){
        if(!byId.has(body.id)||!JSON.parse(row.visited).includes(body.id))return json({error:'That place has not found you yet.'},403,extra);
        await db.prepare('UPDATE journeys SET current_room=?, revision=revision+1, updated_at=? WHERE user_key=?').bind(body.id,clock(),who.key).run();
        await recordActivity(db,body.id,'revisits',clock());
        return json(view(await load(db,who.key),who.mode,world,isAdmin),200,extra);
      }
      if(world.settings.paused)return json({...view(row,who.mode,world,isAdmin),discovered:false,message:world.settings.pauseMessage},200,extra);
      const unseen=enabled.filter(s=>!JSON.parse(row.visited).includes(s.id));
      if(!unseen.length)return json({...view(row,who.mode,world,isAdmin),discovered:false,message:'All current passages are familiar.'},200,extra);
      const now=clock();if(row.next_at>now)return json({...view(row,who.mode,world,isAdmin),discovered:false,message:'The building is quiet. Let a little time pass.'},200,extra);
      const id=chooseWeighted(unseen,random).id,visited=[...JSON.parse(row.visited),id];
      const claim=await db.prepare('UPDATE journeys SET current_room=?, visited=?, next_at=?, revision=revision+1, updated_at=? WHERE user_key=? AND revision=? AND next_at<=?').bind(id,JSON.stringify(visited),now+waitMs(world.settings,false,random),now,who.key,row.revision,now).run();
      if(claim.meta.changes===1)await recordActivity(db,id,'discoveries',now);
      row=await load(db,who.key);
      return json({...view(row,who.mode,world,isAdmin),discovered:claim.meta.changes===1,message:claim.meta.changes===1?'A passage opened. Somewhere you have not been.':'Another window already found the passage.'},200,extra);
    }catch(error){console.error('Journey request failed:',error.name);return json({error:'The building is resting. Please try again shortly.'},503);}
  }};
}
