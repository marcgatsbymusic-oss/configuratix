import fs from 'fs';

const htmlEn = fs.readFileSync('scratch/raw_ext_en.html', 'utf8');
const matchEn = htmlEn.match(/window\.__NUXT__=\((.*)\);<\/script>/);

if (matchEn) {
  try {
    const fn = new Function('return ' + matchEn[1]);
    const data = fn();
    fs.writeFileSync('scratch/nuxt_ext_en.json', JSON.stringify(data, null, 2));
    console.log("Extracted EN Nuxt data.");
  } catch (e) {
    console.error(e);
  }
}

const htmlEs = fs.readFileSync('scratch/raw_ext_es.html', 'utf8');
const matchEs = htmlEs.match(/window\.__NUXT__=\((.*)\);<\/script>/);

if (matchEs) {
  try {
    const fn = new Function('return ' + matchEs[1]);
    const data = fn();
    fs.writeFileSync('scratch/nuxt_ext_es.json', JSON.stringify(data, null, 2));
    console.log("Extracted ES Nuxt data.");
  } catch (e) {
    console.error(e);
  }
}
