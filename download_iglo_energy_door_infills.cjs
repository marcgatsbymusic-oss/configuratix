const https = require('https');
const fs = require('fs');
const path = require('path');

const assets = [
  // 5 PVC door infills
  { name: 'DX-01', url: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvZG9kYXRraS9kcnp3aS13ZWpzY2lvd2Uvd3lwZWxuaWVuaWFfcHZjLzIwMjUvcHZjX2R4LTAxLmpwZw==.webp', dest: '/assets/iglo-energy-doors/infills/dx-01.webp' },
  { name: 'DX-02', url: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvZG9kYXRraS9kcnp3aS13ZWpzY2lvd2Uvd3lwZWxuaWVuaWFfcHZjLzIwMjUvcHZjX2R4LTAyLmpwZw==.webp', dest: '/assets/iglo-energy-doors/infills/dx-02.webp' },
  { name: 'DX-03', url: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvZG9kYXRraS9kcnp3aS13ZWpzY2lvd2Uvd3lwZWxuaWVuaWFfcHZjLzIwMjUvcHZjX2R4LTAzLmpwZw==.webp', dest: '/assets/iglo-energy-doors/infills/dx-03.webp' },
  { name: 'DX-04', url: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvZG9kYXRraS9kcnp3aS13ZWpzY2lvd2Uvd3lwZWxuaWVuaWFfcHZjLzIwMjUvcHZjX2R4LTA0LmpwZw==.webp', dest: '/assets/iglo-energy-doors/infills/dx-04.webp' },
  { name: 'DX-05', url: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvZG9kYXRraS9kcnp3aS13ZWpzY2lvd2Uvd3lwZWxuaWVuaWFfcHZjLzIwMjUvcHZjX2R4LTA1LmpwZw==.webp', dest: '/assets/iglo-energy-doors/infills/dx-05.webp' },
  
  // Door Structure image
  { name: 'Door Structure', url: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvZG9kYXRraS9rb25zdHJ1a2NqZV9kcnp3aW93ZS93eXAtcHZjMS5wbmc=.webp', dest: '/assets/iglo-energy-doors/door-structure.webp' },
];

const dir = path.join(__dirname, 'public', 'assets', 'iglo-energy-doors', 'infills');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        console.error(`Failed to download ${url}: ${res.statusCode}`);
        resolve(); return; // Ignore errors
      }
      const file = fs.createWriteStream(path.join(__dirname, 'public', dest));
      res.pipe(file);
      file.on('finish', () => { file.close(resolve); });
    }).on('error', (err) => {
      console.error(`Error downloading ${url}:`, err.message);
      fs.unlink(dest, () => resolve()); // Delete the file async.
    });
  });
};

(async () => {
  for (const asset of assets) {
    console.log(`Downloading ${asset.name}`);
    await downloadFile(asset.url, asset.dest);
  }
  console.log('All downloads completed!');
})();
