const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  try {
    console.log('Navigating...');
    await page.goto('http://localhost:5173/debug-pricing', {waitUntil: 'domcontentloaded'});
    console.log('Page loaded');
    
    // Wait a bit for React to mount
    await new Promise(r => setTimeout(r, 2000));

    await page.evaluate(() => {
      const selects = Array.from(document.querySelectorAll('select'));
      console.log('Selects:', selects.length);
      const typSelect = selects.find(s => s.previousElementSibling && s.previousElementSibling.textContent.includes('Typology'));
      if (typSelect) {
          console.log('Found Typology Select, changing to F101C...');
          typSelect.value = 'F101C';
          typSelect.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
          console.log('Could not find Typology Select');
      }
    });

    await new Promise(r => setTimeout(r, 2000));
    
    // Check for Vite error overlay
    const errorText = await page.evaluate(() => {
        const overlay = document.querySelector('vite-error-overlay');
        if (overlay && overlay.shadowRoot) {
            const errDiv = overlay.shadowRoot.querySelector('.message-body');
            return errDiv ? errDiv.textContent : 'Overlay exists but no message';
        }
        return 'No error overlay';
    });
    
    console.log('Error overlay text:', errorText);

  } catch (err) {
    console.error('Script error:', err.message);
  } finally {
    await browser.close();
  }
})();
