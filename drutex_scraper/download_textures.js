const fs = require('fs');
const path = require('path');
const https = require('https');

const OUTPUT_DIR = '/Users/marckeller/Desktop/antigravravity/public/assets/windowcolors/textures';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const colorsFile = fs.readFileSync('/Users/marckeller/Desktop/antigravravity/src/data/productDetails.ts', 'utf8');

const regex = /image:\s*['"]\/assets\/windowcolors\/imgi_\d+_(.+?)\.webp['"]/g;
let match;
const downloads = [];

while ((match = regex.exec(colorsFile)) !== null) {
  const b64 = match[1];
  // Re-add padding to base64 if needed, although Node's Buffer handles it
  const decodedPath = Buffer.from(b64, 'base64').toString('utf8');
  
  // The decoded path is something like /media/_upload/kolory/okleiny/bialy-fx.jpg
  const fullUrl = `https://www.drutex.es${decodedPath}`;
  
  // Create safe filename
  const filename = path.basename(decodedPath);
  
  downloads.push({ url: fullUrl, filepath: path.join(OUTPUT_DIR, filename) });
}

console.log(`Found ${downloads.length} textures to download.`);

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // follow redirects if needed, though usually it's a 200
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

(async () => {
  for (let i = 0; i < downloads.length; i++) {
    const { url, filepath } = downloads[i];
    if (fs.existsSync(filepath)) {
      console.log(`[+] Skipping ${path.basename(filepath)}`);
      continue;
    }
    console.log(`Downloading ${i+1}/${downloads.length}: ${url}`);
    try {
      await downloadImage(url, filepath);
    } catch (e) {
      console.error(`[-] Failed ${url}: ${e.message}`);
    }
  }
  console.log("Finished downloading textures!");
})();
