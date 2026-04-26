const fs = require('fs');
const https = require('https');
const path = require('path');

const downloads = [
  {
    url: 'https://www.drutex.eu/media/_upload/produkty/IGLO_ENERGY/video/iglo_energy_anim_winchester.mp4',
    dest: path.join(__dirname, '..', 'public', 'assets', 'heroes', 'iglo_energy_anim_winchester.mp4')
  },
  {
    url: 'https://www.drutex.eu/media/_upload/produkty/IGLO_ENERGY/film/hd/iglo_energy_animacja-2024-en.mp4',
    dest: path.join(__dirname, '..', 'public', 'assets', 'products', 'iglo_energy_animacja-2024-en.mp4')
  },
  {
    url: 'https://www.drutex.eu/media/_upload/produkty/IGLO_ENERGY/iglo_energy_-_pr.png',
    dest: path.join(__dirname, '..', 'public', 'assets', 'products', 'iglo_energy_pr.png')
  },
  {
    url: 'https://www.drutex.eu/media/_upload/produkty/IGLO_ENERGY/iglo_energy.png',
    dest: path.join(__dirname, '..', 'public', 'assets', 'tech', 'iglo_energy.png')
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    // Ensure dir exists
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (fs.existsSync(dest)) return resolve();

    const file = fs.createWriteStream(dest);
    https.get(url, function(response) {
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
      }
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
  for (const d of downloads) {
    console.log('Downloading', d.url);
    try {
      await download(d.url, d.dest);
      console.log('Done', d.dest);
    } catch (e) {
      console.error('Error', e.message);
    }
  }
}

processAll();
