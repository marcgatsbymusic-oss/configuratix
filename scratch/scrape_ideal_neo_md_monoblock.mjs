import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log("Navigating to IDEAL NEO MD MONOBLOCK (English)...");
  await page.goto('https://www.drutex.eu/en/products/ideal-neo-md-monoblock.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  const enText = await page.evaluate(() => document.body.innerText);
  const enMedia = await page.evaluate(() => {
    return {
      videos: Array.from(document.querySelectorAll('video source')).map(s => s.src),
      images: Array.from(document.querySelectorAll('img')).map(i => i.src)
    };
  });

  fs.writeFileSync('scratch/ideal_neo_md_monoblock_en.txt', enText);
  fs.writeFileSync('scratch/ideal_neo_md_monoblock_media.json', JSON.stringify(enMedia, null, 2));

  await browser.close();
  console.log("Done!");
})();
