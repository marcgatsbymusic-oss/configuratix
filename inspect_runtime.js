import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  console.log('Navigating to http://localhost:5173/f202l...');
  try {
    await page.goto('http://localhost:5173/f202l', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('Waiting 5 seconds for 3D model to render and hook to register...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const result = await page.evaluate(() => {
      const group = window.assemblyGroup;
      if (!group) return { error: 'window.assemblyGroup is not defined!' };
      
      const parts = [];
      group.updateMatrixWorld(true);
      
      group.traverse((child) => {
        if (child.isMesh && child.geometry) {
          // Find path or hierarchy name
          const names = [];
          let p = child;
          while (p && p !== group) {
            names.unshift(p.name || p.type);
            p = p.parent;
          }
          const fullName = names.join(' -> ');
          
          // Calculate world bounding box
          child.geometry.computeBoundingBox();
          const box = child.geometry.boundingBox.clone();
          box.applyMatrix4(child.matrixWorld);
          
          parts.push({
            name: fullName,
            layerName: child.geometry.userData?.layerName || child.name,
            minX: box.min.x * 1000, // convert to mm
            maxX: box.max.x * 1000,
            minY: box.min.y * 1000,
            maxY: box.max.y * 1000,
            minZ: box.min.z * 1000,
            maxZ: box.max.z * 1000,
          });
        }
      });
      return { parts };
    });
    
    if (result.error) {
      console.error(result.error);
    } else {
      console.log('\n--- Runtime Mesh World Bounds (in mm) ---');
      for (const p of result.parts) {
        console.log(`Mesh: ${p.name}`);
        console.log(`  X: [${p.minX.toFixed(2)}, ${p.maxX.toFixed(2)}]`);
        console.log(`  Y: [${p.minY.toFixed(2)}, ${p.maxY.toFixed(2)}]`);
        console.log(`  Z: [${p.minZ.toFixed(2)}, ${p.maxZ.toFixed(2)}]`);
      }
    }
  } catch (err) {
    console.error('Error running inspection:', err);
  } finally {
    await browser.close();
  }
})();
