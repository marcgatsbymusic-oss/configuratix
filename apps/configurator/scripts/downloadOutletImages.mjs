import fs from 'fs';
import path from 'path';
import https from 'https';

const dataPath = path.join(process.cwd(), 'src', 'data', 'outlet_products.json');
const outDir = path.join(process.cwd(), 'public', 'outlet');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

async function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Check for redirects or auth walls
      if (res.statusCode !== 200) {
        console.warn(`Failed to download ${url}: status ${res.statusCode}`);
        return resolve(false);
      }
      const contentType = res.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
         console.warn(`URL does not seem to point directly to an image: ${contentType}`);
         return resolve(false);
      }
      
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  let updated = false;
  for (const product of data.products) {
    if (product.imageUrls && product.imageUrls.length > 0) {
      const url = product.imageUrls[0];
      const filename = `${product.id}.jpg`;
      const dest = path.join(outDir, filename);
      console.log(`Downloading ${url} ...`);
      const success = await downloadImage(url, dest);
      if (success) {
        product.localImage = `/outlet/${filename}`;
        updated = true;
      }
    }
  }
  
  if (updated) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log("Updated JSON with localImage paths.");
  }
}

run();
