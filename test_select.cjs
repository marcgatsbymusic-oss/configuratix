const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  try {
    await page.goto('http://localhost:5173/', {waitUntil: 'networkidle2'});
    console.log('Page loaded');
    
    // The window type is usually a select dropdown or buttons. Let's find out how to select F100T.
    // In MainConfigurator, there's a WindowTypeId selector.
    // Wait for something to be clickable.
    await page.evaluate(() => {
      // Find the select element for window type or click a button
      const selects = Array.from(document.querySelectorAll('select'));
      // Let's just log them
      console.log('Selects found:', selects.length);
      if (selects.length > 0) {
        selects[0].value = 'F100T';
        selects[0].dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    await new Promise(r => setTimeout(r, 2000));
    console.log('Done testing.');
  } catch (err) {
    console.error('Script error:', err.message);
  } finally {
    await browser.close();
  }
})();
