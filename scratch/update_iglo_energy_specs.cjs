const fs = require('fs');
let txt = fs.readFileSync('src/data/productDetails.ts', 'utf8');

const targetStart = txt.indexOf('export const IGLO_ENERGY_DETAIL: ProductDetailData = {');
if (targetStart > -1) {
  const targetEnd = txt.indexOf('};', targetStart) + 2;
  let block = txt.substring(targetStart, targetEnd);
  
  const oldSpecs = `  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],`;
  
  const newSpecs = `  keySpecs: [
    { label: 'sound', value: 'dB = 37-46' },
    { label: 'gaskets', value: '3' },
    { label: 'thermal', value: 'Uw = 0.71 W/(m²K)*' },
    { label: 'chambers', value: '7' },
    { label: 'depth', value: '82 mm' },
    { label: 'class', value: 'A' }
  ],`;
  
  if (block.includes(oldSpecs)) {
    block = block.replace(oldSpecs, newSpecs);
    txt = txt.substring(0, targetStart) + block + txt.substring(targetEnd);
    fs.writeFileSync('src/data/productDetails.ts', txt);
    console.log('Successfully updated keySpecs for IGLO Energy.');
  } else {
    console.log('Could not find oldSpecs inside IGLO_ENERGY_DETAIL');
  }
} else {
  console.log('Could not find IGLO_ENERGY_DETAIL');
}
