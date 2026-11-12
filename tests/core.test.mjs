import test from 'node:test';
import {themes} from '../content/themes.js';
import {configureScenes} from '../web/core.js';
configureScenes(themes.filter(t=>t.enabled!==false));
import assert from 'node:assert/strict';
import {chooseScene,readState,isTuned,signalStrength,scenes,fragments} from '../web/core.js';
test('fresh arrivals avoid the previous room, but respect a valid lock or direct link',()=>{
 for(const s of scenes)for(const rng of [0,.1,.5,.99])assert.notEqual(chooseScene({last:s.id},()=>rng),s.id);
 assert.equal(chooseScene({last:'atrium',locked:'atrium'}),'atrium');
 assert.equal(chooseScene({locked:'atrium',requested:'rooftop'}),'rooftop');
 const fallback=chooseScene({locked:'untrusted',requested:'bogus'});
 assert.ok(scenes.some(s=>s.id===fallback));
});
test('damaged browser data is recovered without losing valid discoveries',()=>{
 assert.deepEqual(readState('{broken').found,[]);
 assert.deepEqual(readState('null').found,[]);
 const loaded=readState(JSON.stringify({found:['tea','tea','fake','__proto__','atrium-note'],notes:'x'.repeat(30000),locked:'bogus',last:'server'}));
 assert.deepEqual(loaded.found,['tea','atrium-note']);assert.equal(loaded.notes.length,20000);assert.equal(loaded.locked,null);assert.equal(loaded.last,'server');
});
test('each station has a reachable exact frequency and does not reward adjacent steps',()=>{
 for(const s of scenes){assert.ok(isTuned(s.frequency,s.frequency));assert.ok(isTuned(s.frequency.toFixed(1),s.frequency));assert.equal(isTuned(s.frequency+.1,s.frequency),false);assert.ok(fragments[`${s.id}-signal`]);assert.ok(fragments[`${s.id}-note`]);assert.equal(signalStrength(s.frequency,s.frequency),1);}
 assert.equal(isTuned('nonsense',93.7),false);assert.equal(signalStrength(88,108),0);
});
