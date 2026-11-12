import {DatabaseSync} from 'node:sqlite';
export function sqliteDB(filename=':memory:') {
 const db=new DatabaseSync(filename);
 db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
 function statement(sql,args=[]) {
  return {
   sql,args,
   bind(...values){return statement(sql,values);},
   async first(){return db.prepare(sql).get(...args)||null;},
   async all(){return {results:db.prepare(sql).all(...args)};},
   async run(){const result=db.prepare(sql).run(...args);return {meta:{changes:Number(result.changes)}};}
  };
 }
 return {
  raw:db,
  withSession(){return this;},
  prepare:statement,
  async batch(statements){
   db.exec('BEGIN');
   try {const result=statements.map(s=>({meta:{changes:Number(db.prepare(s.sql).run(...s.args).changes)}}));db.exec('COMMIT');return result;}
   catch(error){db.exec('ROLLBACK');throw error;}
  }
 };
}
