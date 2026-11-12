import test from 'node:test';
import {themes} from '../content/themes.js';
import {configureScenes} from '../web/core.js';
configureScenes(themes.filter(t=>t.enabled!==false));
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {sealBundle,decryptBundle,normalizePhrase,doorReady,doorPrerequisites,validateRoom,base64ToBytes,bytesToBase64} from '../web/vault.js';
import {scenes,fragments,readState,chooseScene} from '../web/core.js';
test('encrypted bundles need the right phrase, authenticate changes, and use fresh randomness',async()=>{
 const fixture={test:'not production content',image:{base64:'fixture only'}};
 const first=await sealBundle(fixture,['fixture','demo','sample']);
 const second=await sealBundle(fixture,['fixture','demo','sample']);
 assert.notEqual(first.salt,second.salt);assert.notEqual(first.iv,second.iv);assert.notEqual(first.ciphertext,second.ciphertext);
 assert.deepEqual(await decryptBundle(first,['FIXTURE','demo','sample']),fixture);
 await assert.rejects(()=>decryptBundle(first,['wrong','demo','sample']));
 const tampered=base64ToBytes(first.ciphertext);tampered[0]^=1;
 await assert.rejects(()=>decryptBundle({...first,ciphertext:bytesToBase64(tampered)},['fixture','demo','sample']));
 await assert.rejects(()=>decryptBundle({...first,iterations:999999999},['fixture','demo','sample']));
 assert.throws(()=>validateRoom({scene:{}}));
});
test('door discovery requires the whole route and never trusts an unlocked flag',()=>{
 assert.equal(doorReady(doorPrerequisites),true);
 for(const id of doorPrerequisites)assert.equal(doorReady(doorPrerequisites.filter(x=>x!==id)),false);
 const state=readState(JSON.stringify({found:['tea'],unlocked:true,locked:'unlisted',last:'unlisted'}));
 assert.equal(doorReady(state.found),false);assert.equal(state.locked,null);assert.equal(state.last,null);assert.equal(state.unlocked,undefined);
});
test('theme definitions remain complete and a single enabled room still works',async()=>{
 assert.equal(new Set(scenes.map(s=>s.id)).size,scenes.length);
 for(const s of scenes){assert.match(s.id,/^[a-z][a-z0-9-]*$/);assert.match(s.accent,/^#[0-9a-f]{6}$/i);assert.equal(s.heading.length,2);assert.ok(s.heading.every(x=>typeof x==='string'));assert.ok(s.note.body);assert.ok(s.signal.body);assert.ok(await readFile(new URL('../content/art/'+s.id+'.json',import.meta.url)));}
 assert.equal(chooseScene({last:'only'},()=>.9,[{id:'only'}]),'only');
 assert.throws(()=>chooseScene({},Math.random,[]));
 for(const id of doorPrerequisites)assert.ok(fragments[id],'Keep the clue rooms enabled, or redesign the optional door route.');
 assert.equal(Object.keys(fragments).length,scenes.length*2+1);
});
test('production vault contains only an encrypted envelope, not room metadata or artwork',async()=>{
 const bundle=JSON.parse(await readFile(new URL('../web/vault/door.json',import.meta.url),'utf8'));
 assert.deepEqual(Object.keys(bundle).sort(),['ciphertext','format','iterations','iv','kdf','salt'].sort());
 assert.equal(bundle.format,'lh-room-1');assert.ok(bundle.ciphertext.length>1000);
 const assets=await readdir(new URL('../web/assets/',import.meta.url));
 assert.equal(assets.some(name=>/secret|unlisted|sealed-room|greenhouse/.test(name)),false);
 assert.equal(normalizePhrase([' FiXtUrE ','de-mo','sam ple']),'fixture|demo|sample');
});
