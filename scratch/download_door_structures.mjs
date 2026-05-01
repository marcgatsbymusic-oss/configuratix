import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.drutex.eu/en/products/iglo5-doors-pvc.html', { waitUntil: 'networkidle2' });
  
  const structures = await page.evaluate(() => {
    const allHeaders = Array.from(document.querySelectorAll('h3, h2, h4, div'));
    const structureHeader = allHeaders.find(el => el.textContent.trim() === 'Door structures' || el.textContent.trim() === 'Konstrukcje drzwiowe');
    if (!structureHeader) return { error: "Header not found" };
    
    const parent = structureHeader.closest('section, .content, .container, .t-section');
    if (!parent) return { error: "Parent not found" };
    
    const images = Array.from(parent.querySelectorAll('img')).map(img => {
      return {
        src: img.src,
        alt: img.alt
      };
    });
    return { images };
  });
  
  if (structures.error) {
      console.log(structures.error);
      process.exit(1);
  }
  
  const assetsDir = path.resolve('public/assets/iglo5-doors/door-structures');
  if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
  }

  const results = [];
  
  // They are Example 1 to 16
  for (let i = 0; i < structures.images.length; i++) {
      const item = structures.images[i];
      if (!item.src) continue;
      
      const ext = '.webp';
      const filename = `structure_${i+1}${ext}`;
      const filepath = path.join(assetsDir, filename);
      const name = item.alt || `Example ${i+1}`;
      
      console.log(`Downloading ${item.src} to ${filename}`);
      try {
          const res = await fetch(item.src);
          const buf = await res.arrayBuffer();
          fs.writeFileSync(filepath, Buffer.from(buf));
      } catch(e) {
          console.log(`Failed to download ${item.src}`);
      }
      
      results.push({
          name: name,
          image: `/assets/iglo5-doors/door-structures/${filename}`
      });
  }

  fs.writeFileSync('scratch/door_structures.json', JSON.stringify(results, null, 2));
  console.log("Finished generating JSON");
  
  await browser.close();
})();
