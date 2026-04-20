const Database = require('better-sqlite3');
const db = new Database('src/data/cantor/cantor.sqlite', { fileMustExist: true });
console.log(db.prepare("SELECT * FROM PREISMAT WHERE PREISMATRIX = 'PVC_FACTOR'").all());
