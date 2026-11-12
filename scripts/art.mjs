// Plaintext belongs outside Git. Only encrypted packets are committed.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {encryptArt,decryptArt} from '../worker/art.js';
try{process.loadEnvFile('.env');}catch(e){if(e.code!=='ENOENT')throw e;}
const [mode,id,input,output]=process.argv.slice(2);
if(!['seal','open'].includes(mode)||!id?.match(/^[a-z][a-z0-9-]*$/)||!input||!output)throw new Error('Usage: node scripts/art.mjs seal|open <id> <input-file> <output-file>');
const root=resolve('private')+'/';
const plain=resolve(mode==='seal'?input:output);
if(!plain.startsWith(root)&&plain.startsWith(resolve('.')+'/'))throw new Error('Keep plaintext art in ignored private/ or outside the repository.');
const result=mode==='seal'?JSON.stringify(await encryptArt(await readFile(input),id,process.env.ART_KEY))+'\n':Buffer.from(await decryptArt(JSON.parse(await readFile(input,'utf8')),id,process.env.ART_KEY));
await mkdir(dirname(resolve(output)),{recursive:true});await writeFile(output,result,{mode:0o600});console.log(mode==='seal'?'Encrypted artwork saved.':'Artwork opened to private output.');
