const Database = require('better-sqlite3');
const db = new Database('src/data/cantor/cantor.sqlite', { fileMustExist: true });
const rows = db.prepare("SELECT FORMELTEXT, FORMEL FROM PREISE WHERE KEY1='SCHEMA' AND KEY2='45' AND FORMELTEXT LIKE '%3 szybowy%'").all();
console.log(rows);
