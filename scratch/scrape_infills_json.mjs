import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.drutex.eu/en/products/iglo5-doors-pvc.html', { waitUntil: 'networkidle2' });
  
  const data = await page.evaluate(() => {
    const allImages = Array.from(document.querySelectorAll('img')).map(img => {
       return {
          src: img.src,
          alt: img.alt,
          parentText: img.parentElement.textContent.trim()
       }
    });
    return { allImages };
  });
  
  const infillKeywords = ['FLORIDA', 'MONTANA', 'OHIO', 'COLORADO', 'ALASKA', 'ARIZONA', 'NEBRASKA', 'TEXAS', 'CALIFORNIA', 'PENNSYLVANIA', 'HAWAII', 'DX', 'Example'];
  const results = [];
  
  for (const img of data.allImages) {
     const text = img.alt || img.parentText || '';
     const isMatch = infillKeywords.some(kw => text.toUpperCase().includes(kw));
     if (isMatch || img.src.includes('wypelnienia') || img.src.includes('/dx')) {
         let name = text.replace('Decorative overlay', '').replace('PVC infill panel', '').replace('(L)(R)', '').replace('(L)(C)(R)', '').replace(/\n/g, ' ').trim();
         if (!name) {
             const parts = img.src.split('/');
             name = parts[parts.length - 1].split('.')[0].toUpperCase().replace(/_/g, ' ').replace(/-/g, ' ');
             if (name.includes('DX')) {
                 name = 'DX ' + name.split('DX')[1].trim().split(' ')[0];
             }
         }
         results.push({ name, src: img.src });
     }
  }
  
  const unique = [];
  const seen = new Set();
  const nameSeen = new Set();
  for (const r of results) {
     if (!seen.has(r.src) && !nameSeen.has(r.name)) {
         seen.add(r.src);
         nameSeen.add(r.name);
         
         const filename = r.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + path.extname(r.src).split('?')[0];
         unique.push({
             name: r.name,
             image: `/assets/iglo5-doors/infills/${filename}`,
             largeImage: `/assets/iglo5-doors/infills/${filename}`
         });
     }
  }

  // Also extract examples
  const exampleImages = data.allImages.filter(img => img.alt && img.alt.includes('Example'));
  const examplesUnique = [];
  const exSeen = new Set();
  for (const ex of exampleImages) {
      if (!exSeen.has(ex.src)) {
          exSeen.add(ex.src);
          examplesUnique.push(ex);
      }
  }
  
  for (const ex of examplesUnique) {
      const filename = ex.alt.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.webp';
      unique.push({
         name: ex.alt,
         image: `/assets/iglo5-doors/infills/${filename}`,
         largeImage: `/assets/iglo5-doors/infills/${filename}`
      });
  }

  console.log(JSON.stringify(unique, null, 2));
  await browser.close();
})();
