const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  await page.goto('http://localhost:5173/configurator', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Dismiss cookie modal
  await page.evaluate(() => {
    const xpath = "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'accept all')]";
    const btn = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (btn) {
      btn.click();
      console.log("Clicked Accept All");
    }
  });
  await new Promise(r => setTimeout(r, 1000));

  // Click 'take me directly'
  await page.evaluate(() => {
    const xpath = "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'take me directly')]";
    const btn = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (btn) {
      btn.click();
      console.log("Clicked Take me directly");
    }
  });
  await new Promise(r => setTimeout(r, 1000));

  // Click F100T
  await page.evaluate(() => {
    const xpath = "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'f100t')]";
    const btn = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (btn) {
      btn.click();
      console.log("Clicked F100T");
    }
  });
  await new Promise(r => setTimeout(r, 5000)); // wait for 3D render
  
  const outputPath = 'scratch/screenshot_f100t.jpg';
  await page.screenshot({ path: outputPath });
  console.log("Screenshot successfully saved to: " + outputPath);
  
  await browser.close();
  console.log("Browser closed.");
})().catch(err => {
  console.error("Fatal error:", err);
});
