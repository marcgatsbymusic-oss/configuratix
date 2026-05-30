const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:5173/debug-pricing', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 2000));

  // Switch to F100T
  await page.evaluate(() => {
     const sels = Array.from(document.querySelectorAll('select'));
     if (sels.length > 0) {
       sels[0].value = 'F100T';
       sels[0].dispatchEvent(new Event('change'));
     }
  });

  await new Promise(r => setTimeout(r, 1000));

  // Try to click Anthracite color
  await page.evaluate(() => {
     const divs = Array.from(document.querySelectorAll('div, span, button'));
     const anth = divs.find(d => d.textContent && d.textContent.toLowerCase().includes('anthracite'));
     if (anth) anth.click();
  });

  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
