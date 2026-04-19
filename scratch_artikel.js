import Database from 'better-sqlite3';
const db = new Database('src/data/cantor/cantor.sqlite');
console.log(db.prepare("SELECT ARTNR, BEZEICHNUNG FROM ARTIKEL WHERE ARTNR IN ('F100', 'F104')").all());
