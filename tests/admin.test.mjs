import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sqliteDB} from '../scripts/sqlite.mjs';
import {createService} from '../worker/service.js';
import {themes as catalogue} from '../content/themes.js';
import {encryptArt,toBase64} from '../worker/art.js';
import {adminActor,operatorLogin} from '../worker/admin-auth.js';
import {availableRooms,chooseWeighted} from '../worker/control.js';
const sql=(await Promise.all(['0000_journeys','0001_night_desk'].map(n=>readFile(new URL('../drizzle/'+n+'.sql',import.meta.url),'utf8')))).join('\n');
async function fixture({archive=false,random=()=>0}={}){
 const DB=sqliteDB();DB.raw.exec(sql);let time=1794488400000;
 const themes=structuredClone(catalogue.slice(0,3));
 const ART_KEY=toBase64(crypto.getRandomValues(new Uint8Array(32)));
 const ARCHIVE_ART_KEY=toBase64(crypto.getRandomValues(new Uint8Array(32)));
 const art={};
 const bytes=new Uint8Array(32);bytes.set(new TextEncoder().encode('RIFF'));bytes.set(new TextEncoder().encode('WEBP'),8);
 for(const r of themes)art[r.id]=await encryptArt(bytes,r.id,ART_KEY);
 if(archive){
  const rooms=structuredClone(catalogue.filter(room=>room.seedOnUpgrade));
  for(const room of rooms)art[room.id]={...await encryptArt(bytes,room.id,ARCHIVE_ART_KEY),key:'archive'};
  themes.push(...rooms);
 }
 const objects=new Map(),BUCKET={async get(k){return objects.has(k)?{text:async()=>objects.get(k)}:null;},async put(k,v){objects.set(k,v);}};
 const app=createService({themes,art,files:{},config:{firstWaitMinutes:15,waitMinutes:90,jitterMinutes:30},clock:()=>time,random});
 const env={DB,BUCKET,ART_KEY,ARCHIVE_ART_KEY,ADMIN_EMAILS:'owner@example.test',IDENTITY_MODE:'sites'};
 const request=(path,body,owner=true,extra={})=>app.fetch(new Request('https://liminal.test'+path,{...(body===undefined?{}:{method:'POST',body:JSON.stringify(body)}),headers:{'oai-authenticated-user-id':owner?'operator':'visitor','oai-authenticated-user-email':owner?'owner@example.test':'visitor@example.test','Content-Type':'application/json',origin:'https://liminal.test','X-Liminal-Admin':'1',...extra}}),env);
 const get=async()=> (await request('/api/admin/state')).json();
 const save=async world=>{const s=await get();return request('/api/admin/draft',{revision:s.revision,world});};
 const publish=async()=>request('/api/admin/publish',{revision:(await get()).revision});
 return {DB,env,request,get,save,publish,bytes,objects,advance:n=>time=n};
}
test('operator roles and CSRF checks protect every admin endpoint',async()=>{
 const f=await fixture();
 for(const route of ['state','stats','health','log','export','art?id=atrium'])assert.equal((await f.request('/api/admin/'+route,undefined,false)).status,403);
 assert.equal((await f.request('/api/admin/session',undefined,false).then(r=>r.json())).authenticated,false);
 assert.equal((await f.request('/api/admin/state',undefined,true,{'oai-authenticated-user-id':''})).status,403);
 const s=await f.get();assert.equal((await f.request('/api/admin/draft',{revision:s.revision,world:s.draft},true,{origin:'https://evil.test'})).status,403);
 assert.equal((await f.request('/api/admin/draft',{revision:s.revision,world:s.draft},true,{'X-Liminal-Admin':''})).status,403);
});
test('standalone operator cookie is signed, expires, and rejects changed credentials',async()=>{
 const now=Date.now(),env={IDENTITY_MODE:'anonymous',ADMIN_TOKEN:'test-secret-key-with-more-than-32-bytes'};
 const req=c=>new Request('https://liminal.test/admin',{headers:c?{cookie:c}:{}});
 assert.equal(await operatorLogin(req(),env,'',now),null);assert.equal(await operatorLogin(req(),env,'wrong',now),null);
 assert.equal(await operatorLogin(req(),{IDENTITY_MODE:'anonymous'},'wrong',now),null);
 const cookie=await operatorLogin(req(),env,env.ADMIN_TOKEN,now);assert.match(cookie,/HttpOnly; SameSite=Strict/);assert.match(cookie,/Secure/);
 assert.ok(await adminActor(req(cookie),env,now));assert.equal(await adminActor(req(cookie),env,now+8*3600000),null);
 assert.equal(await adminActor(req(cookie.replace(/lh_operator=./,'lh_operator=9')),env,now),null);
 assert.equal(await adminActor(req(cookie),{...env,ADMIN_TOKEN:env.ADMIN_TOKEN+'changed'},now),null);
 assert.equal(await adminActor(new Request('https://x.test',{headers:{'x-liminal-user':'other'}}),{IDENTITY_MODE:'proxy',ADMIN_USER_IDS:'owner'}),null);
});
test('draft isolation, atomic publication, pause and retirement preserve existing progress',async()=>{
 const f=await fixture();const first=await f.request('/api/journey',undefined,false).then(r=>r.json());
 let s=await f.get();s.draft.rooms[0].name='The edited atrium';s.draft.rooms[0].enabled=false;s.draft.settings.paused=true;s.draft.broadcast={text:'A light in the stairwell.',expiresAt:first.nextAt+1000};
 assert.equal((await f.save(s.draft)).status,200);
 assert.equal((await f.request('/api/journey',undefined,false).then(r=>r.json())).scenes[0].name,'The atrium');
 assert.equal((await f.publish()).status,200);f.advance(first.nextAt);
 const next=await f.request('/api/discover',{},false).then(r=>r.json());assert.equal(next.discovered,false);assert.equal(next.paused,true);assert.equal(next.nextAt,first.nextAt);assert.equal(next.scenes[0].name,'The edited atrium');assert.equal(next.broadcast,'A light in the stairwell.');
 assert.equal((await f.request('/api/art/atrium',undefined,false)).status,200);assert.equal((await f.request('/api/visit',{id:'atrium'},false)).status,200);
 f.advance(first.nextAt+2000);assert.equal((await f.request('/api/journey',undefined,false).then(r=>r.json())).broadcast,'');
 s=await f.get();s.draft.settings.paused=false;await f.save(s.draft);await f.publish();assert.equal((await f.request('/api/discover',{},false).then(r=>r.json())).discovered,true);
});
test('revision conflicts cannot overwrite another desk or create phantom audit entries',async()=>{
 const f=await fixture(),s=await f.get();s.draft.rooms[0].name='Draft';
 const results=await Promise.all(Array.from({length:10},()=>f.request('/api/admin/draft',{revision:0,world:s.draft})));
 assert.equal(results.filter(r=>r.status===200).length,1);assert.equal(results.filter(r=>r.status===409).length,9);
 assert.equal(f.DB.raw.prepare('SELECT COUNT(*) n FROM control_audit').get().n,1);
 const invalid=structuredClone(s.draft);invalid.rooms[0].frequency=invalid.rooms[1].frequency;assert.equal((await f.save(invalid)).status,400);
});
test('uploaded art stays encrypted, draft-only and access controlled; history restores safely',async()=>{
 const f=await fixture();await f.request('/api/journey',undefined,false);let s=await f.get();
 const room=structuredClone(s.draft.rooms[0]);room.id='observatory';room.name='The observatory';room.frequency=88.1;room.hotspots=[];room.enabled=false;s.draft.rooms.push(room);
 assert.equal((await f.save(s.draft)).status,200);assert.equal((await f.publish()).status,400);
 s=await f.get();const upload=await f.request('/api/admin/artwork',{id:room.id,revision:s.revision,base64:toBase64(f.bytes)});assert.equal(upload.status,200);
 assert.equal(f.objects.size,1);const packet=JSON.parse([...f.objects.values()][0]);assert.ok(packet.ciphertext);assert.ok(!JSON.stringify(packet).includes('RIFF'));
 assert.equal((await f.request('/api/art/observatory',undefined,false)).status,404);
 assert.equal((await f.request('/api/admin/art?id=observatory')).status,200);
 assert.equal((await f.publish()).status,200);
 const exported=await f.request('/api/admin/export').then(r=>r.json());assert.equal(Object.keys(exported.encryptedUploads).length,1);assert.ok(!JSON.stringify(exported).includes(f.env.ART_KEY));assert.ok(!('journeys' in exported));
 s=await f.get();assert.equal((await f.request('/api/admin/restore',{revision:s.revision,version:'original'})).status,200);
 const restored=await f.get();assert.equal(restored.draft.rooms.find(r=>r.id==='observatory').enabled,false);assert.equal(restored.live.rooms.length,4);
});
test('aggregate counts do not count refreshes or expose visitor identities',async()=>{
 const f=await fixture();const first=await f.request('/api/journey',undefined,false).then(r=>r.json());await f.request('/api/journey',undefined,false);
 f.advance(first.nextAt);await Promise.all(Array.from({length:5},()=>f.request('/api/discover',{},false)));
 const s=await f.request('/api/admin/stats').then(r=>r.json());assert.equal(s.summary.journeys,1);assert.equal(s.daily.reduce((n,d)=>n+d.arrivals,0),1);assert.equal(s.daily.reduce((n,d)=>n+d.discoveries,0),1);
 assert.ok(!JSON.stringify(s).includes('user_key'));assert.ok(!JSON.stringify(s).includes('example.test'));
 const health=await f.request('/api/admin/health').then(r=>r.json());assert.ok(health.artwork.every(x=>x.ok));f.env.ART_KEY=toBase64(new Uint8Array(32));assert.ok((await f.request('/api/admin/health').then(r=>r.json())).artwork.every(x=>!x.ok));
});
test('weighted scheduling respects release and retirement windows',()=>{
 const w={rooms:[{id:'a',enabled:true,weight:1},{id:'b',enabled:true,weight:3,releaseAt:100},{id:'c',enabled:true,weight:10,retireAt:100}]};
 assert.deepEqual(availableRooms(w,100).map(r=>r.id),['a','b']);assert.equal(chooseWeighted(availableRooms(w,100),()=>.2).id,'a');assert.equal(chooseWeighted(availableRooms(w,100),()=>.3).id,'b');
});
test('archive scenes join an existing catalogue without overwriting desk settings or bypassing discovery',async()=>{
 let roll=0;
 const f=await fixture({archive:true,random:()=>roll});
 const initial=await f.get();
 const added=initial.live.rooms.filter(room=>room.seedOnUpgrade);
 assert.equal(added.length,8);
 const older=initial.live;
 older.rooms=older.rooms.filter(room=>!room.seedOnUpgrade);
 older.rooms[1].name='My rooftop';
 older.rooms[1].frequency=added[0].frequency;
 older.settings.waitMinutes=140;
 const stored=JSON.stringify(older);
 f.DB.raw.prepare('INSERT INTO control_state(id,revision,draft_json,live_json,updated_at,published_at) VALUES (1,5,?,?,0,0)').run(stored,stored);

 const first=await f.request('/api/journey',undefined,false).then(r=>r.json());
 assert.equal(first.current,'atrium');
 assert.equal(first.total,11);
 assert.equal((await f.request('/api/art/basement-archive',undefined,false)).status,404);
 assert.equal((await f.request('/api/art/atrium',undefined,false)).status,200);
 const upgraded=await f.get();
 assert.equal(upgraded.live.rooms[1].name,'My rooftop');
 assert.equal(upgraded.live.settings.waitMinutes,140);
 assert.equal(upgraded.revision,5);
 const basement=upgraded.live.rooms.find(room=>room.id==='basement-archive');
 assert.notEqual(basement.frequency,added[0].frequency);
 assert.ok(basement.note.body.includes(basement.frequency.toFixed(1)));
 assert.equal((await f.request('/api/admin/art?id=basement-archive')).status,200);
 assert.equal((await f.publish()).status,200);

 f.advance(first.nextAt);
 roll=.25;
 const opened=await f.request('/api/discover',{},false).then(r=>r.json());
 assert.equal(opened.current,'basement-archive');
 const art=await f.request('/api/art/basement-archive',undefined,false);
 assert.equal(art.headers.get('Content-Type'),'image/webp');
 assert.deepEqual(new Uint8Array(await art.arrayBuffer()),f.bytes);
 assert.equal((await f.request('/api/journey',undefined,false).then(r=>r.json())).nextAt,opened.nextAt);

 const edited=await f.get();
 edited.draft.rooms.find(room=>room.id==='basement-archive').enabled=false;
 assert.equal((await f.save(edited.draft)).status,200);
 assert.equal((await f.publish()).status,200);
 assert.equal((await f.get()).live.rooms.find(room=>room.id==='basement-archive').enabled,false);
 assert.equal((await f.request('/api/visit',{id:'atrium'},false)).status,200);
 assert.equal((await f.request('/api/visit',{id:'basement-archive'},false)).status,200);
});
test('standalone instances can continue serving original arrivals before configuring the archive key',async()=>{
 const f=await fixture({archive:true,random:()=>.99});
 delete f.env.ARCHIVE_ART_KEY;
 const arrival=await f.request('/api/journey',undefined,false).then(r=>r.json());
 assert.equal(arrival.current,'server');
 assert.equal(arrival.total,3);
 assert.equal((await f.request('/api/art/server',undefined,false)).status,200);
});
