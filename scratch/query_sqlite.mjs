import Database from 'better-sqlite3';
const db = new Database('./src/data/cantor/cantor.sqlite');
try {
  console.log("All distinct PREISMATRIX in PREISMAT for IGEDGE SL:");
  const rows = db.prepare("SELECT DISTINCT PREISMATRIX FROM PREISMAT WHERE KLASSE2 = 'IGEDGE SL'").all();
  console.log(JSON.stringify(rows, null, 2));
} catch (e) {
  console.error(e);
}
db.close();
