import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'src', 'data', 'cantor', 'cantor.sqlite');
console.log('Using DB Path:', dbPath);
const db = new Database(dbPath);

try {
  const results = db.prepare(`
    SELECT ARTNR, COUNT(*) as cnt
    FROM AUFPOS
    WHERE ARTNR LIKE 'F%'
    GROUP BY ARTNR
    ORDER BY ARTNR
  `).all();
  console.log('AUFPOS counts for typologies starting with F:', results);
} catch (e) {
  console.error(e);
}
