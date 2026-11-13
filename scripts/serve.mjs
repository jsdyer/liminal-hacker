import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {sqliteDB} from './sqlite.mjs';
import {localBucket} from './local-bucket.mjs';
import app from '../dist/server/index.js';
try{process.loadEnvFile('.env');}catch(e){if(e.code!=='ENOENT')throw e;}
await mkdir('private',{recursive:true});const DB=sqliteDB(process.env.DATABASE_PATH||'private/journeys.sqlite');
DB.raw.exec('CREATE TABLE IF NOT EXISTS local_migrations (name TEXT PRIMARY KEY)');
const journal=JSON.parse(await readFile('drizzle/meta/_journal.json','utf8'));
for(const entry of journal.entries){if(!DB.raw.prepare('SELECT name FROM local_migrations WHERE name=?').get(entry.tag)){DB.raw.exec('BEGIN');try{DB.raw.exec(await readFile('drizzle/'+entry.tag+'.sql','utf8'));DB.raw.prepare('INSERT INTO local_migrations(name) VALUES (?)').run(entry.tag);DB.raw.exec('COMMIT');}catch(e){DB.raw.exec('ROLLBACK');throw e;}}}
const port=Number(process.env.PORT||4173),host=process.env.HOST||'127.0.0.1';
const args=process.argv.slice(2);const portArg=args.indexOf('--port');const listenPort=portArg>=0?Number(args[portArg+1]):port;
const env={DB,BUCKET:localBucket('private/uploads'),ART_KEY:process.env.ART_KEY,ARCHIVE_ART_KEY:process.env.ARCHIVE_ART_KEY,IDENTITY_MODE:process.env.IDENTITY_MODE||'anonymous',ADMIN_TOKEN:process.env.ADMIN_TOKEN,ADMIN_USER_IDS:process.env.ADMIN_USER_IDS};
http.createServer(async(req,res)=>{try{
 const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>900000){res.writeHead(413);res.end();return;}chunks.push(chunk);}
 const body=chunks.length?Buffer.concat(chunks):undefined;
 // Node receives no trusted Sites identity. Proxy mode must be explicitly configured.
 const headers=new Headers(req.headers);headers.delete('oai-authenticated-user-id');headers.delete('oai-authenticated-user-email');
 if(env.IDENTITY_MODE!=='proxy')headers.delete('x-liminal-user');
 const origin=process.env.PUBLIC_ORIGIN||'http://'+(req.headers.host||'localhost');
 const url=new URL(req.url,origin).href;
 const response=await app.fetch(new Request(url,{method:req.method,headers,...(body?{body,duplex:'half'}:{})}),env);
 res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(500);res.end('The building is resting.');}
}).listen(listenPort,host,()=>console.log('Liminal Hacker listening on '+host+':'+listenPort));
