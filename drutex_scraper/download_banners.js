const fs = require('fs');
const path = require('path');
const https = require('https');

const OUTPUT_DIR = '/Users/marckeller/Desktop/antigravravity/public/assets/windowcolors/banners';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const htmlFile = fs.readFileSync('/Users/marckeller/Desktop/antigravravity/drutex_scraper/page_dump.html', 'utf8');

// Looking for: data-color-bg="/media/webp/80/L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvYmlhbHktZnguanBn.webp"
const regex = /data-color-bg=["']\/media\/webp\/80\/(.+?)\.webp["']/g;
let match;
const downloads = [];
const seen = new Set();

while ((match = regex.exec(htmlFile)) !== null) {
  const b64 = match[1];
  const decodedPath = Buffer.from(b64, 'base64').toString('utf8');
  const fullUrl = `https://www.drutex.es${decodedPath}`;
  
  if (!seen.has(fullUrl)) {
    seen.add(fullUrl);
    const filename = path.basename(decodedPath);
    downloads.push({ url: fullUrl, filepath: path.join(OUTPUT_DIR, filename) });
  }
}

console.log(`Found ${downloads.length} unique banner textures to download.`);

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
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
  console.log("Finished downloading banner textures!");
})();
