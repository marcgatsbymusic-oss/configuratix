const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log("Navigating to http://localhost:5173/igls-test-build...");
  await page.goto('http://localhost:5173/igls-test-build', { waitUntil: 'networkidle2' });
  
  console.log("Waiting 4 seconds for page to render and group to register...");
  await new Promise(r => setTimeout(r, 4000));

  console.log("Inspecting Three.js scene graph...");
  const result = await page.evaluate(() => {
    const group = window.assemblyGroup;
    if (!group) return { error: 'window.assemblyGroup is not defined!' };

    const meshes = [];
    group.updateMatrixWorld(true);
    group.traverse((child) => {
      if (child.isMesh && child.geometry) {
        // Calculate world bounds
        child.geometry.computeBoundingBox();
        const box = child.geometry.boundingBox.clone();
        box.applyMatrix4(child.matrixWorld);

        // Get parent hierarchy names
        const names = [];
        let p = child;
        while (p && p !== group) {
          names.unshift(`${p.type}(${p.name || ''})`);
          p = p.parent;
        }
        
        meshes.push({
          hierarchy: names.join(' -> '),
          minX: box.min.x * 1000,
          maxX: box.max.x * 1000,
          minY: box.min.y * 1000,
          maxY: box.max.y * 1000,
          minZ: box.min.z * 1000,
          maxZ: box.max.z * 1000
        });
      }
    });

    return { meshes };
  });

  if (result.error) {
    console.error("Error:", result.error);
  } else {
    console.log(`\nFound ${result.meshes.length} meshes in scene:`);
    const floating = result.meshes.filter(m => m.maxX > 2300);
    console.log(`\n--- Floating Meshes (maxX > 2300 mm) ---`);
    for (const m of floating) {
      console.log(`Mesh: ${m.hierarchy}`);
      console.log(`  X: [${m.minX.toFixed(1)}, ${m.maxX.toFixed(1)}]`);
      console.log(`  Y: [${m.minY.toFixed(1)}, ${m.maxY.toFixed(1)}]`);
      console.log(`  Z: [${m.minZ.toFixed(1)}, ${m.maxZ.toFixed(1)}]`);
    }

    console.log(`\n--- All Meshes in Scene ---`);
    for (const m of result.meshes) {
      console.log(`Mesh: ${m.hierarchy}`);
      console.log(`  X: [${m.minX.toFixed(1)}, ${m.maxX.toFixed(1)}]`);
      console.log(`  Y: [${m.minY.toFixed(1)}, ${m.maxY.toFixed(1)}]`);
      console.log(`  Z: [${m.minZ.toFixed(1)}, ${m.maxZ.toFixed(1)}]`);
    }
  }

  await browser.close();
})();
