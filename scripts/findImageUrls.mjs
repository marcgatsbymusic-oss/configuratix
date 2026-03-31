import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = fs.readFileSync(path.join(__dirname, '../src/data/raw_drutex_intercept.json'), 'utf8');
const urls = data.match(/https?:\/\/[a-zA-Z0-9\-\.]+\/[^\"']+(jpg|png|webp|jpeg)/gi);

if (urls) {
    const unique = Array.from(new Set(urls));
    console.log('Found image URLs in JSON payload:');
    unique.forEach(u => console.log(u));
} else {
    console.log('No direct image URLs found in JSON payload. They are generated client-side.');
}
