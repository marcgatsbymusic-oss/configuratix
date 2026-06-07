const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.error(`[BROWSER PAGE ERROR] ${err.toString()}`);
  });

  console.log("Navigating to SLE201 viewer page...");
  await page.goto('http://localhost:5173/viewer?typology=SLE201', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 6000));
  
  await browser.close();
  console.log("Done");
})();
