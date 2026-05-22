import Database from 'better-sqlite3';
const db = new Database('src/data/cantor/cantor.sqlite');
console.log('Tables:', db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all());
try {
  console.log('ARTIKEL:', db.prepare("SELECT ARTNR, COUNT(*) FROM ARTIKEL WHERE ARTNR IN ('F100','F101','F102','F103','F104') GROUP BY ARTNR").all());
} catch(e) { console.log(e); }
