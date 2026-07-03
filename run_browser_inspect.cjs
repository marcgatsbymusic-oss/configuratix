const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[BROWSER LOG] ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    console.error(`[BROWSER ERROR] ${err.toString()}`);
  });

  console.log('Navigating to http://localhost:5173/viewer?typology=F100_FIX_BOT...');
  try {
    await page.goto('http://localhost:5173/viewer?typology=F100_FIX_BOT', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('Page loaded. Waiting 5 seconds for WebGL...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  } catch (err) {
    console.error('Error running page:', err);
  } finally {
    await browser.close();
  }
})();
