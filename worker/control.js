import {encryptArt,decryptArt,fromBase64} from './art.js';
import {adminActor,operatorLogin} from './admin-auth.js';
const DESK_HEADERS={'Cache-Control':'private, no-store','Content-Type':'application/json; charset=utf-8','X-Content-Type-Options':'nosniff'};
function deskJSON(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{...DESK_HEADERS,...extra}});}
export function baseWorld(themes,config){return {settings:{...config,paused:false,pauseMessage:'The building is resting. Familiar doors are still open.'},broadcast:{text:'',expiresAt:null},rooms:themes.map(s=>({...s,weight:1,releaseAt:null,retireAt:null}))};}
export function availableRooms(world,now){return world.rooms.filter(s=>s.enabled!==false&&(!s.releaseAt||s.releaseAt<=now)&&(!s.retireAt||s.retireAt>now));}
export function chooseWeighted(rooms,random){let n=random()*rooms.reduce((sum,s)=>sum+(s.weight||1),0);for(const s of rooms){n-=s.weight||1;if(n<0)return s;}return rooms.at(-1);}
export function validateWorld(world,art,now,{allowMissingArt=false}={}){
 const errors=[];const text=(v,max)=>typeof v==='string'&&v.length>0&&v.length<=max;
 if(!world||typeof world!=='object'||!Array.isArray(world.rooms)||world.rooms.length<1||world.rooms.length>80)return ['Keep between 1 and 80 locations.'];
 const c=world.settings;
 if(!c||!Number.isFinite(c.firstWaitMinutes)||c.firstWaitMinutes<1||c.firstWaitMinutes>10080||!Number.isFinite(c.waitMinutes)||c.waitMinutes<1||c.waitMinutes>10080||!Number.isFinite(c.jitterMinutes)||c.jitterMinutes<0||c.jitterMinutes>=c.waitMinutes||typeof c.paused!=='boolean'||!text(c.pauseMessage,200))errors.push('Check timing: 1–10080 minutes, with variation smaller than the normal wait.');
 if(!world.broadcast||typeof world.broadcast.text!=='string'||world.broadcast.text.length>240||(world.broadcast.expiresAt!==null&&(!Number.isFinite(world.broadcast.expiresAt)||world.broadcast.expiresAt<0)))errors.push('The transmission needs at most 240 characters and a valid expiry.');
 const ids=new Set(),freqs=new Set();
 for(const room of world.rooms){
  if(!room||!text(room.id,40)||!/^[a-z][a-z0-9-]*$/.test(room.id)||room.id==='unlisted'||ids.has(room.id)){errors.push('Each location needs a unique lowercase ID.');continue;}ids.add(room.id);
  if(!text(room.name,80)||!text(room.level,50)||!text(room.time,12)||!text(room.subtitle,160)||!text(room.status,160)||!text(room.description,1500)||!text(room.hint,160)||!Array.isArray(room.heading)||room.heading.length!==2||room.heading.some(t=>!text(t,70)))errors.push(room.id+': complete the location’s writing.');
  if(!/^#[0-9a-f]{6}$/i.test(room.accent)||!['hum','rain','fans','water','drums','tunnel','vent','pages'].includes(room.sound))errors.push(room.id+': check its colour and sound.');
  if(typeof room.enabled!=='boolean'||!Number.isFinite(room.weight)||room.weight<.1||room.weight>10)errors.push(room.id+': weight must be 0.1–10.');
  for(const field of ['releaseAt','retireAt'])if(room[field]!==null&&(!Number.isFinite(room[field])||room[field]<0))errors.push(room.id+': invalid schedule.');
  if(room.releaseAt&&room.retireAt&&room.retireAt<=room.releaseAt)errors.push(room.id+': rotation must end after it begins.');
  if(!Number.isFinite(room.frequency)||room.frequency<88||room.frequency>108||Math.abs(room.frequency*10-Math.round(room.frequency*10))>.001||freqs.has(room.frequency))errors.push(room.id+': choose a unique frequency from 88.0 to 108.0.');freqs.add(room.frequency);
  for(const type of ['note','signal'])if(!text(room[type]?.title,120)||!text(room[type]?.body,6000))errors.push(room.id+': complete its '+type+'.');
  if(room.artRef&&!/^art\/[a-f0-9-]{36}\.json$/.test(room.artRef))errors.push(room.id+': invalid artwork reference.');
  if(!allowMissingArt&&!room.artRef&&!art[room.id])errors.push(room.id+': add artwork before publishing.');
  // Hotspots are authored data, but still constrained before any HTML rendering.
  if((!Array.isArray(room.hotspots)||room.hotspots.length>8||room.hotspots.some(h=>!h||!['fragment','radio','terminal'].includes(h.type)||!text(h.label,80)||/[<>]/.test(h.label)||!Number.isFinite(h.x)||h.x<0||h.x>100||!Number.isFinite(h.y)||h.y<0||h.y>100||(h.type==='fragment'&&h.fragment!==room.id+'-note'))))errors.push(room.id+': invalid hotspot.');
 }
 if(!world.rooms.some(r=>r?.enabled&&!r.retireAt&&(!r.releaseAt||r.releaseAt<=now)))errors.push('Keep at least one location available now without a retirement date.');
 return [...new Set(errors)];
}
export function worldWarnings(world,now){
 const warnings=[];const active=availableRooms(world,now);
 for(const id of ['library','pool','platform'])if(!active.some(s=>s.id===id))warnings.push('The hidden-door route needs '+id+'; new visitors cannot currently reach it.');
 for(const room of world.rooms)if(!room.note.body.includes(Number(room.frequency).toFixed(1)))warnings.push(room.name+': its note does not mention the radio frequency.');
 if(world.settings.paused)warnings.push('New discoveries are paused. Familiar rooms remain accessible.');
 return warnings;
}
export async function readWorld(db,themes,config){
 const row=await db.prepare('SELECT * FROM control_state WHERE id=1').bind().first();
 const initial=baseWorld(themes,config);
 if(!row)return {revision:0,draft:initial,live:structuredClone(initial),updatedAt:null,publishedAt:null};
 return {revision:row.revision,draft:JSON.parse(row.draft_json),live:JSON.parse(row.live_json),updatedAt:row.updated_at,publishedAt:row.published_at};
}
export async function imagePacket(room,env,art){
 if(!room.artRef)return art[room.id];
 const object=await env.BUCKET?.get(room.artRef);if(!object)throw new Error('Artwork unavailable.');
 return JSON.parse(await object.text());
}
export async function recordActivity(db,room,kind,now){
 const columns=['arrivals','discoveries','revisits'];if(!columns.includes(kind))return;
 try{await db.prepare(`INSERT INTO activity_daily(day,room_id,${kind}) VALUES (?,?,1) ON CONFLICT(day,room_id) DO UPDATE SET ${kind}=${kind}+1`).bind(new Date(now).toISOString().slice(0,10),room).run();}catch{console.error('Aggregate counter unavailable.');}
}
async function ensureDesk(db,themes,config,now){
 const initial=JSON.stringify(baseWorld(themes,config));
 await db.prepare('INSERT INTO control_state(id,revision,draft_json,live_json,last_operation,updated_at,published_at) VALUES (1,0,?,?,\'\',?,?) ON CONFLICT(id) DO NOTHING').bind(initial,initial,now,now).run();
 await db.prepare('INSERT INTO control_versions(id,snapshot_json,created_at) VALUES (?,?,?) ON CONFLICT(id) DO NOTHING').bind('original',initial,now).run();
}
export function createDesk({themes,art,config,files,clock}){
 return async function handle(request,env,db){
  const url=new URL(request.url),path=url.pathname,now=clock();
  const actor=await adminActor(request,env,now),mode=env.IDENTITY_MODE||'sites';
  if(request.method==='GET'&&path==='/api/admin/session')return deskJSON({authenticated:!!actor,mode,loginAvailable:mode==='anonymous'&&env.ADMIN_TOKEN?.length>=32});
  let body;
  if(request.method==='POST'){
   if(request.headers.get('origin')!==url.origin||request.headers.get('sec-fetch-site')==='cross-site'||request.headers.get('x-liminal-admin')!=='1')return deskJSON({error:'Admin writes must come from this site.'},403);
   if(!request.headers.get('content-type')?.startsWith('application/json'))return deskJSON({error:'Expected JSON.'},415);
   if(Number(request.headers.get('content-length')||0)>900000)return deskJSON({error:'Request too large.'},413);
   const raw=await request.text();if(raw.length>900000)return deskJSON({error:'Request too large.'},413);
   try{body=JSON.parse(raw);}catch{return deskJSON({error:'Invalid JSON.'},400);}
   if(path==='/api/admin/login'){
    const cookie=await operatorLogin(request,env,body?.token,now);return cookie?deskJSON({ok:true},200,{'Set-Cookie':cookie}):deskJSON({error:'The access key was not accepted.'},401);
   }
  }
  if(!actor)return deskJSON({error:'This desk is restricted to its operators.'},403);
  if(request.method==='POST'&&path==='/api/admin/logout')return deskJSON({ok:true},200,{'Set-Cookie':'lh_operator=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'});
  if(!db)return deskJSON({error:'Database unavailable.'},503);
  const state=await readWorld(db,themes,config);
  if(request.method==='GET'&&path==='/api/admin/state')return deskJSON({...state,warnings:worldWarnings(state.draft,now)});
  if(request.method==='GET'&&path==='/api/admin/stats'){
   const summary=await db.prepare('SELECT COUNT(*) journeys, COALESCE(SUM(CASE WHEN next_at<=? THEN 1 ELSE 0 END),0) eligible, COALESCE(AVG(json_array_length(visited)),0) average_rooms FROM journeys').bind(now).first();
   const rooms=(await db.prepare('SELECT value room, COUNT(*) journeys FROM journeys,json_each(journeys.visited) GROUP BY value').bind().all()).results;
   const depth=(await db.prepare('SELECT json_array_length(visited) rooms, COUNT(*) journeys FROM journeys GROUP BY json_array_length(visited) ORDER BY rooms').bind().all()).results;
   const daily=(await db.prepare('SELECT * FROM activity_daily WHERE day>=? ORDER BY day,room_id').bind(new Date(now-29*86400000).toISOString().slice(0,10)).all()).results;
   return deskJSON({summary,rooms,depth,daily,rotation:availableRooms(state.live,now).length,total:state.live.rooms.length,paused:state.live.settings.paused,serverNow:now});
  }
  if(request.method==='GET'&&path==='/api/admin/log'){
   const audit=(await db.prepare('SELECT id,action,detail,created_at FROM control_audit ORDER BY created_at DESC LIMIT 200').bind().all()).results;
   const notes=(await db.prepare('SELECT * FROM shift_notes ORDER BY created_at DESC LIMIT 100').bind().all()).results;
   const versions=(await db.prepare('SELECT id,created_at FROM control_versions ORDER BY created_at DESC LIMIT 30').bind().all()).results;
   return deskJSON({audit,notes,versions});
  }
  if(request.method==='GET'&&path==='/api/admin/art'){
   const world=url.searchParams.get('view')==='live'?state.live:state.draft,room=world.rooms.find(s=>s.id===url.searchParams.get('id'));
   if(!room)return deskJSON({error:'Unknown location.'},404);
   try{return new Response(await decryptArt(await imagePacket(room,env,art),room.id,env.ART_KEY),{headers:{...DESK_HEADERS,'Content-Type':'image/webp'}});}catch{return deskJSON({error:'Artwork could not be opened.'},503);}
  }
  if(request.method==='GET'&&path==='/api/admin/health'){
   const artwork=[];for(const room of state.live.rooms){try{await decryptArt(await imagePacket(room,env,art),room.id,env.ART_KEY);artwork.push({id:room.id,ok:true});}catch{artwork.push({id:room.id,ok:false});}}
   let puzzle=false;try{const b=JSON.parse(new TextDecoder().decode(fromBase64(files['/vault/door.json'].body)));puzzle=b.format==='lh-room-1'&&b.iterations===600000&&b.ciphertext.length>1000;}catch{}
   return deskJSON({database:true,artwork,puzzleEnvelope:puzzle,uploadStorage:!!env.BUCKET,operatorAccess:true,warnings:worldWarnings(state.live,now),checkedAt:now});
  }
  if(request.method==='GET'&&path==='/api/admin/export'){
   const assets={};for(const room of [...state.live.rooms,...state.draft.rooms])if(room.artRef&&!assets[room.artRef])assets[room.artRef]=await imagePacket(room,env,art);
   return deskJSON({format:'liminal-night-desk-1',exportedAt:now,revision:state.revision,live:state.live,draft:state.draft,encryptedUploads:assets},200,{'Content-Disposition':'attachment; filename="liminal-night-desk.json"'});
  }
  if(request.method!=='POST')return deskJSON({error:'Unknown desk operation.'},404);
  if(path==='/api/admin/note'){
   if(!['observation','repair','idea'].includes(body.category)||typeof body.body!=='string'||!body.body.trim()||body.body.length>2000)return deskJSON({error:'Use a category and a note of 1–2000 characters.'},400);
   await db.prepare('INSERT INTO shift_notes(id,category,body,created_at) VALUES (?,?,?,?)').bind(crypto.randomUUID(),body.category,body.body.trim(),now).run();return deskJSON({ok:true});
  }
  if(!['/api/admin/draft','/api/admin/publish','/api/admin/restore','/api/admin/artwork'].includes(path))return deskJSON({error:'Unknown desk operation.'},404);
  if(!Number.isInteger(body.revision)||body.revision!==state.revision)return deskJSON({error:'This desk changed in another window. Reload before saving.'},409);
  let draft=state.draft,action='draft',detail='Saved the working draft';
  if(path==='/api/admin/draft'){draft=body.world;const errors=validateWorld(draft,art,now,{allowMissingArt:true});if(errors.length)return deskJSON({error:errors.join(' '),errors},400);}
  if(path==='/api/admin/restore'){
   if(body.version==='live'){draft=state.live;detail='Restored the published state to draft';}
   else{const v=await db.prepare('SELECT snapshot_json FROM control_versions WHERE id=?').bind(String(body.version)).first();if(!v)return deskJSON({error:'That version is unavailable.'},404);draft=JSON.parse(v.snapshot_json);detail='Restored a previous publication to draft';}
   draft=structuredClone(draft);
   for(const room of state.live.rooms)if(!draft.rooms.some(r=>r.id===room.id))draft.rooms.push({...room,enabled:false});
   action='restore';
  }
  if(path==='/api/admin/artwork'){
   if(!env.BUCKET)return deskJSON({error:'Artwork storage is not configured.'},503);
   const room=draft.rooms.find(s=>s.id===body.id);if(!room)return deskJSON({error:'Save the location draft first.'},400);
   let bytes;try{bytes=fromBase64(body.base64);}catch{return deskJSON({error:'Invalid image data.'},400);}
   if(bytes.length>512000||bytes.length<16||new TextDecoder().decode(bytes.slice(0,4))!=='RIFF'||new TextDecoder().decode(bytes.slice(8,12))!=='WEBP')return deskJSON({error:'Use a WebP image under 500 KB.'},400);
   const ref='art/'+crypto.randomUUID()+'.json',packet=await encryptArt(bytes,room.id,env.ART_KEY);
   await env.BUCKET.put(ref,JSON.stringify(packet),{httpMetadata:{contentType:'application/json'}});room.artRef=ref;action='artwork';detail='Replaced draft artwork for '+room.id;
  }
  if(path==='/api/admin/publish'){
   const errors=validateWorld(draft,art,now);if(errors.length)return deskJSON({error:errors.join(' '),errors},400);
   for(const room of draft.rooms){try{await decryptArt(await imagePacket(room,env,art),room.id,env.ART_KEY);}catch{return deskJSON({error:'Check artwork for '+room.id+' before publishing.'},400);}}
   action='publish';detail='Published locations, timing and the night transmission';
  }
  // Never allow deleting an existing room from history; retiring it is reversible.
  if(!state.live.rooms.every(s=>draft.rooms.some(r=>r.id===s.id)))return deskJSON({error:'Keep existing location IDs. Turn off rotation to retire a room.'},400);
  await ensureDesk(db,themes,config,now);
  const operation=crypto.randomUUID();
  const statement=action==='publish'?db.prepare('UPDATE control_state SET draft_json=?,live_json=?,revision=revision+1,last_operation=?,updated_at=?,published_at=? WHERE id=1 AND revision=?').bind(JSON.stringify(draft),JSON.stringify(draft),operation,now,now,body.revision):db.prepare('UPDATE control_state SET draft_json=?,revision=revision+1,last_operation=?,updated_at=? WHERE id=1 AND revision=?').bind(JSON.stringify(draft),operation,now,body.revision);
  const batch=[statement,db.prepare('INSERT INTO control_audit(id,action,detail,actor,created_at) SELECT ?,?,?,?,? FROM control_state WHERE id=1 AND last_operation=?').bind(operation,action,detail,actor,now,operation)];
  if(action==='publish')batch.push(db.prepare('INSERT INTO control_versions(id,snapshot_json,created_at) SELECT ?,live_json,? FROM control_state WHERE id=1 AND last_operation=?').bind(operation,now,operation));
  const results=await db.batch(batch);if(results[0].meta.changes!==1)return deskJSON({error:'Another window saved first. Reload before saving.'},409);
  const saved=await readWorld(db,themes,config);return deskJSON({...saved,warnings:worldWarnings(saved.draft,now)});
 };
}
