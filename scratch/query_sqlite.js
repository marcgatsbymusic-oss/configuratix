import Database from 'better-sqlite3';

const db = new Database('cantor_mirror.sqlite');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables in cantor_mirror.sqlite:');
console.log(tables.map(t => t.name).join(', '));
