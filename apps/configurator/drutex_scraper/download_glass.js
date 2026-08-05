const fs = require('fs');
const path = require('path');
const https = require('https');

const THUMBS_DIR = '/Users/marckeller/Desktop/antigravravity/public/assets/glass/thumbs';
const LARGE_DIR = '/Users/marckeller/Desktop/antigravravity/public/assets/glass/large';

[THUMBS_DIR, LARGE_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// Data extracted directly from page_dump.html - glass section
// Format: { name: slug, label: display label, thumbB64: base64, largeB64: base64 }
// The "large" image is what gets shown in the big preview (passed to changeImage())
// In the Drutex HTML, both thumb and large use the same URL for most items.
const glassItems = [
  { name: 'segura-331',       label: '33,1 segura',           b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9zenlieS9zenliYV8tX3ByemV6cm9jenlzdGEuanBn' },
  { name: 'segura-332-mat',   label: '33,2 segura film mate',  b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9zenlieS9zenliYV8tX21hdG93YS5qcGc=' },
  { name: 'antirrobo-444',    label: '44,4 antirrobo',         b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9zenlieS9zenliYV8tX3ByZXpyb2N6eXN0YS5qcGc=' },
  { name: 'antisol-blue-6',   label: 'Antisol Dark Blue 6',    b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9zenlieS9zenliYV8tX2FudGlzb2xfbmllYmllc2tpXzYuanBn' },
  { name: 'antisol-grey-6',   label: 'Antisol gris 6',         b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9zenlieS9zenliYV8tX2FudGlzb2xfc3phcnkuanBn' },
  { name: 'antisol-brown-4',  label: 'Antisol marrón 4',       b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9zenlieS9zenliYV8tX2FudGlzb2xfYnJhem93eS5qcGc=' },
  { name: 'antisol-brown-6',  label: 'Antisol marrón 6',       b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9zenlieS9zenliYV8tX2FudGlzb2xfYnJhem93eS5qcGc=' },
  { name: 'antisol-green-4',  label: 'Antisol verde 4',        b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9zenlieS9zenliYV8tX2FudGlzb2xfemllbG9ueS5qcGc=' },
  { name: 'antisol-green-6',  label: 'Antisol verde 6',        b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9zenlieS9zenliYV8tX2FudGlzb2xfemllbG9ueS5qcGc=' },
  { name: 'chinchilla-4',     label: 'Chinchilla blanco 4',    b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9zenlieS9zenliYV8tX29ybmFtZW50X2NoaW5jaGlsbGEuanBn' },
  { name: 'float-4',          label: 'Float 4',                b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9zenlieS9zenliYV8tX3ByemV6cm9jenlzdGEuanBn' },
  { name: 'float-6',          label: 'Float 6',                b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9zenlieS9zenliYV8tX3ByemV6cm9jenlzdGEuanBn' },
  { name: 'mirastar',         label: 'Mirastar',               b64: 'L21lZGlhL191cGxvYWQvc3p5YmFfLV9taXJhc3Rhci5qcGc=' },
  { name: 'ornamento-cathedral', label: 'Ornamento Cathedral',  b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9zenlieS9zenliYV8tX29ybmFtZW50X2NhdGhlZHJhbC5qcGc=' },
  { name: 'ornamento-delta',  label: 'Ornamento Delta 4',      b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9zenlieS9zenliYV8tX29ybmFtZW50X2RlbHRhLmpwZw==' },
  { name: 'ornamento-master', label: 'Ornamento Master Carré', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9zenlieS9zenliYV8tX29ybmFtZW50X21hc3Rlci5qcGc=' },
  { name: 'ornamento-silvit', label: 'Ornamento Silvit 4',     b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9zenlieS9zenliYV8tX29ybmFtZW50X3NpbHZpdC0yMDI2LmpwZw==' },
  { name: 'stopsol-blue-6',   label: 'Stopsol azul 6',         b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9zenlieS9zenliYV8tX3JlZmxha3RvZmxvYXRfLV9uaWViaWVza2kuanBn' },
  { name: 'stopsol-brown-6',  label: 'Stopsol marrón 6',       b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9zenlieS9zenliYV8tX3JlZmxha3RvZmxvYXRfLV9icmF6b3d5LmpwZw==' },
  { name: 'waterfall-105',    label: 'Waterfall 105',           b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9zenlieS9zenliYV8tX29ybmFtZW50X2Rlc3pjenlrLmpwZw==' },
];

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else {
        res.resume();
        reject(new Error(`Status: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
};

// Also download the full-page original sources for the large view
// Decode b64 -> original /media/_upload/... path and download
const downloadOriginal = (b64, name, dir) => {
  const decodedPath = Buffer.from(b64, 'base64').toString('utf8');
  const ext = path.extname(decodedPath);
  const url = `https://www.drutex.es${decodedPath}`;
  const filepath = path.join(dir, `${name}${ext}`);
  return downloadImage(url, filepath);
};

(async () => {
  const mapping = [];
  const seen80 = new Set();

  for (let i = 0; i < glassItems.length; i++) {
    const { name, label, b64 } = glassItems[i];

    // Download thumb (80px webp from CDN)
    const thumbUrl = `https://www.drutex.es/media/webp/80/${b64}.webp`;
    const thumbPath = path.join(THUMBS_DIR, `${name}.webp`);
    if (!fs.existsSync(thumbPath)) {
      console.log(`[thumb] ${i+1}/${glassItems.length}: ${name}`);
      try { await downloadImage(thumbUrl, thumbPath); } catch(e) { console.error(`  FAILED: ${e.message}`); }
    } else {
      console.log(`[skip thumb] ${name}`);
    }

    // Download original full-res source (for large view)
    const largePath = path.join(LARGE_DIR, `${name}.jpg`);
    if (!fs.existsSync(largePath)) {
      console.log(`[large] ${i+1}/${glassItems.length}: ${name}`);
      try { await downloadOriginal(b64, name, LARGE_DIR); } 
      catch(e) { 
        // Try with webp fallback
        console.log(`  Trying webp fallback...`);
        try { await downloadImage(thumbUrl, path.join(LARGE_DIR, `${name}.webp`)); }
        catch(e2) { console.error(`  FAILED: ${e.message}`); }
      }
    } else {
      console.log(`[skip large] ${name}`);
    }

    mapping.push({ name, label });
  }

  fs.writeFileSync('glass_mapping.json', JSON.stringify(mapping, null, 2));
  console.log('\nDone! glass_mapping.json written.');
})();
