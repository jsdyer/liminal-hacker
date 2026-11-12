import {DatabaseSync} from 'node:sqlite';
export function sqliteDB(filename=':memory:') {
 const db=new DatabaseSync(filename);
 db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
 return {
  raw:db,
  withSession(){return this;},
  prepare(sql){
   return {
    bind(...args){
     return {
      async first(){return db.prepare(sql).get(...args)||null;},
      async run(){const r=db.prepare(sql).run(...args);return {meta:{changes:Number(r.changes)}};}
     };
    }
   };
  }
 };
}
