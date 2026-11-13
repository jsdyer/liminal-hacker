import {encryptArt,decryptArt,fromBase64} from './art.js';
import {journalEscape,journalMarkdown} from './journal-format.js';
const JOURNAL_HEADERS={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'};
const journalJSON=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...JOURNAL_HEADERS,'Content-Type':'application/json; charset=utf-8'}});
const photoColumns='id,title,alt,caption,width,height,created_at,revision';
const photoURL=id=>'/media/photos/'+encodeURIComponent(id)+'.webp';
const journalDate=value=>new Date(value+'T12:00:00Z').toLocaleDateString('en-CA',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'});
export function cleanPhoto(bytes){
 // Rebuild RIFF without EXIF, XMP or colour-profile metadata. Never store originals.
 if(bytes.length<20||bytes.length>512000||new TextDecoder().decode(bytes.slice(0,4))!=='RIFF'||new TextDecoder().decode(bytes.slice(8,12))!=='WEBP')throw Error('Use a WebP image under 500 KB.');
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);if(view.getUint32(4,true)+8!==bytes.length)throw Error('The image container is incomplete.');
 const chunks=[];let pos=12,pixels=false;
 while(pos<bytes.length){if(pos+8>bytes.length)throw Error('Invalid image chunk.');const tag=new TextDecoder().decode(bytes.slice(pos,pos+4)),size=view.getUint32(pos+4,true),end=pos+8+size+(size%2);if(end>bytes.length)throw Error('Invalid image chunk size.');
  if(['ANIM','ANMF'].includes(tag))throw Error('Use a still photograph.');
  if(['VP8 ','VP8L','VP8X','ALPH'].includes(tag)){const chunk=bytes.slice(pos,end);if(tag==='VP8X'){if(size!==10||(chunk[8]&2))throw Error('Use a still photograph.');chunk[8]&=~44;}if(tag==='VP8 '||tag==='VP8L')pixels=true;chunks.push(chunk);}pos=end;
 }
 if(!pixels)throw Error('No image pixels were found.');
 const out=new Uint8Array(12+chunks.reduce((n,c)=>n+c.length,0));out.set(new TextEncoder().encode('RIFF'),0);out.set(new TextEncoder().encode('WEBP'),8);new DataView(out.buffer).setUint32(4,out.length-8,true);pos=12;for(const chunk of chunks){out.set(chunk,pos);pos+=chunk.length;}return out;
}
export async function photoBytes(db,env,id){
 const row=await db.prepare('SELECT * FROM journal_photos WHERE id=?').bind(id).first();if(!row)throw Error('Photo not found.');const object=await env.BUCKET?.get(row.object_key);if(!object)throw Error('Photo file unavailable.');return new Uint8Array(await decryptArt(JSON.parse(await object.text()),'photo:'+id,env.ART_KEY));
}
async function postPhotos(db,post){const ids=[...new Set([post.coverId,...post.photoIds].filter(Boolean))];const rows=[];for(const id of ids){const p=await db.prepare('SELECT '+photoColumns+' FROM journal_photos WHERE id=?').bind(id).first();if(p)rows.push(p);}return rows;}
export function validatePost(p){
 if(!p||typeof p!=='object')return 'The entry is missing.';
 if(typeof p.title!=='string'||!p.title.trim()||p.title.length>160)return 'Give this entry a title of up to 160 characters.';
 if(typeof p.slug!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)||p.slug.length>90)return 'Use a short lowercase URL slug with hyphens.';
 if(typeof p.excerpt!=='string'||p.excerpt.length>500||typeof p.body!=='string'||p.body.length>60000)return 'Keep the summary under 500 characters and the entry under 60,000.';
 if(typeof p.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||!Number.isFinite(Date.parse(p.date+'T12:00:00Z'))||new Date(p.date+'T12:00:00Z').toISOString().slice(0,10)!==p.date)return 'Choose a valid entry date.';
 if(!Array.isArray(p.tags)||p.tags.length>8||p.tags.some(t=>typeof t!=='string'||!t.trim()||t.length>40)||new Set(p.tags).size!==p.tags.length)return 'Use up to eight different tags, each under 40 characters.';
 const validId=id=>typeof id==='string'&&/^[a-f0-9-]{36}$/.test(id);
 if((p.coverId!==null&&!validId(p.coverId))||!Array.isArray(p.photoIds)||p.photoIds.length>12||p.photoIds.some(id=>!validId(id))||new Set(p.photoIds).size!==p.photoIds.length)return 'Choose up to twelve different gallery photos.';
 return null;
}
function postDTO(row){return {id:row.id,revision:row.revision,draft:JSON.parse(row.draft_json),published:row.published_json?JSON.parse(row.published_json):null,publishedAt:row.published_at,updatedAt:row.updated_at,archivedAt:row.archived_at};}
export async function journalAdmin(path,body,request,env,db,actor,now){
 if(path==='/api/admin/photos'&&request.method==='GET')return journalJSON({photos:(await db.prepare('SELECT '+photoColumns+' FROM journal_photos ORDER BY created_at DESC').bind().all()).results});
 if(path==='/api/admin/photo-upload'&&request.method==='POST'){
  if(!env.BUCKET)return journalJSON({error:'Photo storage is not configured.'},503);
  if(typeof body.title!=='string'||!body.title.trim()||body.title.length>120||typeof body.alt!=='string'||!body.alt.trim()||body.alt.length>300||typeof body.caption!=='string'||body.caption.length>1000||![body.width,body.height].every(n=>Number.isInteger(n)&&n>0&&n<=2400))return journalJSON({error:'Add a photo title and image description, and check its dimensions.'},400);
  let bytes;try{bytes=cleanPhoto(fromBase64(body.base64));}catch(error){return journalJSON({error:error.message},400);}
  const id=crypto.randomUUID(),key='art/'+crypto.randomUUID()+'.json';await env.BUCKET.put(key,JSON.stringify(await encryptArt(bytes,'photo:'+id,env.ART_KEY)),{httpMetadata:{contentType:'application/json'}});
  await db.prepare('INSERT INTO journal_photos(id,object_key,title,alt,caption,width,height,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id,key,body.title.trim(),body.alt.trim(),body.caption,body.width,body.height,now).run();return journalJSON({id});
 }
 if(path==='/api/admin/photo-metadata'&&request.method==='POST'){
  if(typeof body.title!=='string'||!body.title.trim()||body.title.length>120||typeof body.alt!=='string'||!body.alt.trim()||body.alt.length>300||typeof body.caption!=='string'||body.caption.length>1000)return journalJSON({error:'Add a title, image description and a caption under 1,000 characters.'},400);
  const result=await db.prepare('UPDATE journal_photos SET title=?,alt=?,caption=?,revision=revision+1 WHERE id=? AND revision=?').bind(body.title.trim(),body.alt.trim(),body.caption,body.id,body.revision).run();return result.meta.changes?journalJSON({ok:true}):journalJSON({error:'This photo changed in another window. Reload before saving.'},409);
 }
 if(path==='/api/admin/posts'&&request.method==='GET')return journalJSON({posts:(await db.prepare('SELECT * FROM journal_posts ORDER BY updated_at DESC').bind().all()).results.map(postDTO)});
 if(path==='/api/admin/post-preview'&&request.method==='GET'){
  const row=await db.prepare('SELECT * FROM journal_posts WHERE id=?').bind(new URL(request.url).searchParams.get('id')).first();if(!row)return new Response('Entry not found.',{status:404,headers:JOURNAL_HEADERS});return journalPage(await renderEntry(db,JSON.parse(row.draft_json),true),JSON.parse(row.draft_json).title,'Private draft preview');
 }
 if(path==='/api/admin/journal-export'&&request.method==='GET'){
  const posts=(await db.prepare('SELECT * FROM journal_posts ORDER BY created_at').bind().all()).results.map(postDTO),photos=(await db.prepare('SELECT '+photoColumns+' FROM journal_photos ORDER BY created_at').bind().all()).results;
  // Photo bytes export individually to bound memory; this export is portable editorial text.
  return journalJSON({format:'liminal-journal-1',exportedAt:now,posts,photos,photoDownloads:photos.map(p=>({id:p.id,url:photoURL(p.id)}))});
 }
 if(!['/api/admin/post-save','/api/admin/post-publish','/api/admin/post-unpublish','/api/admin/post-archive','/api/admin/post-restore'].includes(path)||request.method!=='POST')return journalJSON({error:'Unknown journal operation.'},404);
 const row=body.id?await db.prepare('SELECT * FROM journal_posts WHERE id=?').bind(body.id).first():null;
 if(body.id&&!row)return journalJSON({error:'Entry not found.'},404);
 if(row&&body.revision!==row.revision)return journalJSON({error:'This entry changed in another window. Reload before saving.'},409);
 if(path==='/api/admin/post-save'){
  const error=validatePost(body.post);if(error)return journalJSON({error},400);
  if(row?.published_at&&row.slug!==body.post.slug)return journalJSON({error:'A previously published entry keeps its original URL.'},400);
  const collision=await db.prepare('SELECT id FROM journal_posts WHERE slug=?').bind(body.post.slug).first();if(collision&&collision.id!==row?.id)return journalJSON({error:'Another entry already uses this URL slug.'},409);
  const media=await postPhotos(db,body.post);if(media.length!==new Set([body.post.coverId,...body.post.photoIds].filter(Boolean)).size)return journalJSON({error:'One of the selected photos is unavailable.'},400);
  const id=row?.id||crypto.randomUUID(),data=JSON.stringify(body.post);
  try{if(row){const saved=await db.prepare('UPDATE journal_posts SET slug=?,draft_json=?,revision=revision+1,updated_at=? WHERE id=? AND revision=?').bind(body.post.slug,data,now,id,body.revision).run();if(!saved.meta.changes)return journalJSON({error:'Another window saved this entry first.'},409);}else await db.prepare('INSERT INTO journal_posts(id,slug,draft_json,created_at,updated_at) VALUES (?,?,?,?,?)').bind(id,body.post.slug,data,now,now).run();}catch(error){if(String(error.message).includes('UNIQUE'))return journalJSON({error:'Another entry already uses this URL slug.'},409);throw error;}
  return journalJSON(postDTO(await db.prepare('SELECT * FROM journal_posts WHERE id=?').bind(id).first()));
 }
 if(!row)return journalJSON({error:'Save a draft first.'},400);
 if(path==='/api/admin/post-publish'){
  const p=JSON.parse(row.draft_json);const error=validatePost(p);if(error||(!p.body.trim()&&!p.coverId&&!p.photoIds.length))return journalJSON({error:error||'Add some writing or a photograph before publishing.'},400);
  if(row.archived_at)return journalJSON({error:'Restore this entry from the archive before publishing.'},400);
  for(const photo of await postPhotos(db,p)){try{await photoBytes(db,env,photo.id);}catch{return journalJSON({error:'The image for '+photo.title+' could not be opened. Check storage and the artwork key.'},400);}}
 }
 const action=path.split('post-')[1],change=action==='publish'?'published_json=draft_json,published_at=COALESCE(published_at,?),':action==='unpublish'?'published_json=NULL,':action==='archive'?'published_json=NULL,archived_at=?,':'archived_at=NULL,';
 const args=['publish','archive'].includes(action)?[now,now,row.id,body.revision]:[now,row.id,body.revision];
 const op=crypto.randomUUID();const result=await db.batch([
  db.prepare('UPDATE journal_posts SET '+change+'revision=revision+1,updated_at=? WHERE id=? AND revision=?').bind(...args),
  db.prepare('INSERT INTO control_audit(id,action,detail,actor,created_at) SELECT ?,?,?,?,? WHERE changes()=1').bind(op,'journal-'+action,action+' journal entry: '+JSON.parse(row.draft_json).title,actor,now)
 ]);if(!result[0].meta.changes)return journalJSON({error:'Another window updated this entry first.'},409);
 return journalJSON(postDTO(await db.prepare('SELECT * FROM journal_posts WHERE id=?').bind(row.id).first()));
}
function journalPage(body,title='The after-hours journal',description='Photography, notes and things worth keeping.'){return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0b1215"><meta name="description" content="${journalEscape(description)}"><title>${journalEscape(title)} — Liminal Hacker</title><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/journal.css"><link rel="alternate" type="application/rss+xml" title="Liminal Hacker journal" href="/journal/feed.xml"></head><body><a class="journal-skip" href="#journal-main">Skip to journal</a><header class="journal-header"><a class="journal-brand" href="/">liminal<span>hacker_</span></a><nav aria-label="Main navigation"><a href="/">The spaces</a><a href="/journal" aria-current="page">Journal</a><a href="/journal/feed.xml">RSS →</a></nav><span class="journal-label">TRANSMISSIONS FROM THE OTHER SIDE</span></header><main id="journal-main">${body}</main><footer class="journal-footer"><a href="/">← Back to the spaces</a><span>A personal corner of the night.</span><a href="/journal">All journal entries →</a></footer></body></html>`,{headers:{...JOURNAL_HEADERS,'Content-Type':'text/html; charset=utf-8'}});}
async function renderEntry(db,p,preview=false){const media=await postPhotos(db,p),cover=media.find(m=>m.id===p.coverId);return `${preview?'<div class="preview-banner">PRIVATE DRAFT PREVIEW · Only operators can see this version. <a href="/admin#journal">Back to the editor →</a></div>':''}<article class="journal-article"><header class="article-heading"><a class="eyebrow" href="/journal">THE AFTER-HOURS JOURNAL</a><div class="entry-meta"><time datetime="${p.date}">${journalDate(p.date)}</time><span>${Math.max(1,Math.ceil(p.body.split(/\s+/).length/220))} MIN READ</span></div><h1>${journalEscape(p.title)}</h1>${p.excerpt?'<p class="entry-deck">'+journalEscape(p.excerpt)+'</p>':''}<div class="tags">${p.tags.map(t=>'<a href="/journal?tag='+encodeURIComponent(t)+'">'+journalEscape(t)+'</a>').join('')}</div></header>${cover?`<figure class="cover-photo"><img src="${photoURL(cover.id)}" alt="${journalEscape(cover.alt)}" width="${cover.width}" height="${cover.height}"><figcaption>${journalEscape(cover.caption)}</figcaption></figure>`:''}<div class="entry-body">${journalMarkdown(p.body)}</div>${p.photoIds.length?'<div class="photo-essay">'+p.photoIds.map(id=>{const m=media.find(x=>x.id===id);return m?`<figure><a href="${photoURL(m.id)}" target="_blank" rel="noopener"><img src="${photoURL(m.id)}" alt="${journalEscape(m.alt)}" width="${m.width}" height="${m.height}" loading="lazy"></a><figcaption>${journalEscape(m.caption)}</figcaption></figure>`:'';}).join('')+'</div>':''}<div class="article-end"><span>●</span><p>Something worth keeping.</p><a href="/journal">← More from the journal</a></div></article>`;}
export async function journalPublic(request,env,db,isAdmin){
 const url=new URL(request.url),path=url.pathname;if(!['GET','HEAD'].includes(request.method))return journalJSON({error:'Method not allowed.'},405);
 if(path.startsWith('/media/photos/')){
  const id=path.slice('/media/photos/'.length).replace(/\.webp$/,'');if(!/^[a-f0-9-]{36}$/.test(id))return new Response('Not found.',{status:404,headers:JOURNAL_HEADERS});
  if(!isAdmin){const visible=await db.prepare("SELECT id FROM journal_posts WHERE published_json IS NOT NULL AND archived_at IS NULL AND (json_extract(published_json,'$.coverId')=? OR EXISTS (SELECT 1 FROM json_each(json_extract(published_json,'$.photoIds')) WHERE value=?)) LIMIT 1").bind(id,id).first();if(!visible)return new Response('Not found.',{status:404,headers:JOURNAL_HEADERS});}
  try{const bytes=await photoBytes(db,env,id);return new Response(request.method==='HEAD'?null:bytes,{headers:{...JOURNAL_HEADERS,'Content-Type':'image/webp'}});}catch{return new Response('Photo unavailable.',{status:404,headers:JOURNAL_HEADERS});}
 }
 const rows=(await db.prepare('SELECT slug,published_json,published_at,updated_at FROM journal_posts WHERE published_json IS NOT NULL AND archived_at IS NULL ORDER BY json_extract(published_json,\'$.date\') DESC,published_at DESC').bind().all()).results;
 const posts=rows.map(r=>({...JSON.parse(r.published_json),publishedAt:r.published_at}));
 if(path==='/api/journal/recent')return journalJSON({posts:posts.slice(0,3).map(p=>({title:p.title,excerpt:p.excerpt,date:p.date,slug:p.slug,coverId:p.coverId}))});
 if(path==='/journal/feed.xml'){
  const items=posts.slice(0,30).map(p=>{const link=url.origin+'/journal/'+p.slug;return `<item><title>${journalEscape(p.title)}</title><link>${journalEscape(link)}</link><guid isPermaLink="true">${journalEscape(link)}</guid><pubDate>${new Date(p.date+'T12:00:00Z').toUTCString()}</pubDate><description>${journalEscape(p.excerpt||p.body.slice(0,500))}</description>${p.tags.map(t=>'<category>'+journalEscape(t)+'</category>').join('')}</item>`;}).join('');return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Liminal Hacker — After-hours journal</title><link>${journalEscape(url.origin+'/journal')}</link><description>Photography, notes and things worth keeping.</description>${items}</channel></rss>`,{headers:{...JOURNAL_HEADERS,'Content-Type':'application/rss+xml; charset=utf-8'}});
 }
 if(path==='/journal'||path==='/journal/'){
  const q=(url.searchParams.get('q')||'').slice(0,120),tag=(url.searchParams.get('tag')||'').slice(0,40);const filtered=posts.filter(p=>(!tag||p.tags.includes(tag))&&(!q||(p.title+' '+p.excerpt+' '+p.body+' '+p.tags.join(' ')).toLowerCase().includes(q.toLowerCase())));
  const page=Math.max(1,Math.min(10000,Number.parseInt(url.searchParams.get('page')||'1',10)||1)),shown=filtered.slice((page-1)*9,page*9),tags=[...new Set(posts.flatMap(p=>p.tags))].sort();
  const pageURL=n=>'/journal?'+new URLSearchParams({q,tag,page:String(n)});
  return journalPage(`<section class="journal-intro"><span class="eyebrow">PERSONAL NOTES / PHOTOGRAPHS / SMALL DISCOVERIES</span><h1>Things I wanted<br><em>to keep.</em></h1><p>A photograph. A late-night thought. Something made, something noticed, somewhere worth remembering.</p><div class="intro-rule"><span>A JOURNAL FROM THE IN-BETWEEN</span><span>${posts.length} ${posts.length===1?'ENTRY':'ENTRIES'}</span></div></section><section aria-label="Journal archive"><form class="journal-search" method="get" action="/journal"><label>Find an entry<input name="q" value="${journalEscape(q)}" placeholder="A place, a thought, a project…" maxlength="120" type="search"></label><label>Topic<select name="tag"><option value="">Every kind of night</option>${tags.map(t=>'<option value="'+journalEscape(t)+'" '+(tag===t?'selected':'')+'>'+journalEscape(t)+'</option>').join('')}</select></label><button>Find →</button></form>${q||tag?'<p class="filter-note">'+filtered.length+' matching entries · <a href="/journal">Clear filters</a></p>':''}<div class="journal-grid">${shown.map(p=>`<article class="entry-card">${p.coverId?`<a class="card-image" href="/journal/${p.slug}" aria-label="Read ${journalEscape(p.title)}"><img src="${photoURL(p.coverId)}" alt="" loading="lazy"></a>`:'<div class="text-entry-mark" aria-hidden="true">[ a note left here ]</div>'}<div class="card-copy"><time datetime="${p.date}">${journalDate(p.date)}</time><h2><a href="/journal/${p.slug}">${journalEscape(p.title)}</a></h2><p>${journalEscape(p.excerpt||p.body.slice(0,180))}</p><div class="card-footer"><span>${journalEscape(p.tags.slice(0,2).join(' / '))}</span><a href="/journal/${p.slug}" aria-label="Read ${journalEscape(p.title)}">Read entry →</a></div></div></article>`).join('')}</div>${!shown.length?'<div class="journal-empty"><span aria-hidden="true">▯</span><h2>'+(!posts.length?'A light on. A blank page.':'Nothing here under that name.')+'</h2><p>'+(!posts.length?'Photographs and notes will find their way here. There’s no hurry.':'Try a different word, or return to all entries.')+'</p></div>':''}<nav class="pagination" aria-label="Journal pages">${page>1?'<a href="'+journalEscape(pageURL(page-1))+'">← Newer entries</a>':''}${page*9<filtered.length?'<a href="'+journalEscape(pageURL(page+1))+'">Older entries →</a>':''}</nav></section>`);
 }
 if(path.startsWith('/journal/')){const p=posts.find(p=>'/journal/'+p.slug===path);if(p)return journalPage(await renderEntry(db,p),p.title,p.excerpt||p.title);}
 return new Response('This journal entry is not available.',{status:404,headers:JOURNAL_HEADERS});
}
