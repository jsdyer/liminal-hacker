import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join,dirname} from 'node:path';
export function localBucket(root){
 const path=key=>{if(!/^art\/[a-f0-9-]{36}\.json$/.test(key))throw new Error('Invalid storage key.');return join(root,key);};
 return {async get(key){try{const content=await readFile(path(key),'utf8');return {async text(){return content;}};}catch(e){if(e.code==='ENOENT')return null;throw e;}},async put(key,value){const filename=path(key);await mkdir(dirname(filename),{recursive:true});await writeFile(filename,value,{mode:0o600});}};
}
