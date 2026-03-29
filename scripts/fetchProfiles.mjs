import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.join(__dirname, '../public/assets/profiles');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const profiles = [
  "https://www.fensterblick.de/images/produkte/profile/drutex/iglo-5-classic.png",
  "https://www.fensterblick.de/images/produkte/profile/drutex/iglo-5.png",
  "https://www.fensterblick.de/images/produkte/profile/drutex/iglo-light.png",
  "https://www.fensterblick.de/images/produkte/profile/drutex/iglo-energy-classic.png",
  "https://www.fensterblick.de/images/produkte/profile/drutex/iglo-energy.png",
  "https://www.fensterblick.de/images/produkte/profile/drutex/iglo-edge.png",
  "https://www.fensterblick.de/images/produkte/profile/drutex/iglo-ext.png",
  "https://www.fensterblick.de/images/produkte/profile/drutex/iglo-premier.png",
  "https://www.fensterblick.de/images/produkte/profile/holz/softline-68.png",
  "https://www.fensterblick.de/images/produkte/profile/holz/softline-78.png",
  "https://www.fensterblick.de/images/produkte/profile/holz/softline-88.png",
  "https://www.fensterblick.de/images/produkte/profile/holz-alu/duoline-68.png",
  "https://www.fensterblick.de/images/produkte/profile/holz-alu/duoline-78.png",
  "https://www.fensterblick.de/images/produkte/profile/holz-alu/duoline-88.png",
  "https://www.fensterblick.de/images/produkte/profile/kunststoff-alu/iglo-energy-alucover.png"
];

// Fallback arrays if the first one yields 404s
const fallbackProfiles = [
  "https://static.fensterblick.de/profiles/iglo5classic.png",
  "https://static.fensterblick.de/profiles/iglo5.png",
  "https://static.fensterblick.de/profiles/iglolight.png",
  "https://static.fensterblick.de/profiles/igloenergyclassic.png",
  "https://static.fensterblick.de/profiles/igloenergy.png",
  "https://static.fensterblick.de/profiles/igloedge.png",
  "https://static.fensterblick.de/profiles/igloext.png",
  "https://static.fensterblick.de/profiles/iglopremier.png",
  "https://static.fensterblick.de/profiles/softline68.png",
  "https://static.fensterblick.de/profiles/softline78.png",
  "https://static.fensterblick.de/profiles/softline88.png",
  "https://static.fensterblick.de/profiles/duoline68.png",
  "https://static.fensterblick.de/profiles/duoline78.png",
  "https://static.fensterblick.de/profiles/duoline88.png",
  "https://static.fensterblick.de/profiles/igloenergyalucover.png"
];

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': 'https://www.fensterblick.de/'
      }
    };
    https.get(url, options, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

async function run() {
  for (let i = 0; i < profiles.length; i++) {
    const url = profiles[i];
    const filename = url.split('/').pop().replace('iglo-5', 'iglo5').replace(/-/g, ''); // Normalize naming formats
    const dest = path.join(outDir, filename + '.png'); // Append .png natively just in case
    
    try {
      await downloadFile(url, dest);
      console.log(`Downloaded: ${filename}.png`);
    } catch (e) {
      console.log(`Failed primary: ${url} -> ${e.message}`);
      try {
        const fallbackUrl = fallbackProfiles[i];
        if (fallbackUrl) {
          await downloadFile(fallbackUrl, dest);
          console.log(`Downloaded fallback: ${filename}.png`);
        } else {
          fs.writeFileSync(dest, "");
        }
      } catch (errFallback) {
        console.log(`Failed fallback: ${fallbackProfiles[i]} -> ${errFallback.message}`);
        fs.writeFileSync(dest, ""); // touch a blank file to avoid React crashing
      }
    }
  }
}

run().catch(console.error);
