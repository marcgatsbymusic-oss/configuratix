const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await page.goto('http://localhost:5173/', {waitUntil: 'networkidle2'});
  console.log('Page loaded');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const anth = buttons.find(b => b.textContent.includes('Anthracite') || b.textContent.includes('antracyt') || b.className.includes('bg-[#3b3c3f]'));
    if (anth) anth.click();
    else console.log('Could not find Anthracite button');
  });
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
