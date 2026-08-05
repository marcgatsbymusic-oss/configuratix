import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER EXCEPTION:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    console.log('Page loaded completely!');
  } catch (e) {
    console.error('Failed to load page:', e);
  } finally {
    await browser.close();
  }
})();
