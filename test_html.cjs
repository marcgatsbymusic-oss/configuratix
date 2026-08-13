const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');
  await page.evaluate(() => localStorage.setItem('mockRole', 'ADMIN'));
  await page.reload();
  await new Promise(r => setTimeout(r, 2000));
  const html = await page.$eval('#root', el => el.innerHTML);
  console.log(html);
  await browser.close();
})();
