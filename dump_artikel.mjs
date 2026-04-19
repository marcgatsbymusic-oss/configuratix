import Database from 'better-sqlite3';

const db = new Database('tests/pricing/fixtures/cantor.sqlite', { readonly: true });
const stmt = db.prepare("SELECT ARTNR, BEZEICHNUNG FROM ARTIKEL WHERE ARTNR IN ('50001', '50011', '50021')");
console.log(stmt.all());
