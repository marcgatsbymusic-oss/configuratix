import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));
  await page.goto('http://localhost:5173/test/f252', {waitUntil: 'networkidle0', timeout: 30000});
  const html = await page.content();
  fs.writeFileSync('C:/Users/Shadow/.gemini/antigravity/brain/7b7620af-cbae-4eab-bd0b-fffec95c79d6/scratch/f252_dom.html', html);
  console.log('Saved DOM to f252_dom.html');
  await browser.close();
})();
