import fs from 'fs';
import * as cheerio from 'cheerio';

const targetUrls = [
  'https://www.drutex.com/en/products/windows/pvc-windows',
  'https://www.drutex.com/en/products/windows/aluminium-windows',
  'https://www.drutex.com/en/products/windows/wooden-windows',
  'https://www.drutex.com/en/products/windows/wood-aluminium-windows'
];

async function scrape() {
  let dataset = [];

  for (const url of targetUrls) {
     try {
       console.log(`Fetching ${url}...`);
       // We'll use a mocked user-agent
       const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }});
       if (!response.ok) {
          console.error(`Failed to fetch ${url}: ${response.status}`);
          continue;
       }
       const html = await response.text();
       const $ = cheerio.load(html);
       
       // the structure of Drutex product lists might be items with .product-box or .product-item
       // Let's just dump the DOM tree strings that look like product titles and params 
       // to see what selectors to use. For now, let's just grab main text lines.
       // Actually, I can just write the HTML to a scratch file and inspect it.
       const categoryName = url.split('/').pop();
       fs.writeFileSync(`scratch/${categoryName}.html`, html);
       console.log(`Saved ${categoryName}.html`);

     } catch(e) {
       console.error(e);
     }
  }
}

scrape();
