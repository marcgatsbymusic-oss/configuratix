const fs = require('fs');
const https = require('https');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'assets', 'features');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const dest = path.join(dir, 'alu-cover-feature.jpg');
const file = fs.createWriteStream(dest);

https.get('https://www.drutex.eu/media/uploads/2023/07/31/iglo-energy-alu-cover2.jpg', (res) => {
  res.pipe(file);
  file.on('finish', () => console.log('Downloaded feature image'));
});
