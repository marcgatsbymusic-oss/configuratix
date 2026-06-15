import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  const url = 'http://localhost:5173/configurator?product=roller-blind-box-225';
  console.log(`Navigating to ${url}...`);
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('Page loaded. Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Find the button that has text "3D Live"
    console.log('Clicking "3D Live" button...');
    const buttons = await page.$$('button');
    let clicked = false;
    for (const button of buttons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && text.includes('3D Live')) {
        await button.click();
        clicked = true;
        break;
      }
    }

    if (clicked) {
      console.log('Successfully clicked "3D Live". Waiting 8 seconds for 3D model to render...');
      await new Promise(resolve => setTimeout(resolve, 8000));
    } else {
      console.log('Could not find "3D Live" button. Will screenshot anyway.');
    }
    
    const outputPath = 'C:/Users/Shadow/.gemini/antigravity/brain/d9b1d417-d17f-4ac4-88be-606c942beaf5/screenshot_roller_blind.png';
    await page.screenshot({ path: outputPath });
    console.log(`Screenshot saved to ${outputPath}`);
  } catch (err) {
    console.error('Error taking screenshot:', err);
  } finally {
    await browser.close();
  }
})();
