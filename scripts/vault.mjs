#!/usr/bin/env node
// Authoring tool. Keep phrase files and unsealed inputs outside the repository.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,resolve,relative} from 'node:path';
import {sealBundle,decryptBundle,validateRoom} from '../dist/vault.js';
const [mode,...args]=process.argv.slice(2);
const flags=Object.fromEntries(args.reduce((a,v,i)=>i%2===0?[...a,[v,args[i+1]]]:a,[]));
if(!['seal','unseal'].includes(mode)||!flags['--input']||!flags['--output']||!flags['--phrase-file']){
 console.error('Usage: node scripts/vault.mjs seal|unseal --input /private/room.json --output dist/vault/door.json --phrase-file /private/phrase.txt');process.exit(1);
}
const root=resolve(new URL('..',import.meta.url).pathname),output=resolve(flags['--output']);
const inRepo=p=>{const rel=relative(root,resolve(p));return rel===''||(!rel.startsWith('..')&&!rel.startsWith('/'));};
if(inRepo(flags['--phrase-file'])||(mode==='seal'&&inRepo(flags['--input']))||(mode==='unseal'&&inRepo(output))){console.error('Keep plaintext room inputs, unsealed outputs, and phrase files outside the repository.');process.exit(1);}
try{
 const phrase=(await readFile(flags['--phrase-file'],'utf8')).trim();
 const input=JSON.parse(await readFile(flags['--input'],'utf8'));
 let result;if(mode==='seal'){validateRoom(input);result=await sealBundle(input,phrase);}else{result=await decryptBundle(input,phrase);validateRoom(result);}
 await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(result,null,2)+'\n',{mode:0o600});
 console.log(mode==='seal'?'Encrypted room written. No plaintext added to the site.':'Room opened at the supplied private output path.');
}catch(e){console.error(e.name==='OperationError'?'The phrase did not open this bundle.':e.message);process.exit(1);}
