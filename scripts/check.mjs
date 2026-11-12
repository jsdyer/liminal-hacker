import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
async function check(dir){for(const file of await readdir(dir,{withFileTypes:true})){const path=dir+'/'+file.name;if(file.isDirectory()){if(!['art','assets','vault'].includes(file.name))await check(path);continue;}if(!/\.(m?js)$/.test(file.name))continue;const r=spawnSync(process.execPath,['--check',path],{stdio:'inherit'});if(r.status)process.exit(r.status);}}
for(const dir of ['web','worker','config','content','scripts'])await check(dir);
console.log('Source syntax checks passed.');
