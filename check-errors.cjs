const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => {
    if (!response.ok()) {
      console.log('HTTP Error:', response.url(), response.status());
    }
  });

  await page.setViewport({ width: 1440, height: 900 });
  
  await page.goto('http://localhost:5173/configurator', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('button'));
     const directBtn = btns.find(b => b.textContent && b.textContent.toLowerCase().includes('take me directly'));
     if (directBtn) directBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
     const divs = Array.from(document.querySelectorAll('div, span, button'));
     const f100tBtn = divs.find(d => d.textContent && d.textContent.trim() === 'F100T');
     if (f100tBtn) f100tBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
     const divs = Array.from(document.querySelectorAll('div, span, p'));
     const anthr = divs.find(d => d.textContent && d.textContent.includes('Anthracite'));
     if (anthr) anthr.click();
  });

  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
