import fs from 'fs';

(async () => {
  const res = await fetch('https://www.drutex.eu/en/products/iglo5-doors-pvc.html');
  const html = await res.text();
  
  // just search for any base64 string that looks like an image path
  const matches = html.match(/data-[a-z]+="\/media\/webp[^"]+"/g);
  if (matches) {
    const firstFew = matches.slice(0, 10);
    console.log(firstFew);
  } else {
    console.log("No data attributes with /media/webp found!");
  }
})();
