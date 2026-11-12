import {scenes,fragments,observations,chooseScene,readState,signalStrength,isTuned} from './core.js';
import {Atmosphere} from './audio.js';

const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const storageKey='liminal-hacker:v1';
let raw=null;try{raw=localStorage.getItem(storageKey);}catch{}
const state=readState(raw),audio=new Atmosphere();
let current=chooseScene({...state,requested:new URLSearchParams(location.search).get('space')}),immersed=false,toastTimer,panelKind='',lastFocus;
let storageAvailable=true;
const panel=$('#panel'),content=$('#panel-content');
function save(){try{localStorage.setItem(storageKey,JSON.stringify(state));storageAvailable=true;return true;}catch{storageAvailable=false;return false;}}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4000);}
function scene(){return scenes.find(s=>s.id===current);}
function count(){const label=`${state.found.length} / ${Object.keys(fragments).length}`;$('#fragment-count').textContent=label;$('#explore-count').textContent=label;}
function updateLock(){$('#lock-scene').setAttribute('aria-pressed',String(state.locked===current));$('#lock-scene').textContent=state.locked===current?'◆ Staying here':'◇ Stay here';}
function renderSpaces(){
 $('#space-list').innerHTML=scenes.map((s,i)=>`<button class="space-card ${s.id===current?'selected':''}" data-scene-id="${s.id}" aria-pressed="${s.id===current}"><div class="space-photo"><img src="assets/${s.id}.webp" alt="${s.name}: ${s.subtitle}" width="1672" height="941" loading="lazy"><span class="space-tag">0${i+1} / ${s.time}</span>${s.id===current?'<span class="space-selected">YOU ARE HERE</span>':''}</div><div class="space-detail"><div><h3>${s.name}</h3><p>${s.level} · ${s.subtitle}</p></div><span aria-hidden="true">↗</span></div></button>`).join('');
 $$('[data-scene-id]').forEach(b=>b.addEventListener('click',()=>{setScene(b.dataset.sceneId);window.scrollTo({top:0,behavior:'smooth'});}));
}
function renderHotspots(){
 $('#hotspots').innerHTML=scene().hotspots.map((h,i)=>`<button class="hotspot ${state.found.includes(h.fragment)?'found':''}" data-hotspot="${i}" style="left:clamp(95px,${h.x}%,calc(100% - 95px));top:${h.y}%"><span class="hotspot-dot" aria-hidden="true"></span><span class="hotspot-label">${h.label}</span></button>`).join('');
 $$('[data-hotspot]').forEach(b=>b.addEventListener('click',()=>{const h=scene().hotspots[Number(b.dataset.hotspot)];h.type==='fragment'?openFragment(h.fragment):openPanel(h.type);}));
}
function setScene(id){
 if(!scenes.some(s=>s.id===id))return;
 current=id;state.last=id;save();const s=scene();document.documentElement.dataset.scene=id;
 $('#scene-image').style.backgroundImage=`url("assets/${id}.webp")`;
 $('#transmission').textContent=`00${scenes.indexOf(s)+1}`;$('#hero-title').innerHTML=s.title;$('#hero-description').innerHTML=s.description;
 $('#caption-name').textContent=s.name;$('#caption-description').textContent=`${s.level.replace('LEVEL','Level')} · ${s.subtitle}`;$('#caption-status').textContent=s.status;
 $('#explore-index').textContent=`SPACE 0${scenes.indexOf(s)+1} / 03`;$('#explore-name').textContent=s.name;$('#explore-hint').textContent=s.hint;
 audio.setScene(id);renderSpaces();renderHotspots();updateLock();
}
function enterSpace(){immersed=true;document.body.classList.add('immersed');$('#explore').hidden=false;$('main').inert=true;$('.site-header').inert=true;$('.site-footer').inert=true;$('#leave-space').focus();}
function leaveSpace(){immersed=false;document.body.classList.remove('immersed');$('#explore').hidden=true;$('main').inert=false;$('.site-header').inert=false;$('.site-footer').inert=false;$('#enter-space').focus();}
function stepSpace(n){setScene(scenes[(scenes.findIndex(s=>s.id===current)+n+scenes.length)%scenes.length].id);}
function collect(id){if(!fragments[id]||state.found.includes(id))return false;state.found.push(id);const stored=save();count();renderHotspots();toast(stored?`Fragment saved · ${state.found.length} of 7`:'Fragment found · storage unavailable; export your notebook to keep it');return true;}
function showPanel(label,kind){lastFocus=document.activeElement;$('#panel-label').textContent=label;panelKind=kind;content.replaceChildren();if(!panel.open)panel.showModal();}
function closePanel(){panel.close();panelKind='';if(lastFocus?.isConnected&&!lastFocus.disabled)lastFocus.focus();else $(immersed?'#leave-space':'#enter-space').focus();}
function prose(text){const p=document.createElement('p');p.className='panel-prose';p.textContent=text;content.append(p);}
function openFragment(id){const f=fragments[id];showPanel(f.source,'fragment');content.innerHTML=`<p class="panel-eyebrow">SOMETHING LEFT BEHIND</p><h2 class="panel-title">${f.title}</h2>`;prose(f.body);const b=document.createElement('button');b.className='primary panel-action';b.textContent=state.found.includes(id)?'Saved in your notebook ✓':'Keep this fragment ↗';b.disabled=state.found.includes(id);b.addEventListener('click',()=>{collect(id);b.textContent='Saved in your notebook ✓';b.disabled=true;});content.append(b);}
function openObservation(i){const n=observations[i];showPanel(`${n.time} / FIELD NOTES`,'observation');content.innerHTML=`<p class="panel-eyebrow">OBSERVATION 00${i+1}</p><h2 class="panel-title">${n.title}</h2>`;prose(n.body);const hint=document.createElement('p');hint.className='panel-hint';hint.textContent='An imagined field note from this place.';content.append(hint);}
function openNotebook(tab='fragments'){
 showPanel('YOUR FIELD NOTEBOOK','notebook');content.innerHTML=`<h2 class="panel-title">Things worth keeping.</h2><p class="panel-hint">Your notes and discoveries stay in this browser. Export a copy to take them with you.</p><div class="notebook-tabs"><button id="tab-fragments" class="${tab==='fragments'?'active':''}">Fragments · ${state.found.length}/7</button><button id="tab-notes" class="${tab==='notes'?'active':''}">Your notes</button></div><div id="notebook-body"></div><div class="note-actions"><button class="panel-secondary" id="export-notebook">Export notebook ↓</button><span class="panel-hint" id="save-status">${storageAvailable?'Stored on this device':'Storage unavailable — export before leaving'}</span></div>`;
 const body=$('#notebook-body');
 if(tab==='fragments'){
  if(!state.found.length)body.innerHTML='<p class="panel-prose">Nothing here yet. Enter a space, look for a note, or follow a faint signal. There is no hurry.</p>';
  state.found.forEach(id=>{const f=fragments[id],article=document.createElement('article');article.className='fragment';article.innerHTML=`<span class="mono">${f.source}</span><h3>${f.title}</h3>`;const p=document.createElement('p');p.textContent=f.body;article.append(p);body.append(article);});
  if(state.found.length===7){const p=document.createElement('p');p.className='panel-prose';p.textContent='All seven fragments are here. Nothing unlocks a leaderboard. Nothing asks you to come back tomorrow. You found the place. It is yours to return to.';body.append(p);}
 }else{body.innerHTML='<label class="panel-hint" for="personal-notes">What did you notice tonight?</label><textarea id="personal-notes" class="notebook-text" maxlength="20000" placeholder="A thought, a strange detail, a place you remember…"></textarea>';$('#personal-notes').value=state.notes;$('#personal-notes').addEventListener('input',e=>{state.notes=e.target.value;$('#save-status').textContent=save()?'Saved on this device':'Storage unavailable — export before leaving';});}
 $('#tab-fragments').onclick=()=>openNotebook();$('#tab-notes').onclick=()=>openNotebook('notes');$('#export-notebook').onclick=exportNotebook;
}
function exportNotebook(){const data={title:'Liminal Hacker — field notebook',exportedAt:new Date().toISOString(),notes:state.notes,fragments:state.found.map(id=>({id,...fragments[id]}))};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='liminal-hacker-notebook.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Notebook exported. Take a little of this place with you.');}
function openRadio(){
 const s=scene();showPanel(`${s.level} / SIGNAL RECEIVER`,'radio');content.innerHTML=`<p class="panel-eyebrow">LISTEN BETWEEN THE STATIC</p><h2 class="panel-title">Something is out there.</h2><p class="panel-hint">The note in this space holds a frequency. Turn the dial slowly, or use the arrow keys.</p><div class="signal-display"><output class="frequency" id="frequency" for="tuner">98.0 <small>MHz</small></output><div class="signal-meter" id="signal-meter" aria-hidden="true">${Array.from({length:35},(_,i)=>`<i style="height:${7+Math.abs(Math.sin(i*1.8))*22}px"></i>`).join('')}</div></div><label class="dial-label" for="tuner"><span>88.0 MHz</span><span>108.0 MHz</span></label><input id="tuner" type="range" min="88" max="108" step="0.1" value="98" aria-label="Radio frequency in megahertz"><p class="signal-feedback" id="signal-feedback" role="status">Only static. Keep listening.</p><button id="keep-signal" class="primary" disabled>Capture transmission ↗</button><p class="panel-hint">Fictional receiver · works with sound off.</p>`;
 const update=()=>{const v=Number($('#tuner').value),strength=signalStrength(v,s.frequency),tuned=isTuned(v,s.frequency);$('#frequency').innerHTML=`${v.toFixed(1)} <small>MHz</small>`;$('#signal-meter').classList.toggle('locked',tuned);$('#signal-meter').style.opacity=String(.25+strength*.75);$('#signal-feedback').textContent=tuned?'SIGNAL FOUND. A voice is coming through.':strength>.8?'Very close. The static is thinning.':strength>.4?'There is something nearby. Keep turning.':'Only static. Keep listening.';$('#keep-signal').disabled=!tuned;};
 $('#tuner').oninput=update;$('#keep-signal').onclick=()=>{collect(`${s.id}-signal`);openFragment(`${s.id}-signal`);};update();
}
function openTerminal(){
 showPanel(`${scene().level} / LOCAL TERMINAL`,'terminal');content.innerHTML='<div class="terminal"><div id="terminal-output" class="terminal-output" role="log" aria-label="Terminal output" aria-live="polite"></div><form id="terminal-form" class="terminal-form"><label for="terminal-input">visitor ~ $</label><input id="terminal-input" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="200" aria-label="Terminal command"><button type="submit">↵</button></form><div class="terminal-help"><button data-command="help">help</button><button data-command="ls">ls</button><button data-command="scan">scan</button><button data-command="tea">tea</button></div><p class="panel-hint">A fictional local shell. No real connections or commands are executed.</p></div>';
 const output=$('#terminal-output'),input=$('#terminal-input');let history=[],historyIndex=0;
 const print=(message,cls='')=>{const p=document.createElement('p');p.className=cls;p.textContent=message;output.append(p);while(output.children.length>100)output.firstElementChild.remove();output.scrollTop=output.scrollHeight;};
 print('liminalOS / after-hours session\nConnection: somewhere in between\nType “help” to find your way.');
 const run=value=>{const raw=value.trim();if(!raw)return;history.push(raw);historyIndex=history.length;print(`visitor ~ $ ${raw}`,'command');const [cmd,...args]=raw.toLowerCase().split(/\s+/);const arg=args.join(' ');input.value='';
  switch(cmd){
   case 'help':print('help             a little orientation\nls               things in this space\ncat note.txt     read what was left behind\nwhoami           a familiar question\npwd              where you ended up\nscan             listen for local signals\ntune <MHz>       tune a known frequency\nwalk <place>     atrium / rooftop / server\nmap              see the floor plan\nnotebook         things worth keeping\ntea              take a small break\nclear            a fresh screen\nexit             close the terminal');break;
   case 'ls':print('note.txt    receiver.dev    kettle.sh\nA patient cursor. A chair that is still warm.');break;
   case 'cat':if(arg==='note.txt')print(fragments[`${current}-note`].body+'\n\nFind the note in the space to keep it.');else print('No such file. Try: cat note.txt');break;
   case 'whoami':print('visitor@in-between\nA curious person with permission to be here.');break;
   case 'pwd':print(`/after-hours/${current}\n${scene().name} · ${scene().time}`);break;
   case 'scan':print(`Listening locally…\nA faint carrier somewhere between ${(scene().frequency-.8).toFixed(1)} and ${(scene().frequency+.8).toFixed(1)} MHz.\nThe note may have a more precise frequency.`);break;
   case 'tune':if(!arg||!Number.isFinite(Number(arg)))print('Usage: tune 93.7');else if(isTuned(arg,scene().frequency)){collect(`${current}-signal`);print(fragments[`${current}-signal`].body+'\n\nTransmission saved to your notebook.');}else print('Static. Try the frequency written on the note.');break;
   case 'walk':if(scenes.some(s=>s.id===arg)){setScene(arg);$('#panel-label').textContent=`${scene().level} / LOCAL TERMINAL`;print(`${scene().name}.\n${scene().status}`);}else print('Places: atrium, rooftop, server');break;
   case 'tea':case './kettle.sh':collect('tea');print(fragments.tea.body+'\n\nA small ritual saved to your notebook.');break;
   case 'map':openMap();return;
   case 'notebook':openNotebook();return;
   case 'clear':output.replaceChildren();break;
   case 'exit':closePanel();return;
   case 'sudo':print('You already have permission to rest.');break;
   case 'ping':print('reply from the quiet: you are here.');break;
   default:print(`“${raw.split(/\s/)[0]}” is not in this little shell. Try help.`);
  }input.focus();
 };
 $('#terminal-form').onsubmit=e=>{e.preventDefault();run(input.value);};$$('[data-command]').forEach(b=>b.onclick=()=>run(b.dataset.command));input.addEventListener('keydown',e=>{if(e.key==='ArrowUp'){e.preventDefault();historyIndex=Math.max(0,historyIndex-1);input.value=history[historyIndex]||'';}if(e.key==='ArrowDown'){e.preventDefault();historyIndex=Math.min(history.length,historyIndex+1);input.value=history[historyIndex]||'';}});input.focus();
}
function openMap(){showPanel('BUILDING DIRECTORY / AFTER HOURS','map');content.innerHTML='<h2 class="panel-title">A few places to get lost.</h2><p class="panel-hint">All three spaces are open. The journey is yours to choose.</p><svg class="floor-map" viewBox="0 0 500 220" role="img" aria-label="Rooftop, atrium and server room connected by a central stairwell"><g fill="none" stroke="currentColor" opacity=".35"><path d="M60 20h210v45H60zM90 90h300v55H90zM150 170h270v40H150zM300 20h25v190M270 42h55M325 115h65M325 190h95"/><path d="M301 30h23m-23 10h23m-23 10h23m-23 25h23m-23 10h23m-23 70h23m-23 10h23"/></g><text x="80" y="47">09 / ROOFTOP RELAY</text><text x="110" y="122">00 / ATRIUM</text><text x="170" y="195">−01 / WARM MACHINE</text></svg><div class="map-list">'+scenes.map(s=>`<button data-map-scene="${s.id}">${s.name}<span>${s.level} ${s.id===current?'· YOU ARE HERE':'↗'}</span></button>`).join('')+'</div>';$$('[data-map-scene]').forEach(b=>b.onclick=()=>{setScene(b.dataset.mapScene);closePanel();enterSpace();});}
function openQuiet(){showPanel('A LITTLE TIME / NOTHING REQUIRED','quiet');content.innerHTML='<div class="quiet-message"><p class="panel-eyebrow">YOU CAN JUST BE HERE.</p><h2 class="panel-title">Let the world<br>run without you.</h2><p class="panel-prose">No timer. No streak. No next task.<br>Just a little light in a very large room.</p><button id="quiet-sound" class="panel-secondary">'+(audio.active?'Turn the sound off':'Let the room hum')+'</button><div class="volume-control"><label for="volume">AMBIENCE VOLUME</label><input id="volume" type="range" min="0" max="100" value="'+Math.round(audio.volume*100)+'"></div><button id="quiet-view" class="text-button">Watch the empty room ↗</button></div>';$('#quiet-sound').onclick=async()=>{await toggleSound();$('#quiet-sound').textContent=audio.active?'Turn the sound off':'Let the room hum';};$('#volume').oninput=e=>audio.setVolume(Number(e.target.value)/100);$('#quiet-view').onclick=()=>{closePanel();enterSpace();};}
function openAbout(){showPanel('LIMINAL HACKER / ABOUT THIS PLACE','about');content.innerHTML='<p class="panel-eyebrow">HACKING THE IN-BETWEEN, AFTER HOURS.</p><h2 class="panel-title">Empty, but not alone.</h2>';prose('Kenopsia: the strange feeling of a place usually full of people, now quiet.\n\nThis is an interactive sketch of that feeling, with a little warmth left inside it. Three imagined spaces. Seven small fragments. A terminal that has time for you.\n\nThe hacker here is a curious tinkerer: learning, repairing, and exploring systems with permission.\n\nEvery fresh visit opens a different space. “Stay here” remembers a favourite. Sound is optional and begins only when you ask. No jump scares or flashing effects.');const p=document.createElement('p');p.className='panel-hint';p.textContent='Original fictional writing and AI-created scene artwork. Notes and discoveries are saved only in this browser; clearing site data removes them. No analytics or external assets are loaded by the site. The hosting service may keep ordinary access logs.';content.append(p);}
function openPanel(kind){({terminal:openTerminal,radio:openRadio,notebook:openNotebook,map:openMap,quiet:openQuiet,about:openAbout}[kind]||openAbout)();}
async function toggleSound(){try{await audio.toggle(current);const active=audio.active;$('#sound-toggle').setAttribute('aria-pressed',String(active));$('#sound-label').textContent=active?'Sound on':'Sound off';$('#explore-sound').textContent=active?'Sound on':'Sound off';}catch{toast('Sound could not start in this browser. The spaces work in silence, too.');}}

$('#enter-space').onclick=enterSpace;$('#leave-space').onclick=leaveSpace;$('#previous-space').onclick=()=>stepSpace(-1);$('#next-space').onclick=()=>stepSpace(1);
$('#drift').onclick=()=>{setScene(chooseScene({last:current}));window.scrollTo({top:0,behavior:'smooth'});toast(`Arrived at ${scene().name.toLowerCase()}.`);};
$('#lock-scene').onclick=()=>{state.locked=state.locked===current?null:current;const stored=save();updateLock();toast(stored?(state.locked?'This space will welcome you next time.':'You’ll arrive somewhere different next time.'):'This choice cannot be saved in this browser.');};
$('#sound-toggle').onclick=toggleSound;$('#explore-sound').onclick=toggleSound;$('#stay-awhile').onclick=openQuiet;
$$('[data-open]').forEach(b=>b.onclick=()=>openPanel(b.dataset.open));$$('[data-note]').forEach(b=>b.onclick=()=>openObservation(Number(b.dataset.note)));
$('#close-panel').onclick=closePanel;panel.addEventListener('click',e=>{if(e.target===panel){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closePanel();}});
panel.addEventListener('close',()=>{panelKind='';});
document.addEventListener('keydown',e=>{if(panel.open)return;if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='Escape'&&immersed)leaveSpace();if(e.key==='`'||e.key==='~'){e.preventDefault();openTerminal();}if(immersed&&e.key==='ArrowRight')stepSpace(1);if(immersed&&e.key==='ArrowLeft')stepSpace(-1);});
document.addEventListener('visibilitychange',()=>audio.pauseHidden(document.hidden).catch(()=>{}));
function tick(){$('#local-time').textContent=`LOCAL TIME — ${new Date().toLocaleTimeString('en-GB',{hour12:false})}`;}tick();setInterval(tick,1000);
setScene(current);count();
