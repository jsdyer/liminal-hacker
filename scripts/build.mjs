import {readFile,writeFile,mkdir,readdir,rm} from 'node:fs/promises';
import {themes} from '../content/themes.js';
import {journeyConfig as config} from '../config/journey.js';
const types={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8',svg:'image/svg+xml',json:'application/json'};
const files={};
async function walk(dir,base=''){for(const e of await readdir(dir,{withFileTypes:true})){const rel=base+e.name;if(e.isDirectory())await walk(dir+'/'+e.name,rel+'/');else files['/'+rel]={type:types[e.name.split('.').at(-1)]||'application/octet-stream',body:(await readFile(dir+'/'+e.name)).toString('base64')};}}
await walk(new URL('../web/',import.meta.url).pathname);
const art={};for(const t of themes.filter(t=>t.enabled!==false))art[t.id]=JSON.parse(await readFile(new URL('../content/art/'+t.id+'.json',import.meta.url),'utf8'));
const clean=s=>s.replace(/^import .*;\n/gm,'').replace(/^export /gm,'');
const source=clean(await readFile(new URL('../worker/art.js',import.meta.url),'utf8'))+'\n'+clean(await readFile(new URL('../worker/service.js',import.meta.url),'utf8'))+'\nexport default createService('+JSON.stringify({themes,art,files,config})+');\n';
await rm(new URL('../dist/',import.meta.url),{recursive:true,force:true});
await mkdir(new URL('../dist/server/',import.meta.url),{recursive:true});await mkdir(new URL('../dist/.openai/',import.meta.url),{recursive:true});
await writeFile(new URL('../dist/server/index.js',import.meta.url),source);
await writeFile(new URL('../dist/.openai/hosting.json',import.meta.url),await readFile(new URL('../.openai/hosting.json',import.meta.url)));
console.log('Built Worker: '+themes.filter(t=>t.enabled!==false).length+' locations; encrypted art; '+Object.keys(files).length+' public shell files.');
