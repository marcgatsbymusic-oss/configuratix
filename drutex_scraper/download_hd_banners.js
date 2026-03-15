const fs = require('fs');
const path = require('path');
const https = require('https');

const OUTPUT_DIR = '/Users/marckeller/Desktop/antigravravity/public/assets/windowcolors/banners-hd';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// These are the base64 encoded paths for the color-bg textures from the page dump
// Each is the background image used in the full-width banner
const colorBgMappings = [
  { name: 'bialy-fx', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvYmlhbHktZnguanBn' },
  { name: 'white-sand-u-matt', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L3doaXRlX3NhbmQtdS1tYXR0LmpwZw==' },
  { name: 'croviu-platynium-n', b64: 'L21lZGlhL191cGxvYWQva29sb3J5LzIwMTcvY3Jvdml1X3BsYXR5bml1bS1uLmpwZw==' },
  { name: 'kremowy', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkva3JlbW93eS5qcGc=' },
  { name: 'piryt', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L3Bpcnl0LmpwZw==' },
  { name: 'dab-bielony', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvZGFiLWJpZWxvbnkuanBn' },
  { name: 'dab-naturalny', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvZGFiLW5hdHVyYWxueS5qcGc=' },
  { name: 'jasny-szary-n', b64: 'L21lZGlhL191cGxvYWQva29sb3J5LzIwMTcvamFzbnlfc3phcnktbi5qcGc=' },
  { name: 'szary', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvc3phcnkuanBn' },
  { name: 'betonowy-szary', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvYmV0b25vd3ktc3phcnkuanBn' },
  { name: 'szary-kwarcytowy', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvc3phcnkta3dhcmN5dG93eS5qcGc=' },
  { name: 'szary-kwarcytowy-gladki', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvc3phcnkta3dhcmN5dG93eS1nbGFka2kuanBn' },
  { name: 'bazaltowy-szary', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvYmF6YWx0b3d5X3N6YXJ5LmpwZw==' },
  { name: 'bazaltowy-szary-gadki', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvYmF6YWx0b3d5LXN6YXJ5LWdhZGtpLmpwZw==' },
  { name: 'lupkowy-n', b64: 'L21lZGlhL191cGxvYWQva29sb3J5LzIwMTcvbHVwa293eS1uLmpwZw==' },
  { name: 'lupkowy-gladki-n', b64: 'L21lZGlhL191cGxvYWQva29sb3J5LzIwMTcvbHVwa293eS1nbGFka2ktbi5qcGc=' },
  { name: 'grafitowy-piaskowany', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvZ3JhZml0b3d5X3BpYXNrb3dhbnkuanBn' },
  { name: 'antracyt', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvYW50cmFjeXQuanBn' },
  { name: 'antrycyt0gladki', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvYW50cnljeXQwZ2xhZGtpLmpwZw==' },
  { name: 'antracyt-ulti-matt', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvYW50cmFjdXRfdWx0aS1tYXR0X3d3dy5qcGc=' },
  { name: 'jet-black', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L2pldC1ibGFjay5qcGc=' },
  { name: 'czarny-ulti-matt', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvY3phcm55X3VsdGktbWF0dF93d3cuanBn' },
  { name: 'zaoty-dab-kk', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvemFvdHktZGFiX2trLmpwZw==' },
  { name: 'turner-oak-2023', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L3R1cm5lci1vYWstMjAyMy5qcGc=' },
  { name: 'turner-oak-toffee', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L3R1cm5lcl9vYWtfdG9mZmVlXzQ3MC0zMDA0LmpwZw==' },
  { name: 'turner-oak-walnut', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L3R1cm5lcl9vYWtfd2FsbnV0XzQ3MC0zMDA0LmpwZw==' },
  { name: 'winchester', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvd2luY2hlc3Rlcl9ray5qcGc=' },
  { name: 'oregon', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvb3JlZ29uX2trLmpwZw==' },
  { name: 'daglezja', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvZGFnbGV6amFfa2suanBn' },
  { name: 'orzech', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L3dvb2Qvb3J6ZWNoLWEuanBn' },
  { name: 'ciemny-dab', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvY2llbW55LWRhYl9ray5qcGc=' },
  { name: 'polisander', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L3dvb2QvcG9saXNhbmRlci1hLmpwZw==' },
  { name: 'macore', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvbWFjb3JlX2trLmpwZw==' },
  { name: 'machoa', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvbWFjaG9hX2trLmpwZw==' },
  { name: 'braz-czekoladowy', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvYnJhei1jemVrb2xhZG93eS5qcGc=' },
  { name: 'deep-bronze', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvZGVlcF9icm9uemUuanBn' },
  { name: 'zielen-mchu', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvemllbGVuLW1jaHUuanBn' },
  { name: 'ciemno-zielony', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvY2llbW5vLXppZWxvbnkuanBn' },
  { name: 'ciemny-czerwony', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvY2llbW55LWN6ZXJ3b255LmpwZw==' },
  { name: 'brylantowo-niebieski', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L2JyeWxhbnRvd28tbmllYmllc2tpLmpwZw==' },
  { name: 'stalowy-niebieski', b64: 'L21lZGlhL191cGxvYWQva29sb3J5L29rbGVpbnkvc3RhbG93eS1uaWViaWVza2lfTjJpbVdJUy5qcGc=' },
];

const SIZE = 1920; // Request at 1920px wide - full HD quality

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else if (res.statusCode === 301 || res.statusCode === 302) {
        downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
      } else {
        res.resume();
        reject(new Error(`Status: ${res.statusCode} for ${url}`));
      }
    }).on('error', reject);
  });
};

(async () => {
  for (let i = 0; i < colorBgMappings.length; i++) {
    const { name, b64 } = colorBgMappings[i];
    const url = `https://www.drutex.es/media/webp/${SIZE}/${b64}.webp`;
    const filepath = path.join(OUTPUT_DIR, `${name}.webp`);
    
    if (fs.existsSync(filepath)) {
      const stat = fs.statSync(filepath);
      if (stat.size > 10000) { // skip if already downloaded and looks valid
        console.log(`[+] Skipping ${name}`);
        continue;
      }
    }
    
    console.log(`Downloading ${i+1}/${colorBgMappings.length} at ${SIZE}px: ${name}`);
    try {
      await downloadImage(url, filepath);
      const stat = fs.statSync(filepath);
      console.log(`    -> ${(stat.size/1024).toFixed(1)}KB`);
    } catch (e) {
      console.error(`[-] Failed ${name}: ${e.message}`);
    }
  }
  console.log("\nAll done! HD textures downloaded.");
})();
