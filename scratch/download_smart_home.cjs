const fs = require('fs');
const https = require('https');
const path = require('path');

const downloadDir = path.join(__dirname, '..', 'public', 'assets', 'intelligent-home');
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

const assets = [
  {
    url: 'https://www.drutex.eu/media/webp/80/L21lZGlhL3NlY3Rpb25zL2hlYWRlcnMvc21hcnQtaG9tZS5qcGc=.webp',
    filename: 'hero-bg.webp'
  },
  {
    url: 'https://www.drutex.eu/media/_upload/flatpages/smart-en.jpg',
    filename: 'smart-en.jpg'
  },
  {
    url: 'https://www.drutex.eu/static/layout2021/_resources/media/Uchyl-Zamkniecie.mp4',
    filename: 'Uchyl-Zamkniecie.mp4'
  },
  {
    url: 'https://www.drutex.eu/static/layout2021/_resources/media/Grzejnik.mp4',
    filename: 'Grzejnik.mp4'
  },
  {
    url: 'https://www.drutex.eu/static/layout2021/_resources/media/Smart-Drzwi.mp4',
    filename: 'Smart-Drzwi.mp4'
  },
  {
    url: 'https://www.drutex.eu/static/layout2021/_resources/img/smart-home/img-5.jpg',
    filename: 'tahoma-main.jpg'
  },
  {
    url: 'https://www.drutex.eu/static/layout2021/_resources/img/smart-home/img-10.png',
    filename: 'tahoma-wifi.png'
  },
  {
    url: 'https://www.drutex.eu/static/layout2021/_resources/img/smart-home/img-11.png',
    filename: 'tahoma-realtime.png'
  },
  {
    url: 'https://www.drutex.eu/static/layout2021/_resources/img/smart-home/img-12.png',
    filename: 'tahoma-scenario.png'
  },
  {
    url: 'https://www.drutex.eu/media/uploads/2022/06/03/blebox.jpg',
    filename: 'blebox.jpg'
  }
];

async function downloadAsset(url, filename) {
  const filePath = path.join(downloadDir, filename);
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error("Failed to download " + url + " status code " + res.statusCode));
        return;
      }
      const fileStream = fs.createWriteStream(filePath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log("Downloaded " + filename);
        resolve(filename);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

async function main() {
  for (const asset of assets) {
    try {
      await downloadAsset(asset.url, asset.filename);
    } catch (e) {
      console.error(e.message);
    }
  }
}

main().catch(console.error);
