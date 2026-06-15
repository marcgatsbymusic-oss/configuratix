const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log("Navigating to http://localhost:5173/igls-test-build...");
  await page.goto('http://localhost:5173/igls-test-build', { waitUntil: 'networkidle2' });

  await new Promise(r => setTimeout(r, 3000));

  console.log("Inspecting initial position...");
  let pos = await page.evaluate(() => {
    const group = window.assemblyGroup;
    if (!group) return null;
    const openingDoor = group.getObjectByName("Opening_Door");
    if (!openingDoor) return "Opening_Door not found";
    return {
      x: openingDoor.position.x,
      y: openingDoor.position.y,
      z: openingDoor.position.z
    };
  });
  console.log("Initial Opening_Door Position:", pos);

  console.log("Clicking the door hotspot...");
  const hotspotSelector = 'div[title*="sliding door"], div[title*="Sliding door"], div[title="Open sliding door"]';
  await page.click(hotspotSelector);

  console.log("Waiting 5 seconds...");
  await new Promise(r => setTimeout(r, 5000));

  console.log("Inspecting post-animation position...");
  pos = await page.evaluate(() => {
    const group = window.assemblyGroup;
    if (!group) return null;
    const openingDoor = group.getObjectByName("Opening_Door");
    if (!openingDoor) return "Opening_Door not found";
    return {
      x: openingDoor.position.x,
      y: openingDoor.position.y,
      z: openingDoor.position.z
    };
  });
  console.log("Post-animation Opening_Door Position:", pos);

  await browser.close();
})();
