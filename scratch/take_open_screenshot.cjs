const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 750 });
  
  const url = 'http://localhost:5173/viewer?typology=F100_FIX_BOT';
  console.log(`Navigating to ${url}...`);
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('Page loaded. Waiting 5 seconds for initial render...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Get all overlay buttons
    const buttons = await page.$$('div.cursor-pointer');
    console.log(`Found ${buttons.length} interactive toggle buttons.`);

    if (buttons.length >= 2) {
      // 1. Click first button to open side
      console.log('Clicking the first button (Side Open)...');
      await buttons[0].click();
      console.log('Waiting 5 seconds for opening animation...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      let outputPath = 'C:/Users/Shadow/.gemini/antigravity/brain/d9c08374-a8b9-4aa9-9278-ca0ad31d7c6a/screenshot_side_open.png';
      await page.screenshot({ path: outputPath });
      console.log(`Side open screenshot saved to ${outputPath}`);

      // Click again to close
      console.log('Clicking again to close...');
      await buttons[0].click();
      console.log('Waiting 5 seconds for closing animation...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 2. Click second button to tilt open
      console.log('Clicking the second button (Tilt Open)...');
      await buttons[1].click();
      console.log('Waiting 5 seconds for tilting animation...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      outputPath = 'C:/Users/Shadow/.gemini/antigravity/brain/d9c08374-a8b9-4aa9-9278-ca0ad31d7c6a/screenshot_tilt_open.png';
      await page.screenshot({ path: outputPath });
      console.log(`Tilt open screenshot saved to ${outputPath}`);
    } else {
      console.warn('Could not find both toggle buttons on the page.');
    }
  } catch (err) {
    console.error('Error taking screenshots:', err);
  } finally {
    await browser.close();
  }
})();
