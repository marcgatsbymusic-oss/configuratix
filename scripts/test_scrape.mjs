import fs from 'fs';

async function test() {
  const res = await fetch('https://www.drutex.eu/en/products/iglo-hs.html');
  const html = await res.text();
  fs.writeFileSync('temp_drutex.html', html);
  console.log("Written to temp_drutex.html");
}

test();
