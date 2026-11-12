import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createService} from '../worker/service.js';
import {encryptArt,toBase64} from '../worker/art.js';
import {sqliteDB} from '../scripts/sqlite.mjs';
const sql=(await Promise.all(['0000_journeys','0001_night_desk'].map(n=>readFile(new URL('../drizzle/'+n+'.sql',import.meta.url),'utf8')))).join('\n');
async function fixture(){
 const DB=sqliteDB();DB.raw.exec(sql);let time=1000000;
 const secret=toBase64(crypto.getRandomValues(new Uint8Array(32))),bytes=new TextEncoder().encode('image test fixture');
 const themes=['one','two','three'].map(id=>({id,name:id})),art={};
 for(const {id} of themes)art[id]=await encryptArt(bytes,id,secret);
 const options={themes,art,files:{'/index.html':{type:'text/html',body:btoa('shell')}},config:{firstWaitMinutes:15,waitMinutes:90,jitterMinutes:0},clock:()=>time,random:()=>0};
 const app=createService(options),env={DB,ART_KEY:secret,IDENTITY_MODE:'sites'};
 const request=(path,body,user='account-a',headers={})=>app.fetch(new Request('https://liminal.test'+path,{...(body!==undefined?{method:'POST',body:JSON.stringify(body)}:{}),headers:{...(user?{'oai-authenticated-user-id':user}:{}),'Content-Type':'application/json',...headers}}),env);
 return {DB,env,app,request,options,bytes,art,now:()=>time,advance:n=>time=n};
}
test('parallel arrivals and reloads issue exactly one initial room; cookie and query changes cannot reroll an account',async()=>{
 const f=await fixture();const all=await Promise.all(Array.from({length:20},()=>f.request('/api/journey').then(r=>r.json())));
 assert.equal(new Set(all.map(j=>j.current)).size,1);assert.equal(f.DB.raw.prepare('SELECT count(*) n FROM journeys').get().n,1);
 const again=await (await f.request('/api/journey?space=three',undefined,'account-a',{cookie:'lh_visit='+ 'f'.repeat(64)})).json();
 assert.equal(again.current,all[0].current);assert.equal(again.nextAt,all[0].nextAt);assert.equal(again.scenes.length,1);
 assert.equal((await f.request('/api/journey',undefined,null)).status,401);
});
test('server time and atomic claims defeat forged progress, early requests, and parallel discovery',async()=>{
 const f=await fixture(),first=await (await f.request('/api/journey')).json();
 const forged=await (await f.request('/api/discover',{nextAt:0,visited:['one','two','three'],now:999999999})).json();
 assert.equal(forged.discovered,false);assert.equal(forged.scenes.length,1);assert.equal(forged.nextAt,first.nextAt);
 f.advance(first.nextAt-1);assert.equal((await (await f.request('/api/discover',{})).json()).discovered,false);
 f.advance(first.nextAt);
 const results=await Promise.all(Array.from({length:30},()=>f.request('/api/discover',{}).then(r=>r.json())));
 assert.equal(results.filter(j=>j.discovered).length,1);
 const current=await (await f.request('/api/journey')).json();assert.equal(current.scenes.length,2);assert.equal(current.nextAt,f.now()+90*60000);
 assert.equal((await f.request('/api/visit',{id:'three'})).status,403);
 const revisit=await (await f.request('/api/visit',{id:'one'})).json();assert.equal(revisit.current,'one');assert.equal(revisit.nextAt,current.nextAt);
 f.advance(current.nextAt);const last=await (await f.request('/api/discover',{})).json();assert.equal(last.remaining,0);
 assert.equal((await (await f.request('/api/discover',{})).json()).discovered,false);
});
test('only the current account’s visited artwork is decrypted; missing keys and swapped ciphertext fail closed',async()=>{
 const f=await fixture(),first=await (await f.request('/api/journey')).json();
 assert.equal((await f.request('/api/art/two')).status,404);
 assert.equal((await f.request('/assets/one.webp')).status,404);assert.equal((await f.request('/themes.js')).status,404);
 const image=await f.request('/api/art/one');assert.match(image.headers.get('cache-control'),/private, no-store/);assert.deepEqual(new Uint8Array(await image.arrayBuffer()),f.bytes);
 f.advance(first.nextAt);await f.request('/api/discover',{});await f.request('/api/journey',undefined,'account-b');
 assert.equal((await f.request('/api/art/two',undefined,'account-b')).status,404);
 const goodKey=f.env.ART_KEY;f.art.one=f.art.two;assert.equal((await f.request('/api/art/one')).status,503);
 f.env.ART_KEY=undefined;assert.equal((await f.request('/api/art/one')).status,503);
 f.env.ART_KEY=toBase64(crypto.getRandomValues(new Uint8Array(32)));assert.equal((await f.request('/api/art/one')).status,503);
});
test('cross-origin writes are rejected, and disabling a last remembered theme supplies one replacement',async()=>{
 const f=await fixture();await f.request('/api/journey');
 assert.equal((await f.request('/api/discover',{},'account-a',{origin:'https://elsewhere.test'})).status,403);
 const changed=createService({...f.options,themes:[{id:'two',name:'two'}]});
 const req=()=>changed.fetch(new Request('https://liminal.test/api/journey',{headers:{'oai-authenticated-user-id':'account-a'}}),f.env);
 const rows=await Promise.all(Array.from({length:10},()=>req().then(r=>r.json())));
 assert.ok(rows.every(j=>j.current==='two'&&j.scenes.length===1));
 assert.equal(JSON.parse(f.DB.raw.prepare('SELECT visited FROM journeys').get().visited).filter(x=>x==='two').length,1);
});
test('anonymous mode keeps server-owned progress but honestly treats a new cookie as a new visitor',async()=>{
 const f=await fixture();f.env.IDENTITY_MODE='anonymous';
 const response=await f.request('/api/journey');const cookie=response.headers.get('set-cookie');assert.match(cookie,/HttpOnly/);assert.match(cookie,/Secure/);
 const first=await response.json(),again=await (await f.request('/api/journey',undefined,null,{cookie})).json();assert.equal(first.current,again.current);assert.equal(first.nextAt,again.nextAt);
 await f.request('/api/journey',undefined,null,{cookie:'lh_visit=edited'});
 assert.equal(f.DB.raw.prepare('SELECT count(*) n FROM journeys').get().n,2);
});
