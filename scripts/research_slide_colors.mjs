import * as cheerio from 'cheerio';
import fs from 'fs';

async function fetchColors() {
  const url = 'https://www.drutex.eu/en/products/iglo-edge-slide.html';
  console.log(`Fetching ${url}...`);
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Colors are usually in a div with data attributes or inside a script tag
  // Let's look for elements with class 'color-item', 'color-swatch', or similar
  const colorElements = $('div.color-item, div.color-swatch, .color-selector div, .colors-list div, [data-color]');
  
  console.log(`Found ${colorElements.length} elements that might be colors based on classes.`);
  
  const imgs = [];
  $('img').each((i, el) => {
    imgs.push($(el).attr('src'));
  });
  console.log("Images on page:", imgs.filter(i => i && i.includes('media/')));

  const scripts = $('script').map((i, el) => $(el).html()).get().filter(s => s && s.length > 0);
  for (let i = 0; i < scripts.length; i++) {
     if (scripts[i].includes('color') || scripts[i].includes('.jpg') || scripts[i].includes('.webp')) {
         fs.writeFileSync(`scripts/script_${i}.js`, scripts[i]);
         console.log(`Saved script_${i}.js`);
     }
  }
}

fetchColors();
