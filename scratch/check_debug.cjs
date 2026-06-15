const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));

  try {
    console.log('Navigating...');
    await page.goto('http://localhost:5173/igls-test-build', { waitUntil: 'domcontentloaded' });
    console.log('Page loaded. Waiting 5 seconds...');
    await new Promise(r => setTimeout(r, 5000));

    // Inspect the DOM elements and check if they are visible
    const initialInfo = await page.evaluate(() => {
      const configBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Configure'));
      const paletteBtn = document.querySelector('.qwheel-btn');
      const sidebar = Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('IGLSIDE_TEST_BUILD') && d.style.transform);
      
      return {
        hasConfigBtn: !!configBtn,
        hasPaletteBtn: !!paletteBtn,
        sidebarTransform: sidebar ? sidebar.style.transform : 'not found',
        sidebarVisible: sidebar ? (window.getComputedStyle(sidebar).transform !== 'none') : 'not found'
      };
    });
    console.log('Initial Info:', initialInfo);

    // Let's attempt to click the Configure button
    console.log('Clicking Configure button...');
    await page.evaluate(() => {
      const configBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Configure'));
      if (configBtn) {
        configBtn.click();
        console.log('Configure button clicked');
      } else {
        console.log('Configure button not found in page');
      }
    });

    await new Promise(r => setTimeout(r, 1000));

    const afterClickConfig = await page.evaluate(() => {
      const sidebar = Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('IGLSIDE_TEST_BUILD') && d.style.transform);
      return {
        sidebarTransform: sidebar ? sidebar.style.transform : 'not found'
      };
    });
    console.log('After Click Config:', afterClickConfig);

    // Let's attempt to click the Color Palette trigger button
    console.log('Clicking Color Palette button...');
    await page.evaluate(() => {
      const paletteBtn = document.querySelector('.qwheel-btn') || Array.from(document.querySelectorAll('button')).find(b => b.title && b.title.includes('Palette'));
      if (paletteBtn) {
        paletteBtn.click();
        console.log('Palette button clicked');
      } else {
        console.log('Palette button not found');
      }
    });

    await new Promise(r => setTimeout(r, 1000));

    const afterClickPalette = await page.evaluate(() => {
      const qwheelOpen = document.querySelector('.qwheel-open');
      return {
        isOpen: !!qwheelOpen
      };
    });
    console.log('After Click Palette:', afterClickPalette);

    await page.screenshot({ path: 'scratch/screenshot_page.png' });
    console.log('Screenshot saved.');

  } catch (err) {
    console.error('Script error:', err.message);
  } finally {
    await browser.close();
  }
})();
