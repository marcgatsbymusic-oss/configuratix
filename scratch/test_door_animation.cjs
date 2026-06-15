const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));

  console.log("Navigating to http://localhost:5173/igls-test-build...");
  await page.goto('http://localhost:5173/igls-test-build', { waitUntil: 'networkidle2' });

  console.log("Waiting 3 seconds for 3D components to render...");
  await new Promise(r => setTimeout(r, 3000));

  console.log("Finding and clicking OPEN BLINDS button...");
  try {
    const buttons = await page.$$('button');
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
      console.log("OPEN BLINDS clicked. Waiting 2 seconds for blinds to open...");
      await new Promise(r => setTimeout(r, 2000));
    } else {
      console.warn("OPEN BLINDS button not found!");
    }
    
    console.log("Locating the door hotspot...");
    const hotspotSelector = 'div[title*="sliding door"], div[title*="Sliding door"], div[title="Open sliding door"]';
    await page.waitForSelector(hotspotSelector, { timeout: 5000 });
    
    console.log("Door hotspot found! Clicking it to open the door...");
    await page.click(hotspotSelector);
    
    console.log("Waiting 5 seconds for opening animation...");
    await new Promise(r => setTimeout(r, 5000));
    
    const openScreenshotPath = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\955cdaf9-8d0b-4bc2-b448-c22658430c6b\\igls_door_open.png';
    console.log(`Taking screenshot of open door and saving to ${openScreenshotPath}...`);
    await page.screenshot({ path: openScreenshotPath });
    console.log("Screenshot saved!");
  } catch (err) {
    console.error("Error during animation test:", err);
  }

  await browser.close();
})();
