import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  console.log("Navigating to IGLO Light...");
  await page.goto('https://www.drutex.eu/en/products/iglo-light.html', { waitUntil: 'networkidle2' });

  const media = await page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll('video source')).map(s => s.src);
    const images = Array.from(document.querySelectorAll('img')).map(i => i.src).filter(src => src.includes('iglo'));
    return { videos, images };
  });

  console.log("Extracted Media:");
  console.log(JSON.stringify(media, null, 2));

  await browser.close();
})();
