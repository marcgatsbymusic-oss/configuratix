import { execSync } from 'child_process';
import fs from 'fs';

const q = "1500052";

const tables = [
  'AUFKOPF', 'AUFPOS', 'AUFFARBEN', 'AUFARTIK', 'AUFPREIS', 'AUFART', 'AUFSTKL', 'AUFKALK'
];

const results = {};

for (const table of tables) {
  try {
    const output = execSync(`node .agents/skills/cantor-access/scripts/queryCantor.mjs "SELECT * FROM ${table} WHERE AUFNR = ${q}"`).toString();
    results[table] = JSON.parse(output);
  } catch (e) {
    console.error(`Error querying ${table}:`, e.message);
  }
}

fs.writeFileSync('scratch/quotation_1500052_full.json', JSON.stringify(results, null, 2));
console.log("Extraction complete.");
