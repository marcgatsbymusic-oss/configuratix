import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // 1. English Scrape
  console.log("Navigating to IGLO EXT (English)...");
  await page.goto('https://www.drutex.eu/en/products/iglo-ext.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000)); // Wait for vue to render completely

  const enText = await page.evaluate(() => document.body.innerText);
  const enMedia = await page.evaluate(() => {
    return {
      videos: Array.from(document.querySelectorAll('video source')).map(s => s.src),
      images: Array.from(document.querySelectorAll('img')).map(i => i.src)
    };
  });

  fs.writeFileSync('scratch/ext_en.txt', enText);
  fs.writeFileSync('scratch/ext_media.json', JSON.stringify(enMedia, null, 2));

  // 2. Spanish Scrape
  console.log("Navigating to IGLO EXT (Spanish)...");
  await page.goto('https://www.drutex.eu/es/productos/iglo-ext.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  const esText = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync('scratch/ext_es.txt', esText);

  await browser.close();
  console.log("Done!");
})();
