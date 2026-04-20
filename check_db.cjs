const Database = require('better-sqlite3');
const db = new Database('src/data/cantor/cantor.sqlite', { fileMustExist: true });
console.log(db.prepare("SELECT VARIABLENWERT FROM AUFARTIK_ARTIKELVARIABLEN WHERE ARTIKEL = 'F200' AND VARIABLENNAME = 'ART_1805_MatrixName'").all());
