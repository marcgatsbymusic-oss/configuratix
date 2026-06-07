const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\7163961f-dc03-4768-b2a4-c6be939a7767';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('http://localhost:5173/debug-pricing', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 7000));

  // Dismiss cookie banner
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      const text = btn.textContent.trim().toUpperCase();
      if (text === 'ACCEPT ALL' || text === 'ACCEPT') { btn.click(); break; }
    }
  });
  await new Promise(r => setTimeout(r, 500));

  // Set width to 600mm (so wall is more visible around window)
  const widthInput = await page.$('input[type="number"]');
  if (widthInput) {
    await widthInput.triple_click?.();
    await widthInput.click({ clickCount: 3 });
    await widthInput.type('600');
    await widthInput.press('Enter');
    await new Promise(r => setTimeout(r, 1000));
  }

  // Open scenery and click Urban Skyline
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.title === "Scenery backdrop") { btn.click(); return; }
    }
    for (const btn of buttons) {
      if (btn.className && btn.className.includes('w-9')) { btn.click(); return; }
    }
  });
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.title === "Scenery backdrop" || (btn.textContent && btn.textContent.includes('Scenery'))) {
        btn.click(); return;
      }
    }
  });
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.getAttribute('title') === "Urban Skyline") { btn.click(); return; }
    }
  });

  await new Promise(r => setTimeout(r, 4000));

  const canvasRect = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;
    const r = canvas.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height };
  });

  if (canvasRect) {
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'F_600mm_urban_skyline.png'),
      clip: { x: canvasRect.x, y: canvasRect.y, width: canvasRect.width, height: canvasRect.height }
    });
    console.log('Captured 600mm urban skyline canvas');
  }

  // Also test warm-nordic (HOME scenery with wood wall)
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.className && btn.className.includes('w-9')) { btn.click(); return; }
    }
  });
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.title === "Scenery backdrop" || (btn.textContent && btn.textContent.includes('Scenery'))) {
        btn.click(); return;
      }
    }
  });
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.getAttribute('title') === "Nordic Wood Planking") { btn.click(); return; }
    }
  });
  await new Promise(r => setTimeout(r, 3000));

  if (canvasRect) {
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'G_warm_nordic_canvas.png'),
      clip: { x: canvasRect.x, y: canvasRect.y, width: canvasRect.width, height: canvasRect.height }
    });
    console.log('Captured warm nordic canvas');
  }

  console.log('Done!');
  await browser.close();
})();
