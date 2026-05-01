import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  console.log("Navigating...");
  await page.goto('https://www.drutex.eu/en/products/iglo5-doors-pvc.html', { waitUntil: 'networkidle2' });
  
  console.log("Evaluating...");
  const data = await page.evaluate(() => {
    // Drutex dynamically loads infills, likely in a grid.
    // Let's find all images that are in the infills section or have "dx" or "wypelnienia" in their src.
    const items = [];
    const elements = document.querySelectorAll('.t-item, .item, li');
    
    // Also let's check for all images with "drzwi-iglo5" or "wypelnienia" or "dx"
    const allImages = Array.from(document.querySelectorAll('img')).map(img => {
       return {
          src: img.src,
          alt: img.alt,
          parentText: img.parentElement.textContent.trim()
       }
    });

    return { allImages };
  });
  
  const assetsDir = path.resolve('public/assets/iglo5-doors/infills');
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

  const infillKeywords = ['FLORIDA', 'MONTANA', 'OHIO', 'COLORADO', 'ALASKA', 'ARIZONA', 'NEBRASKA', 'TEXAS', 'CALIFORNIA', 'PENNSYLVANIA', 'HAWAII', 'DX', 'Example'];
  
  const results = [];
  
  for (const img of data.allImages) {
     const text = img.alt || img.parentText || '';
     const isMatch = infillKeywords.some(kw => text.toUpperCase().includes(kw));
     if (isMatch || img.src.includes('wypelnienia') || img.src.includes('/dx')) {
         
         // try to extract a clean name
         let name = text.replace('Decorative overlay', '').replace('PVC infill panel', '').replace('(L)(R)', '').replace('(L)(C)(R)', '').replace(/\n/g, ' ').trim();
         if (!name) {
             const parts = img.src.split('/');
             name = parts[parts.length - 1].split('.')[0];
         }
         
         results.push({ name, src: img.src });
     }
  }
  
  // Dedup
  const unique = [];
  const seen = new Set();
  for (const r of results) {
     if (!seen.has(r.src)) {
         seen.add(r.src);
         unique.push(r);
     }
  }

  console.log("Found matches:", unique.length);

  for (const item of unique) {
     if (!item.src || !item.src.startsWith('http')) continue;
     const filename = item.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + path.extname(item.src).split('?')[0];
     const filepath = path.join(assetsDir, filename);
     console.log("Downloading", item.src, "to", filename);
     try {
         const res = await fetch(item.src);
         const buf = await res.arrayBuffer();
         fs.writeFileSync(filepath, Buffer.from(buf));
         item.localPath = `/assets/iglo5-doors/infills/${filename}`;
     } catch(e) {
         console.log("Error downloading", item.src);
     }
  }

  console.log(JSON.stringify(unique, null, 2));
  
  await browser.close();
})();
