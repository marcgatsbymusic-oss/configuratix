import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.drutex.eu/en/products/iglo5-doors-pvc.html', { waitUntil: 'networkidle2' });

  const colors = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.animate-change-color-element'));
    return items.map(el => {
      return {
        name: el.getAttribute('data-name'),
        code: el.getAttribute('data-code'),
        img: el.getAttribute('data-img'),
        bg: el.getAttribute('data-bg')
      };
    });
  });

  console.log(JSON.stringify(colors, null, 2));
  await browser.close();
})();
