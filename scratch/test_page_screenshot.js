import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  page.on('console', msg => {
    console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.error(`[Browser PageError] ${err.toString()}`);
  });

  console.log('Navigating to http://localhost:5173/movable-mullion-test...');
  try {
    await page.goto('http://localhost:5173/movable-mullion-test', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('Page loaded. Waiting 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const outputPath = 'C:/Users/Shadow/.gemini/antigravity/brain/1ae03abb-b213-4f66-81df-78d18a055e6a/screenshot.png';
    await page.screenshot({ path: outputPath });
    console.log(`Screenshot saved to ${outputPath}`);
  } catch (err) {
    console.error('Error during navigation/screenshot:', err);
  } finally {
    await browser.close();
  }
})();
