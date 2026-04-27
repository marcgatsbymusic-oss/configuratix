import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // 1. English Scrape
  console.log("Navigating to IGLO PREMIER (English)...");
  await page.goto('https://www.drutex.eu/en/products/iglo-premier.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  const enText = await page.evaluate(() => document.body.innerText);
  const enMedia = await page.evaluate(() => {
    return {
      videos: Array.from(document.querySelectorAll('video source')).map(s => s.src),
      images: Array.from(document.querySelectorAll('img')).map(i => i.src)
    };
  });

  fs.writeFileSync('scratch/premier_en.txt', enText);
  fs.writeFileSync('scratch/premier_media.json', JSON.stringify(enMedia, null, 2));

  await browser.close();
  console.log("Done!");
})();
