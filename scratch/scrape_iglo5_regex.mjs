import fs from 'fs';

(async () => {
  const res = await fetch('https://www.drutex.eu/en/products/iglo5-doors-pvc.html');
  const html = await res.text();
  
  // They usually have a huge JSON or HTML block for the color presenter
  // Look for data-img="/media/..."
  const regex = /data-name="([^"]+)"[^>]*data-code="([^"]+)"[^>]*data-img="([^"]+)"[^>]*data-bg="([^"]+)"/g;
  let match;
  const colors = [];
  while ((match = regex.exec(html)) !== null) {
    colors.push({
      name: match[1],
      code: match[2],
      img: match[3],
      bg: match[4]
    });
  }
  
  if (colors.length === 0) {
      console.log("Regex didn't match. Maybe attributes are in a different order.");
      // Let's try matching any color element
      const regex2 = /class="[^"]*animate-change-color-element[^"]*"([^>]+)>/g;
      let match2;
      while ((match2 = regex2.exec(html)) !== null) {
          console.log("Found element attrs:", match2[1]);
      }
  } else {
      console.log(JSON.stringify(colors, null, 2));
  }
})();
