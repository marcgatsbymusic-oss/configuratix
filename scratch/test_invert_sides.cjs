const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));

  console.log("Navigating to http://localhost:5173/igls-test-build...");
  await page.goto('http://localhost:5173/igls-test-build', { waitUntil: 'networkidle2' });

  await new Promise(r => setTimeout(r, 3000));

  console.log("Clicking the Invert Sides button...");
  try {
    const buttons = await page.$$('button');
    let invertBtn = null;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent.trim(), btn);
      if (text === 'Invert Sides') {
        invertBtn = btn;
        break;
      }
    }

    if (invertBtn) {
      await invertBtn.click();
      console.log("Invert Sides clicked! Waiting 2 seconds...");
      await new Promise(r => setTimeout(r, 2000));
      
      const closedScreenshotPath = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\955cdaf9-8d0b-4bc2-b448-c22658430c6b\\igls_mirrored_closed.png';
      console.log(`Taking screenshot of closed mirrored door to ${closedScreenshotPath}...`);
      await page.screenshot({ path: closedScreenshotPath });
      console.log("Closed mirrored screenshot saved!");
    } else {
      console.error("Invert Sides button not found!");
    }

    // Now open blinds
    let openBlindsBtn = null;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent.trim(), btn);
      if (text === 'OPEN BLINDS') {
        openBlindsBtn = btn;
        break;
      }
    }
    
    if (openBlindsBtn) {
      await openBlindsBtn.click();
      console.log("OPEN BLINDS clicked. Waiting 2 seconds...");
      await new Promise(r => setTimeout(r, 2000));
    }

    // Trigger door opening
    console.log("Locating the door hotspot...");
    const hotspotSelector = 'div[title*="sliding door"], div[title*="Sliding door"], div[title="Open sliding door"]';
    await page.waitForSelector(hotspotSelector, { timeout: 5000 });
    
    console.log("Door hotspot found! Clicking it to open the door...");
    await page.click(hotspotSelector);
    
    console.log("Waiting 5 seconds for opening animation...");
    await new Promise(r => setTimeout(r, 5000));
    
    const openScreenshotPath = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\955cdaf9-8d0b-4bc2-b448-c22658430c6b\\igls_mirrored_open.png';
    console.log(`Taking screenshot of open mirrored door to ${openScreenshotPath}...`);
    await page.screenshot({ path: openScreenshotPath });
    console.log("Open mirrored screenshot saved!");

  } catch (err) {
    console.error("Error during mirrored test:", err);
  }

  await browser.close();
})();
