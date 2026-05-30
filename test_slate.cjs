const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  try {
    console.log('Navigating to Slate Configurator...');
    await page.goto('http://localhost:5173/slate-configurator', {waitUntil: 'domcontentloaded'});
    console.log('Page loaded');
    
    // Wait a bit for React to mount
    await new Promise(r => setTimeout(r, 2000));

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      console.log('Buttons on page:', buttons.length);
      const f101cBtn = buttons.find(b => b.textContent && b.textContent.includes('F101C'));
      if (f101cBtn) {
          console.log('Found F101C button, clicking...');
          f101cBtn.click();
      } else {
          console.log('Could not find F101C button');
      }
    });

    await new Promise(r => setTimeout(r, 2000));
    
    const url = page.url();
    console.log('Current URL:', url);

  } catch (err) {
    console.error('Script error:', err.message);
  } finally {
    await browser.close();
  }
})();
