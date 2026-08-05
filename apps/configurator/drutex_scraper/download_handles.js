const fs = require('fs');
const path = require('path');
const https = require('https');

const OUTPUT_DIR = '/Users/marckeller/Desktop/antigravravity/public/assets/handles';
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// All unique handles extracted from the Drutex Manijas section (page_dump.html lines 1409-1477)
const handles = [
  // NEVADA
  { name: 'nevada-ral7016', label: 'NEVADA con llave (RAL7016)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rbGFta2EtbmV2YWRhLWtsdWN6LTM1bW0tay03MDE2LnBuZw==' },
  { name: 'nevada-ral9001', label: 'NEVADA con llave (RAL9001)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rbGFta2EtbmV2YWRhLWtsdWN6LTM1bW0tay05MDAxLnBuZw==' },
  { name: 'nevada-ral9005', label: 'NEVADA con llave (RAL9005)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rbGFta2EtbmV2YWRhLWtsdWN6LTM1bW0tay05MDA1LnBuZw==' },
  { name: 'nevada-ral9016', label: 'NEVADA con llave (RAL9016)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rbGFta2EtbmV2YWRhLWtsdWN6LTM1bW0tay05MDE2LnBuZw==' },
  { name: 'nevada-f9',      label: 'NEVADA con llave (tytan F9)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rbGFta2EtbmV2YWRhLWtsdWN6LTM1bW0tZjkucG5n' },
  // MISTRAL
  { name: 'mistral-ral7016', label: 'MISTRAL con llave (RAL7016)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rbGFta2EtbWlzdHJhbGtsdWN6LTM1bW0tay03MDE2LnBuZw==' },
  { name: 'mistral-ral9001', label: 'MISTRAL con llave (RAL9001)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rbGFta2EtbWlzdHJhbGtsdWN6LTM1bW0tay05MDAxLnBuZw==' },
  { name: 'mistral-ral9005', label: 'MISTRAL con llave (RAL9005)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rbGFta2EtbWlzdHJhbGtsdWN6LTM1bW0tay05MDA1LnBuZw==' },
  { name: 'mistral-f9-key',  label: 'MISTRAL con llave (tytan F9)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rbGFta2EtbWlzdHJhbGtsdWN6LTM1bW0tZjkucG5n' },
  { name: 'mistral-f9',      label: 'MISTRAL F9', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rbGFta2EtbWlzdHJhbC0zNW1tLWY5LnBuZw==' },
  // DUBLIN (no key)
  { name: 'dublin-ral9016', label: 'DUBLIN (blanco RAL9016)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rbGFta2lfZHVibGluL2tsYW1rYV9va2llbm5hX2R1Ymxpbl8tX2JpYWFfcmFsOTAxNi5wbmc=' },
  { name: 'dublin-ral8019', label: 'DUBLIN (marrón RAL8019)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rbGFta2lfZHVibGluL2tsYW1rYV9va2llbm5hX2R1Ymxpbl8tX2JyYXpvd2FfcmFsODAxOS5wbmc=' },
  { name: 'dublin-ral7016', label: 'DUBLIN (RAL7016)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rbGFta2lfZHVibGluL2tsYW1rYV9va2llbm5hX2R1Ymxpbl8tX2FudHJhY3l0X3JhbDcwMTYucG5n' },
  { name: 'dublin-ral9005', label: 'DUBLIN (RAL9005)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rbGFta2lfZHVibGluL2tsYW1rYV9va2llbm5hX2R1Ymxpbl8tX2N6YXJueV9tYXRfcmFsOTAwNS5wbmc=' },
  { name: 'dublin-silver',  label: 'DUBLIN (plateada)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rbGFta2lfZHVibGluL2tsYW1rYV9va2llbm5hX2R1Ymxpbl8tX3NyZWJybmEucG5n' },
  // DUBLIN con llave
  { name: 'dublin-key-ral7016', label: 'DUBLIN con llave (RAL7016)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rbGFta2lfZHVibGluL2tsYW1rYV9va2llbm5hX3pfa2x1Y3p5a2llbV9kdWJsaW5fLV9hbnRyYWN5dF9yYWw3MDE2LnBuZw==' },
  { name: 'dublin-key-ral9005', label: 'DUBLIN con llave (RAL9005)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rbGFta2lfZHVibGluL2tsYW1rYV9va2llbm5hX3pfa2x1Y3p5a2llbV9kdWJsaW5fLV9jemFybnlfbWF0X3JhbDkwMDUucG5n' },
  { name: 'dublin-key-ral9016', label: 'DUBLIN con llave (blanco RAL9016)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rbGFta2lfZHVibGluL2tsYW1rYV9va2llbm5hX3pfa2x1Y3p5a2llbV9kdWJsaW5fLV9iaWFhX3JhbDkwMTYucG5n' },
  { name: 'dublin-key-ral8019', label: 'DUBLIN con llave (marrón RAL8019)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rbGFta2lfZHVibGluL2tsYW1rYV9va2llbm5hX3pfa2x1Y3p5a2llbV9kdWJsaW5fLV9icmF6b3dhX3JhbDgwMTkucG5n' },
  { name: 'dublin-key-silver',  label: 'DUBLIN con llave (plateada)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rbGFta2lfZHVibGluL2tsYW1rYV9va2llbm5hX3pfa2x1Y3p5a2llbV9kdWJsaW5fLV9zcmVicm5hLnBuZw==' },
  // KWADRAT (no key)
  { name: 'kwadrat-ral7016', label: 'KWADRAT RAL 7016', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rd2FkcmF0L2tsYW1rYS1rd2FkcmF0LTM1bW0tay03MDE2LnBuZw==' },
  { name: 'kwadrat-ral8019', label: 'KWADRAT RAL 8019', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rd2FkcmF0L2tsYW1rYS1rd2FkcmF0LTM1bW0tay04MDE5LnBuZw==' },
  { name: 'kwadrat-ral9016', label: 'KWADRAT RAL 9016', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rd2FkcmF0L2tsYW1rYS1rd2FkcmF0LTM1bW0tay05MDE2LnBuZw==' },
  { name: 'kwadrat-ral9001', label: 'KWADRAT RAL 9001', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rd2FkcmF0L2tsYW1rYS1rd2FkcmF0LTM1bW0tay05MDAxLnBuZw==' },
  { name: 'kwadrat-ral9005', label: 'KWADRAT RAL 9005', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rd2FkcmF0L2tsYW1rYS1rd2FkcmF0LTM1bW0tay03MDE2LnBuZw==' },
  { name: 'kwadrat-f9',     label: 'KWADRAT tytan F9', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rd2FkcmF0L2tsYW1rYS1rd2FkcmF0LTM1bW0tZjkucG5n' },
  // KWADRAT con llave
  { name: 'kwadrat-key-f1',     label: 'KWADRAT con llave F1', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rd2FkcmF0L2tsYW1rYS1rd2FkcmF0LWtsdWN6LTM1bW0tZjEucG5n' },
  { name: 'kwadrat-key-f4',     label: 'KWADRAT con llave F4', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rd2FkcmF0L2tsYW1rYS1rd2FkcmF0LWtsdWN6LTM1bW0tZjQucG5n' },
  { name: 'kwadrat-key-f9',     label: 'KWADRAT con llave F9', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rd2FkcmF0L2tsYW1rYS1rd2FkcmF0LWtsdWN6LTM1bW0tZjkucG5n' },
  { name: 'kwadrat-key-ral7016', label: 'KWADRAT con llave (RAL7016)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rd2FkcmF0L2tsYW1rYS1rd2FkcmF0LWtsdWN6LTM1bW0tcmFsLTcwMTYucG5n' },
  { name: 'kwadrat-key-ral8019', label: 'KWADRAT con llave (RAL8019)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rd2FkcmF0L2tsYW1rYS1rd2FkcmF0LWtsdWN6LTM1bW0tcmFsLTgwMTkucG5n' },
  { name: 'kwadrat-key-ral9001', label: 'KWADRAT con llave (RAL9001)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rd2FkcmF0L2tsYW1rYS1rd2FkcmF0LWtsdWN6LTM1bW0tcmFsLTkwMDEucG5n' },
  { name: 'kwadrat-key-ral9005', label: 'KWADRAT con llave (RAL9005)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rd2FkcmF0L2tsYW1rYS1rd2FkcmF0LWtsdWN6LTM1bW0tcmFsLTkwMDUucG5n' },
  { name: 'kwadrat-key-ral9016', label: 'KWADRAT con llave (RAL9016)', b64: 'L21lZGlhL191cGxvYWQvZG9kYXRraS9rbGFta2ktb2tuYS9rd2FkcmF0L2tsYW1rYS1rd2FkcmF0LWtsdWN6LTM1bW0tcmFsLTkwMTYucG5n' },
];

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath)).on('error', reject).once('close', () => resolve(filepath));
      } else {
        res.resume();
        // Try original JPG/PNG source
        reject(new Error(`Status: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
};

(async () => {
  const seen = new Set();
  let count = 0;
  for (const { name, label, b64 } of handles) {
    // Try original PNG/JPG first
    const originalPath = Buffer.from(b64, 'base64').toString('utf8');
    const ext = path.extname(originalPath) || '.png';
    const originalUrl = `https://www.drutex.es${originalPath}`;
    const filepath = path.join(OUTPUT_DIR, `${name}${ext}`);

    if (fs.existsSync(filepath)) { console.log(`[skip] ${name}`); count++; continue; }
    if (seen.has(originalUrl)) { console.log(`[dup] ${name}`); count++; continue; }
    seen.add(originalUrl);

    console.log(`[${++count}/${handles.length}] Downloading: ${name}`);
    try {
      await downloadImage(originalUrl, filepath);
      const sz = fs.statSync(filepath).size;
      console.log(`  -> ${(sz/1024).toFixed(1)}KB`);
    } catch (e) {
      // Fallback to webp
      const webpUrl = `https://www.drutex.es/media/webp/80/${b64}.webp`;
      const webpPath = path.join(OUTPUT_DIR, `${name}.webp`);
      try {
        await downloadImage(webpUrl, webpPath);
        console.log(`  -> webp fallback OK`);
      } catch(e2) {
        console.error(`  FAILED: ${e.message}`);
      }
    }
  }
  // Write JSON manifest for TS
  const manifest = handles.map(({ name, label, b64 }) => {
    const ext = path.extname(Buffer.from(b64, 'base64').toString('utf8')) || '.png';
    return { name, label, image: `/assets/handles/${name}${ext}` };
  });
  fs.writeFileSync('handles_manifest.json', JSON.stringify(manifest, null, 2));
  console.log('\nDone! handles_manifest.json written.');
})();
