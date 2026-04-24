import { execSync } from 'child_process';
import fs from 'fs';

const sql = `SELECT KOD, OPIS, OSLONKA_ZAW, KLAMKA_HOPPE, KLAMKA_MAL FROM CUSTOM_OKNA_KOLORY_AKCESORIA_PVC`;
const out = execSync(`node .agents/skills/cantor-access/scripts/queryCantor.mjs "${sql}"`);
fs.writeFileSync('src/utils/cantorPricing/hardwareColors.json', out.toString(), 'utf8');
