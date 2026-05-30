const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:5173/configurator', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Accept cookies first to remove the overlay
  await page.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('button'));
     const acceptBtn = btns.find(b => b.textContent && b.textContent.includes('ACCEPT ALL'));
     if (acceptBtn) acceptBtn.click();
  });

  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
     const xpath = "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'take me directly')]";
     const btn = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
     if (btn) btn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
     const xpath = "//div[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'f100t')]";
     const btn = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
     if (btn) btn.click();
  });
  
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
     const xpath = "//div[contains(., 'Anthracite') or contains(., 'anthracite')]";
     const btns = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
     for (let i = 0; i < btns.snapshotLength; i++) {
         const btn = btns.snapshotItem(i);
         if (btn.children.length === 0 || btn.tagName === 'P') {
            btn.click();
            break;
         }
     }
  });

  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'screenshot2.jpg' });
  await browser.close();
  
  console.log("Screenshot2 saved");
})();
