import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  console.log('Navigating to http://localhost:5174/f202rfixv2...');
  try {
    await page.goto('http://localhost:5174/f202rfixv2', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('Page loaded. Waiting 5 seconds for 3D model to render...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const outputPath = 'C:/Users/Shadow/.gemini/antigravity/brain/924642f5-417b-4fb8-b030-eb848f366f8f/screenshot.png';
    await page.screenshot({ path: outputPath });
    console.log(`Screenshot saved to ${outputPath}`);
  } catch (err) {
    console.error('Error taking screenshot:', err);
  } finally {
    await browser.close();
  }
})();
