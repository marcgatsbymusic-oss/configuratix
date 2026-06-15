const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:5173/igls-test-build', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const keys = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return ['No canvas found'];
    
    const canvasKeys = Object.keys(canvas);
    const parentKeys = Object.keys(canvas.parentElement || {});
    
    // Find all React internal keys on the canvas and its parent
    return {
      canvasKeys,
      parentKeys
    };
  });

  console.log("Canvas Keys:", keys);
  await browser.close();
})();
