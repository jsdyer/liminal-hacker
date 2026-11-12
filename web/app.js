import {scenes,fragments,observations,configureScenes,readState,signalStrength,isTuned} from './core.js';
import {Atmosphere} from './audio.js';
import {decryptBundle,validateRoom,doorReady,doorPrerequisites} from './vault.js';

const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const storageKey='liminal-hacker:v1';
let raw=null;try{raw=localStorage.getItem(storageKey);}catch{}
const state=readState(raw),audio=new Atmosphere();
let current=null,journey=null,serverOffset=0,travelBusy=false,immersed=false,toastTimer,panelKind='',lastFocus;
let storageAvailable=true,hiddenScene=null,hiddenLetter=null,hiddenImageURL=null,unlockAttempt=0;
let totalFragments=1;
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const allScenes=()=>hiddenScene?[...scenes,hiddenScene]:scenes;
const two=value=>String(value).padStart(2,'0');
const panel=$('#panel'),content=$('#panel-content');
function save(){try{localStorage.setItem(storageKey,JSON.stringify(state));storageAvailable=true;return true;}catch{storageAvailable=false;return false;}}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4000);}
function scene(){return allScenes().find(s=>s.id===current);}
function count(){const label=`${state.found.length} / ${totalFragments}`;$('#fragment-count').textContent=label;$('#explore-count').textContent=label;}
function updateLock(){
 const remain=journey?Math.max(0,journey.nextAt-(Date.now()+serverOffset)):0;
 const ready=journey&&!journey.paused&&remain<=0&&journey.remaining>0;
 $('#drift').disabled=travelBusy||!ready;
 $('#drift').textContent=travelBusy?'Listening…':ready?'A passage is open →':journey?.remaining===0?'All current passages are familiar':'The building is quiet';
 $('#journey-status').textContent=journey?.paused?journey.pauseMessage:!journey?'Listening for a place…':journey.remaining===0?'All listed places found. Stay as long as you like.':ready?'Something has shifted. A new place is waiting.':`Another passage in about ${remain>3600000?Math.ceil(remain/3600000)+' hours':Math.max(1,Math.ceil(remain/60000))+' minutes'}. No need to keep this page open.`;
 $('#journey-count').textContent=journey?`${scenes.length} ${scenes.length===1?'place':'places'} remembered · ${journey.remaining} still beyond the door`:'';
}
async function api(path,data){
 const response=await fetch('api/'+path,{credentials:'same-origin',cache:'no-store',...(data?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}:{})});
 const result=await response.json();if(!response.ok){const error=new Error(result.error||'The passage is unavailable.');error.signIn=result.signIn;throw error;}return result;
}
function acceptJourney(result){
 journey=result;serverOffset=result.serverNow-Date.now();configureScenes(result.scenes);totalFragments=result.total*2+1;
 setScene(result.current);count();updateLock();$('#night-desk').hidden=!result.isAdmin;$('#night-transmission').textContent=result.broadcast||'';$('#night-transmission').hidden=!result.broadcast;
}
async function visitScene(id){
 if(id==='unlisted'&&hiddenScene){setScene(id);return true;}
 if(travelBusy)return false;travelBusy=true;updateLock();
 try{acceptJourney(await api('visit',{id}));return true;}catch(e){toast(e.message);return false;}finally{travelBusy=false;updateLock();}
}
async function discover(){
 if(travelBusy)return;travelBusy=true;updateLock();
 try{const result=await api('discover',{});acceptJourney(result);toast(result.message);if(result.discovered){document.body.classList.add('new-arrival');setTimeout(()=>document.body.classList.remove('new-arrival'),1800);window.scrollTo({top:0,behavior:'smooth'});}}
 catch(e){toast(e.message);}finally{travelBusy=false;updateLock();}
}
function renderSpaces(){
 $('#space-list').innerHTML=allScenes().map((s,i)=>`<button class="space-card ${s.id===current?'selected':''}" data-scene-id="${s.id}" aria-pressed="${s.id===current}"><div class="space-photo"><img src="${escapeHTML(s.image)}" alt="${escapeHTML(s.name+': '+s.subtitle)}" width="1672" height="941" loading="lazy"><span class="space-tag">${s.id==='unlisted'?'??':two(i+1)} / ${escapeHTML(s.time)}</span>${s.id===current?'<span class="space-selected">YOU ARE HERE</span>':''}</div><div class="space-detail"><div><h3>${escapeHTML(s.name)}</h3><p>${escapeHTML(s.level)} · ${escapeHTML(s.subtitle)}</p></div><span aria-hidden="true">→</span></div></button>`).join('');
 $$('[data-scene-id]').forEach(b=>b.addEventListener('click',async()=>{if(await visitScene(b.dataset.sceneId))window.scrollTo({top:0,behavior:'smooth'});}));
 if(journey?.remaining){const hint=document.createElement('div');hint.className='unseen-card';hint.innerHTML='<span class="unseen-door" aria-hidden="true">▯</span><span>Somewhere, a light is on.</span><small>'+journey.remaining+' places have not found you yet.</small>';$('#space-list').append(hint);}
}
function renderHotspots(){
 $('#hotspots').innerHTML=scene().hotspots.map((h,i)=>`<button class="hotspot ${state.found.includes(h.fragment)?'found':''}" data-hotspot="${i}" style="left:clamp(95px,${h.x}%,calc(100% - 95px));top:${h.y}%"><span class="hotspot-dot" aria-hidden="true"></span><span class="hotspot-label">${escapeHTML(h.label)}</span></button>`).join('');
 $$('[data-hotspot]').forEach(b=>b.addEventListener('click',()=>{const h=scene().hotspots[Number(b.dataset.hotspot)];h.type==='fragment'?openFragment(h.fragment):openPanel(h.type);}));
}
function setScene(id){
 if(!allScenes().some(s=>s.id===id))return;
 current=id;const s=scene();document.documentElement.dataset.scene=id;
 document.documentElement.style.setProperty('--accent',s.accent);document.documentElement.style.setProperty('--line',s.accent+'33');
 $('#scene-image').style.backgroundImage=`url("${s.image}")`;
 $('#transmission').textContent=id==='unlisted'?'???':String(scenes.indexOf(s)+1).padStart(3,'0');
 $('#hero-title').innerHTML=`${escapeHTML(s.heading[0])}<br><em>${escapeHTML(s.heading[1])}</em>`;$('#hero-description').textContent=s.description;
 $('#caption-name').textContent=s.name;$('#caption-description').textContent=`${s.level.toLowerCase().replace(/^./,c=>c.toUpperCase())} · ${s.subtitle}`;$('#caption-status').textContent=s.status;
 $('#explore-index').textContent=id==='unlisted'?'AN UNLISTED PLACE':`SPACE ${two(scenes.indexOf(s)+1)} / ${two(journey.total)}`;$('#explore-name').textContent=s.name;$('#explore-hint').textContent=s.hint;
 audio.setScene(s.sound);renderSpaces();renderHotspots();updateLock();
}
function enterSpace(){if(!journey)return;immersed=true;document.body.classList.add('immersed');$('#explore').hidden=false;$('main').inert=true;$('.site-header').inert=true;$('.site-footer').inert=true;$('#leave-space').focus();}
function leaveSpace(){immersed=false;document.body.classList.remove('immersed');$('#explore').hidden=true;$('main').inert=false;$('.site-header').inert=false;$('.site-footer').inert=false;$('#enter-space').focus();}
function stepSpace(n){const list=allScenes();visitScene(list[(list.findIndex(s=>s.id===current)+n+list.length)%list.length].id);}
function collect(id){if(!fragments[id]||state.found.includes(id))return false;const doorWasReady=doorReady(state.found);state.found.push(id);const stored=save();count();renderHotspots();toast(!stored?'Fragment found · storage unavailable; export your notebook to keep it':!doorWasReady&&doorReady(state.found)?'A door is waiting. Try knock at a terminal.':`Fragment saved · ${state.found.length} of ${totalFragments}`);return true;}
function showPanel(label,kind){if(!panel.open)lastFocus=document.activeElement;unlockAttempt++;$('#panel-label').textContent=label;panelKind=kind;content.replaceChildren();if(!panel.open)panel.showModal();}
function closePanel(){unlockAttempt++;panel.close();panelKind='';if(lastFocus?.isConnected&&!lastFocus.disabled)lastFocus.focus();else $(immersed?'#leave-space':'#enter-space').focus();}
function prose(text){const p=document.createElement('p');p.className='panel-prose';p.textContent=text;content.append(p);}
function openFragment(id){const f=fragments[id];showPanel(f.source,'fragment');content.innerHTML=`<p class="panel-eyebrow">SOMETHING LEFT BEHIND</p><h2 class="panel-title">${escapeHTML(f.title)}</h2>`;prose(f.body);const b=document.createElement('button');b.className='primary panel-action';b.textContent=state.found.includes(id)?'Saved in your notebook ✓':'Keep this fragment →';b.disabled=state.found.includes(id);b.addEventListener('click',()=>{collect(id);b.textContent='Saved in your notebook ✓';b.disabled=true;});content.append(b);}
function openObservation(i){const n=observations[i];showPanel(`${n.time} / FIELD NOTES`,'observation');content.innerHTML=`<p class="panel-eyebrow">OBSERVATION 00${i+1}</p><h2 class="panel-title">${n.title}</h2>`;prose(n.body);const hint=document.createElement('p');hint.className='panel-hint';hint.textContent='An imagined field note from this place.';content.append(hint);}
function openNotebook(tab='fragments'){
 showPanel('YOUR FIELD NOTEBOOK','notebook');content.innerHTML=`<h2 class="panel-title">Things worth keeping.</h2><p class="panel-hint">Your notes and discoveries stay in this browser. Export a copy to take them with you.</p><div class="notebook-tabs"><button id="tab-fragments" class="${tab==='fragments'?'active':''}">Fragments · ${state.found.length}/${totalFragments}</button><button id="tab-notes" class="${tab==='notes'?'active':''}">Your notes</button></div><div id="notebook-body"></div><div class="note-actions"><button class="panel-secondary" id="export-notebook">Export notebook ↓</button><span class="panel-hint" id="save-status">${storageAvailable?'Stored on this device':'Storage unavailable — export before leaving'}</span></div>`;
 const body=$('#notebook-body');
 if(tab==='fragments'){
  if(!state.found.length)body.innerHTML='<p class="panel-prose">Nothing here yet. Enter a space, look for a note, or follow a faint signal. There is no hurry.</p>';
  state.found.forEach(id=>{const f=fragments[id]||{source:'AN EARLIER VISIT',title:'A place you remember',body:'This fragment is kept. Its place will find you again.'},article=document.createElement('article');article.className='fragment';article.innerHTML=`<span class="mono">${escapeHTML(f.source)}</span><h3>${escapeHTML(f.title)}</h3>`;const p=document.createElement('p');p.textContent=f.body;article.append(p);body.append(article);});
  if(state.found.length===totalFragments){const p=document.createElement('p');p.className='panel-prose';p.textContent='All the listed fragments are here. Nothing unlocks a leaderboard. Nothing asks you to come back tomorrow. You found the place. It is yours to return to.';body.append(p);}
 }else{body.innerHTML='<label class="panel-hint" for="personal-notes">What did you notice tonight?</label><textarea id="personal-notes" class="notebook-text" maxlength="20000" placeholder="A thought, a strange detail, a place you remember…"></textarea>';$('#personal-notes').value=state.notes;$('#personal-notes').addEventListener('input',e=>{state.notes=e.target.value;$('#save-status').textContent=save()?'Saved on this device':'Storage unavailable — export before leaving';});}
 $('#tab-fragments').onclick=()=>openNotebook();$('#tab-notes').onclick=()=>openNotebook('notes');$('#export-notebook').onclick=exportNotebook;
}
function exportNotebook(){const data={title:'Liminal Hacker — field notebook',exportedAt:new Date().toISOString(),notes:state.notes,fragments:state.found.map(id=>({id,...fragments[id]}))};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='liminal-hacker-notebook.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Notebook exported. Take a little of this place with you.');}
function openRadio(){
 const s=scene();showPanel(`${s.level} / SIGNAL RECEIVER`,'radio');content.innerHTML=`<p class="panel-eyebrow">LISTEN BETWEEN THE STATIC</p><h2 class="panel-title">Something is out there.</h2><p class="panel-hint">The note in this space holds a frequency. Turn the dial slowly, or use the arrow keys.</p><div class="signal-display"><output class="frequency" id="frequency" for="tuner">98.0 <small>MHz</small></output><div class="signal-meter" id="signal-meter" aria-hidden="true">${Array.from({length:35},(_,i)=>`<i style="height:${7+Math.abs(Math.sin(i*1.8))*22}px"></i>`).join('')}</div></div><label class="dial-label" for="tuner"><span>88.0 MHz</span><span>108.0 MHz</span></label><input id="tuner" type="range" min="88" max="108" step="0.1" value="98" aria-label="Radio frequency in megahertz"><p class="signal-feedback" id="signal-feedback" role="status">Only static. Keep listening.</p><button id="keep-signal" class="primary" disabled>Capture transmission →</button><p class="panel-hint">Fictional receiver · works with sound off.</p>`;
 const update=()=>{const v=Number($('#tuner').value),strength=signalStrength(v,s.frequency),tuned=isTuned(v,s.frequency);$('#frequency').innerHTML=`${v.toFixed(1)} <small>MHz</small>`;$('#signal-meter').classList.toggle('locked',tuned);$('#signal-meter').style.opacity=String(.25+strength*.75);$('#signal-feedback').textContent=tuned?'SIGNAL FOUND. A voice is coming through.':strength>.8?'Very close. The static is thinning.':strength>.4?'There is something nearby. Keep turning.':'Only static. Keep listening.';$('#keep-signal').disabled=!tuned;};
 $('#tuner').oninput=update;$('#keep-signal').onclick=()=>{collect(`${s.id}-signal`);openFragment(`${s.id}-signal`);};update();
}
function openTerminal(){
 showPanel(`${scene().level} / LOCAL TERMINAL`,'terminal');content.innerHTML='<div class="terminal"><div id="terminal-output" class="terminal-output" role="log" aria-label="Terminal output" aria-live="polite"></div><form id="terminal-form" class="terminal-form"><label for="terminal-input">visitor ~ $</label><input id="terminal-input" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="200" aria-label="Terminal command"><button type="submit">↵</button></form><div class="terminal-help"><button data-command="help">help</button><button data-command="ls">ls</button><button data-command="scan">scan</button><button data-command="tea">tea</button></div><p class="panel-hint">A fictional local shell. No real connections or commands are executed.</p></div>';
 const output=$('#terminal-output'),input=$('#terminal-input');let history=[],historyIndex=0;
 const print=(message,cls='')=>{const p=document.createElement('p');p.className=cls;p.textContent=message;output.append(p);while(output.children.length>100)output.firstElementChild.remove();output.scrollTop=output.scrollHeight;};
 print('liminalOS / after-hours session\nConnection: somewhere in between\nType “help” to find your way.');
 const run=async value=>{const raw=value.trim();if(!raw)return;history.push(raw);historyIndex=history.length;print(`visitor ~ $ ${raw}`,'command');const [cmd,...args]=raw.toLowerCase().split(/\s+/);const arg=args.join(' ');input.value='';
  switch(cmd){
   case 'help':print('help             a little orientation\nls               things in this space\ncat note.txt     read what was left behind\nwhoami           a familiar question\npwd              where you ended up\nscan             listen for local signals\ntune <MHz>       tune a known frequency\nwalk <place>     use places below\nmap              see the floor plan\nnotebook         things worth keeping\ntea              take a small break\nclear            a fresh screen\nexit             close the terminal');print('Places: '+allScenes().map(s=>s.id).join(', '));break;
   case 'ls':print('note.txt    receiver.dev    kettle.sh\nA patient cursor. A chair that is still warm.');if(arg==='-a'||doorReady(state.found))print('.door — the shell understands knock');break;
   case 'cat':if(arg==='note.txt')print((current==='unlisted'?hiddenLetter.body:fragments[`${current}-note`].body)+'\n\nA little evidence that someone was here.');else print('No such file. Try: cat note.txt');break;
   case 'whoami':print('visitor@in-between\nA curious person with permission to be here.');break;
   case 'pwd':print(`/after-hours/${current}\n${scene().name} · ${scene().time}`);break;
   case 'scan':if(current==='unlisted'){print('No carrier. The room is quiet on purpose.');break;}print(`Listening locally…\nA faint carrier somewhere between ${(scene().frequency-.8).toFixed(1)} and ${(scene().frequency+.8).toFixed(1)} MHz.\nThe note may have a more precise frequency.`);break;
   case 'tune':if(current==='unlisted'){print('The receiver has gone quiet.');break;}if(!arg||!Number.isFinite(Number(arg)))print('Usage: tune 93.7');else if(isTuned(arg,scene().frequency)){collect(`${current}-signal`);print(fragments[`${current}-signal`].body+'\n\nTransmission saved to your notebook.');}else print('Static. Try the frequency written on the note.');break;
   case 'walk':if(allScenes().some(s=>s.id===arg)){if(!await visitScene(arg))break;$('#panel-label').textContent=`${scene().level} / LOCAL TERMINAL`;print(`${scene().name}.\n${scene().status}`);}else print('That place has not found you yet. Remembered places: '+allScenes().map(s=>s.id).join(', '));break;
   case 'tea':case './kettle.sh':collect('tea');print(fragments.tea.body+'\n\nA small ritual saved to your notebook.');break;
   case 'knock':openDoor();return;
   case 'man':if(arg==='night')print('NIGHT(1)\nNo arguments required. Exit whenever you are ready.');else print('The night manual is available: man night');break;
   case 'uptime':print('Up long enough. The machine can take the next shift.');break;
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
function openMap(){
 showPanel('BUILDING DIRECTORY / AFTER HOURS','map');
 content.innerHTML='<h2 class="panel-title">A few places to get lost.</h2><p class="panel-hint">'+scenes.length+' remembered spaces. The rest will find you in time.</p><div class="map-list">'+allScenes().map((s,i)=>`<button data-map-scene="${s.id}"><span>${s.id==='unlisted'?'??':two(i+1)}</span> ${escapeHTML(s.name)}<span>${escapeHTML(s.level)} ${s.id===current?'· YOU ARE HERE':'→'}</span></button>`).join('')+'</div>';
 if(doorReady(state.found)){const b=document.createElement('button');b.className='text-button panel-action';b.textContent=hiddenScene?'Visit the unlisted room →':'There is a door missing from this list. Knock →';b.onclick=()=>hiddenScene?(closePanel(),setScene('unlisted'),enterSpace()):openDoor();content.append(b);}
 $$('[data-map-scene]').forEach(b=>b.onclick=async()=>{if(await visitScene(b.dataset.mapScene)){closePanel();enterSpace();}});
}
function openQuiet(){showPanel('A LITTLE TIME / NOTHING REQUIRED','quiet');content.innerHTML='<div class="quiet-message"><p class="panel-eyebrow">YOU CAN JUST BE HERE.</p><h2 class="panel-title">Let the world<br>run without you.</h2><p class="panel-prose">No timer. No streak. No next task.<br>Just a little light in a very large room.</p><button id="quiet-sound" class="panel-secondary">'+(audio.active?'Turn the sound off':'Let the room hum')+'</button><div class="volume-control"><label for="volume">AMBIENCE VOLUME</label><input id="volume" type="range" min="0" max="100" value="'+Math.round(audio.volume*100)+'"></div><button id="quiet-view" class="text-button">Watch the empty room →</button></div>';$('#quiet-sound').onclick=async()=>{await toggleSound();$('#quiet-sound').textContent=audio.active?'Turn the sound off':'Let the room hum';};$('#volume').oninput=e=>audio.setVolume(Number(e.target.value)/100);$('#quiet-view').onclick=()=>{closePanel();enterSpace();};}
function openAbout(){showPanel('LIMINAL HACKER / ABOUT THIS PLACE','about');content.innerHTML='<p class="panel-eyebrow">HACKING THE IN-BETWEEN, AFTER HOURS.</p><h2 class="panel-title">Empty, but not alone.</h2>';prose('Kenopsia: the strange feeling of a place usually full of people, now quiet.\n\nThis is an interactive sketch of that feeling, with a little warmth left inside it. An expanding collection of imagined spaces and small fragments. A terminal that has time for you.\n\nThe hacker here is a curious tinkerer: learning, repairing, and exploring systems with permission.\n\nYour arrival stays with you. Return to places you remember, and let time open the next passage. Refreshing does not hurry the building. Sound is optional and begins only when you ask. No jump scares or flashing effects.');const p=document.createElement('p');p.className='panel-hint';p.textContent='Original fictional writing and AI-created scene artwork. Your collection of places is kept on the server. With account identity it follows your sign-in; anonymous self-hosted visits use a browser session cookie. Notebook writing and fragments stay only in this browser. The site keeps aggregate first-arrival, discovery and revisit counts. No third-party analytics or external assets are loaded. The hosting service may keep ordinary access logs.';content.append(p);}
function openSecretLetter(){if(!hiddenLetter)return;showPanel('A LETTER / ON THE OTHER SIDE','secretLetter');const title=document.createElement('h2');title.className='panel-title';title.textContent=hiddenLetter.title;content.append(title);prose(hiddenLetter.body);}
function openDoor(){
 showPanel('AN UNLISTED DOOR','door');
 content.innerHTML='<p class="panel-eyebrow">SOMETHING THE DIRECTORY LEFT OUT</p><h2 class="panel-title">Three things to carry.</h2>';
 if(hiddenScene){prose('The door remembers you for this visit.');const b=document.createElement('button');b.className='primary panel-action';b.textContent='Go back inside →';b.onclick=()=>{closePanel();setScene('unlisted');enterSpace();};content.append(b);return;}
 if(!doorReady(state.found)){
  prose('A mark in the wood: listen at the shelf, the water, and the departure. Keep their transmissions. Then make a little tea.');
  const list=document.createElement('ul');list.className='door-progress';
  const labels=['The overnight stacks transmission','The still-water room transmission','The last platform transmission','A cup of tea at a terminal'];
  doorPrerequisites.forEach((id,i)=>{const item=document.createElement('li');item.textContent=`${state.found.includes(id)?'✓':'○'} ${labels[i]}`;list.append(item);});content.append(list);return;
 }
 prose('Each transmission asks for one word. Bring them in order: the shelf, the water, the departure.');
 const form=document.createElement('form');form.className='door-form';form.innerHTML='<label for="door-shelf">01 / The shelf</label><input id="door-shelf" name="shelf" required maxlength="40" autocomplete="off" spellcheck="false" placeholder="What the light leaves"><label for="door-water">02 / The water</label><input id="door-water" name="water" required maxlength="40" autocomplete="off" spellcheck="false" placeholder="What moves beneath"><label for="door-departure">03 / The departure</label><input id="door-departure" name="departure" required maxlength="40" autocomplete="off" spellcheck="false" placeholder="What you cross"><p class="panel-hint" id="door-feedback" role="status">The door will recognise the words.</p><button type="submit" class="primary">Try the door →</button>';
 content.append(form);
 form.onsubmit=async e=>{
  e.preventDefault();const attempt=++unlockAttempt,button=$('button',form),feedback=$('#door-feedback');
  const answers=[$('#door-shelf').value,$('#door-water').value,$('#door-departure').value];button.disabled=true;feedback.textContent='Listening at the lock…';
  try{
   if(!globalThis.crypto?.subtle)throw new Error('This door needs HTTPS or localhost.');
   const response=await fetch('vault/door.json');if(!response.ok)throw new Error('The door is out of reach. Please try again.');
   const room=validateRoom(await decryptBundle(await response.json(),answers));
   if(attempt!==unlockAttempt||!panel.open)return;
   if(hiddenImageURL)URL.revokeObjectURL(hiddenImageURL);
   hiddenImageURL=URL.createObjectURL(new Blob([room.image],{type:'image/webp'}));hiddenLetter=room.letter;
   hiddenScene={...room.scene,sound:'pages',image:hiddenImageURL,hotspots:[{x:65,y:51,label:'A letter on the desk',type:'secretLetter'},{x:80,y:64,label:'A terminal at rest',type:'terminal'}]};
   $$('input',form).forEach(input=>input.value='');closePanel();setScene('unlisted');enterSpace();toast('The door was never a wall. Welcome inside.');
  }catch(error){if(attempt===unlockAttempt&&panel.open)feedback.textContent=error.name==='OperationError'?'The lock stays quiet. Check the three words and their order.':error.message||'The door could not open. Try again.';}
  finally{answers.fill('');if(attempt===unlockAttempt&&panel.open)button.disabled=false;}
 };
}
function openPanel(kind){if(!journey)return;({terminal:openTerminal,radio:openRadio,notebook:openNotebook,map:openMap,quiet:openQuiet,about:openAbout,secretLetter:openSecretLetter}[kind]||openAbout)();}
async function toggleSound(){if(!journey)return;try{await audio.toggle(scene().sound);const active=audio.active;$('#sound-toggle').setAttribute('aria-pressed',String(active));$('#sound-label').textContent=active?'Sound on':'Sound off';$('#explore-sound').textContent=active?'Sound on':'Sound off';}catch{toast('Sound could not start in this browser. The spaces work in silence, too.');}}

$('#enter-space').onclick=enterSpace;$('#leave-space').onclick=leaveSpace;$('#previous-space').onclick=()=>stepSpace(-1);$('#next-space').onclick=()=>stepSpace(1);
$('#drift').onclick=discover;
$('#carousel-prev').onclick=()=>$('#space-list').scrollBy({left:-300,behavior:'smooth'});
$('#carousel-next').onclick=()=>$('#space-list').scrollBy({left:300,behavior:'smooth'});
$('#sound-toggle').onclick=toggleSound;$('#explore-sound').onclick=toggleSound;$('#stay-awhile').onclick=openQuiet;
$$('[data-open]').forEach(b=>b.onclick=()=>openPanel(b.dataset.open));$$('[data-note]').forEach(b=>b.onclick=()=>openObservation(Number(b.dataset.note)));
$('#close-panel').onclick=closePanel;panel.addEventListener('click',e=>{if(e.target===panel){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closePanel();}});
panel.addEventListener('close',()=>{panelKind='';unlockAttempt++;if(!document.activeElement||document.activeElement===document.body)$(immersed?'#leave-space':'#enter-space').focus();});
document.addEventListener('keydown',e=>{if(panel.open||!journey)return;if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='Escape'&&immersed)leaveSpace();if(e.key==='`'||e.key==='~'){e.preventDefault();openTerminal();}if(immersed&&e.key==='ArrowRight')stepSpace(1);if(immersed&&e.key==='ArrowLeft')stepSpace(-1);});
document.addEventListener('visibilitychange',()=>audio.pauseHidden(document.hidden).catch(()=>{}));
function tick(){$('#local-time').textContent=`LOCAL TIME — ${new Date().toLocaleTimeString('en-GB',{hour12:false})}`;}tick();setInterval(tick,1000);
async function start(){
 document.body.classList.add('journey-loading');
 try{
  acceptJourney(await api('journey'));document.body.classList.remove('journey-loading');$('#connection-note').hidden=true;
  const requested=new URLSearchParams(location.search).get('space');
  if(requested&&requested!==current){if(scenes.some(s=>s.id===requested))await visitScene(requested);else toast('That place has not found you yet.');}
 }catch(error){
  $('#connection-note').hidden=false;$('#connection-message').textContent=error.message;
  $('#connection-signin').hidden=!error.signIn;if(error.signIn)$('#connection-signin').href=error.signIn;
 }
}
$('#retry-journey').onclick=start;
setInterval(()=>{if(journey)updateLock();},15000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&journey&&!travelBusy)api('journey').then(result=>{journey=result;serverOffset=result.serverNow-Date.now();if(!immersed&&!panel.open)acceptJourney(result);else updateLock();}).catch(()=>{});});
start();
