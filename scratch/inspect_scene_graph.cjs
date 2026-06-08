const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  console.log("Navigating to F1XXX page...");
  await page.goto('http://localhost:5173/f1xxx', { waitUntil: 'networkidle2' });
  
  console.log("Waiting 3 seconds for rendering...");
  await new Promise(r => setTimeout(r, 3000));
  
  console.log("Evaluating React Fiber to find THREE.Scene...");
  const data = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return { error: "Canvas not found" };
    
    // Find the react fiber key
    const fiberKey = Object.keys(canvas).find(k => k.startsWith('__reactFiber'));
    if (!fiberKey) return { error: "React fiber key not found" };
    
    const fiber = canvas[fiberKey];
    
    // Helper to search recursively in a fiber node for THREE.Scene
    let foundScene = null;
    const visited = new Set();
    
    function search(obj, depth = 0) {
      if (depth > 25 || !obj || typeof obj !== 'object' || visited.has(obj)) return;
      visited.add(obj);
      
      // Check if it looks like a THREE.Scene
      if (obj.isScene && obj.traverse) {
        foundScene = obj;
        return;
      }
      
      for (const key in obj) {
        try {
          const val = obj[key];
          if (val && typeof val === 'object') {
            search(val, depth + 1);
            if (foundScene) return;
          }
        } catch (e) {}
      }
    }
    
    search(fiber);
    if (!foundScene) {
      // Try searching return (parent) chain
      let curr = fiber;
      while (curr) {
        search(curr.stateNode, 0);
        if (foundScene) break;
        search(curr.memoizedState, 0);
        if (foundScene) break;
        search(curr.memoizedProps, 0);
        if (foundScene) break;
        curr = curr.return;
      }
    }
    
    if (!foundScene) return { error: "THREE.Scene not found in React Fiber tree" };
    
    // Traverse the scene to find handleGroup and pivotGroup
    let handleInfo = null;
    let pivotInfo = null;
    foundScene.traverse((obj) => {
      if (obj.name === 'handleGroup') {
        const worldPos = { x: 0, y: 0, z: 0 };
        const worldRot = { x: 0, y: 0, z: 0, w: 1 };
        
        // Use copy/set to get values without circular deps
        worldPos.x = obj.position.x;
        worldPos.y = obj.position.y;
        worldPos.z = obj.position.z;
        
        handleInfo = {
          name: obj.name,
          localPos: [obj.position.x, obj.position.y, obj.position.z],
          localRot: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
          scale: [obj.scale.x, obj.scale.y, obj.scale.z],
          visible: obj.visible,
          children: obj.children.map(c => ({ name: c.name, type: c.type, visible: c.visible }))
        };
        
        // Get world pos/rot if Three is imported globally
        if (typeof window.THREE !== 'undefined' || typeof THREE !== 'undefined') {
          const T = typeof window.THREE !== 'undefined' ? window.THREE : THREE;
          const wp = new T.Vector3();
          obj.getWorldPosition(wp);
          handleInfo.worldPos = [wp.x, wp.y, wp.z];
          
          const wq = new T.Quaternion();
          obj.getWorldQuaternion(wq);
          const we = new T.Euler().setFromQuaternion(wq);
          handleInfo.worldRot = [we.x, we.y, we.z];
        }
      }
      if (obj.name === 'pivotGroup') {
        pivotInfo = {
          name: obj.name,
          localPos: [obj.position.x, obj.position.y, obj.position.z]
        };
        if (typeof window.THREE !== 'undefined' || typeof THREE !== 'undefined') {
          const T = typeof window.THREE !== 'undefined' ? window.THREE : THREE;
          const wp = new T.Vector3();
          obj.getWorldPosition(wp);
          pivotInfo.worldPos = [wp.x, wp.y, wp.z];
        }
      }
    });
    
    return { handleInfo, pivotInfo };
  });
  
  console.log("Result:", JSON.stringify(data, null, 2));
  await browser.close();
})().catch(err => {
  console.error("Fatal error:", err);
});
