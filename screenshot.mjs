import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/test/f252', {waitUntil: 'networkidle0', timeout: 30000});
  // Wait a bit for Three.js to render
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'C:/Users/Shadow/.gemini/antigravity/brain/7b7620af-cbae-4eab-bd0b-fffec95c79d6/media__f252.jpg', type: 'jpeg' });
  console.log('Saved screenshot to media__f252.jpg');
  await browser.close();
})();
