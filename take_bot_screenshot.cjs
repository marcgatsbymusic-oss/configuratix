const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 750 });
  
  console.log('Navigating to http://localhost:5173/viewer?typology=F100_FIX_BOT...');
  try {
    await page.goto('http://localhost:5173/viewer?typology=F100_FIX_BOT', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('Page loaded. Waiting 5 seconds for rendering...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const outputPath = 'C:/Users/Shadow/.gemini/antigravity/brain/d9c08374-a8b9-4aa9-9278-ca0ad31d7c6a/screenshot_transom_gasket.png';
    await page.screenshot({ path: outputPath });
    console.log(`Screenshot saved to ${outputPath}`);
  } catch (err) {
    console.error('Error taking screenshot:', err);
  } finally {
    await browser.close();
  }
})();
