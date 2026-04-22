import Database from 'better-sqlite3';
import { resolve } from 'node:path';

const dbPath = resolve(process.cwd(), 'src/data/cantor/cantor.sqlite');
const db = new Database(dbPath);

const rows = db.prepare(`SELECT DISTINCT KLASSE1, KLASSE2 FROM PREISMAT WHERE PREISMATRIX = 'PVC_F100'`).all();
console.log(rows);
