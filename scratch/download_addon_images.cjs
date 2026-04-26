const fs = require('fs');
const https = require('https');
const path = require('path');

const types = ['4', '5', '6', '272', '602'];
const allData = {};

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) return resolve();
    const file = fs.createWriteStream(dest);
    https.get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(resolve);
      });
    }).on('error', function(err) {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function processAll() {
  const destDir = path.join(__dirname, '..', 'public', 'assets', 'additional-options');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  for (const id of types) {
    if (!fs.existsSync(`addons_data_${id}.json`)) continue;
    const items = JSON.parse(fs.readFileSync(`addons_data_${id}.json`, 'utf8'));
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.image) {
        // e.g. /media/webp/80/L21lZGlhL191cGxvYWQvZG9kYXRraS9zenByb3N5L3N6cHJvc3ktcHZjLmpwZw==.webp
        const url = 'https://www.drutex.eu' + item.image;
        const filename = path.basename(item.image);
        const destPath = path.join(destDir, filename);
        
        console.log(`Downloading ${filename}...`);
        try {
          await download(url, destPath);
        } catch (e) {
          console.error(`Failed to download ${url}`);
        }
        
        item.localImage = `/assets/additional-options/${filename}`;
      }
    }
    
    allData[id] = items;
  }
  
  const targetJson = path.join(__dirname, '..', 'src', 'data', 'addonsData.json');
  fs.writeFileSync(targetJson, JSON.stringify(allData, null, 2));
  console.log('All done. Wrote', targetJson);
}

processAll();
