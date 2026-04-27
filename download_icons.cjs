const https = require('https');
const fs = require('fs');
const path = require('path');

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(resolve); });
    }).on('error', reject);
  });
};

(async () => {
  const dir = path.join(__dirname, 'public/assets/softline');
  await downloadFile('https://www.drutex.eu/static/layout2021/images/btn-window.svg', path.join(dir, 'btn-window.svg'));
  await downloadFile('https://www.drutex.eu/static/layout2021/images/btn-profil.svg', path.join(dir, 'btn-profil.svg'));
  console.log('Downloaded SVGs');
})();
