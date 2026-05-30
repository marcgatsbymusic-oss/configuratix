import puppeteer from 'puppeteer';

(async () => {
  try {
    console.log("Launching browser...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 768 });

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

    console.log("Navigating to Debug Pricing page...");
    await page.goto('http://localhost:5173/debug-pricing', { waitUntil: 'networkidle2' });

    // Wait for the Canvas and Three.js scene to render and stabilize
    console.log("Waiting for Canvas to load...");
    await new Promise(r => setTimeout(r, 4000));
    await page.screenshot({ path: 'scratch/visualizer_initial.png' });

    // Find the canvas coordinates
    const canvasElement = await page.$('.visualizer-container canvas');
    if (!canvasElement) {
      console.error("Canvas element not found!");
      await browser.close();
      return;
    }

    const box = await canvasElement.boundingBox();
    console.log("Canvas bounding box:", box);

    // Click and drag to test interaction
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    const endX = startX + 150;
    const endY = startY + 50;

    console.log(`Simulating drag from (${startX}, ${startY}) to (${endX}, ${endY})...`);
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 20 });
    await page.mouse.up();

    console.log("Drag completed. Waiting for render...");
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'scratch/visualizer_after_drag.png' });

    await browser.close();
    console.log("Done.");
  } catch (err) {
    console.error("Error during puppeteer test:", err);
  }
})();
