const https = require('https');
const fs = require('fs');
const path = require('path');

const assets = [
  { url: 'https://www.drutex.eu/media/_upload/produkty/drzwi-iglo-energy/drzwi-iglo-energy-cover.mp4', dest: '/assets/iglo-energy-doors/hero.mp4' },
  { url: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvZHJ6d2ktaWdsby1lbmVyZ3kvZGFnbGV6amFfa2sucG5n.webp', dest: '/assets/iglo-energy-doors/profile.webp' },
  { url: 'https://www.drutex.eu/media/webp/80/L21lZGlhL191cGxvYWQvcHJvZHVrdHkvZHJ6d2ktaWdsby1lbmVyZ3kva29sb3J5L3d5cGVsbmllbmlhLTIwMjYvaWdsby1lbmVyZ3ktbW9udGFuYS1iaWFseS1meC5qcGc=.webp', dest: '/assets/iglo-energy-doors/door.webp' }
];

const dir = path.join(__dirname, 'public', 'assets', 'iglo-energy-doors');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        resolve(); return; // Ignore errors
      }
      const file = fs.createWriteStream(path.join(__dirname, 'public', dest));
      res.pipe(file);
      file.on('finish', () => { file.close(resolve); });
    }).on('error', (err) => {
      fs.unlink(dest, () => resolve()); // Delete the file async.
    });
  });
};

(async () => {
  for (const asset of assets) {
    console.log(`Downloading ${asset.url}`);
    await downloadFile(asset.url, asset.dest);
  }
  console.log('All downloads completed!');
})();
