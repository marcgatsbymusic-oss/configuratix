const fs = require('fs');

let pd = fs.readFileSync('src/data/productDetails.ts', 'utf8');

// The replacement was looking for `  disableHeroFilter: false,` but maybe it wasn't exact for Alucover?
// Actually I only want to add `features` to Alucover which is at the end of the file.

const findStr1 = "  disableHeroFilter: false,\n  standardEquipment: [";
const replaceStr1 = "  disableHeroFilter: false,\n  features: [{title: 'aluCoverTitle', description: 'aluCoverDesc', image: '/assets/features/alu-cover-feature.jpg'}],\n  standardEquipment: [";

const findStr2 = "  disableHeroFilter: false,\r\n  standardEquipment: [";
const replaceStr2 = "  disableHeroFilter: false,\r\n  features: [{title: 'aluCoverTitle', description: 'aluCoverDesc', image: '/assets/features/alu-cover-feature.jpg'}],\r\n  standardEquipment: [";

// I only want to replace the LAST occurrence (which is Alucover)
const lastIdx = pd.lastIndexOf('  disableHeroFilter: false,');
if (lastIdx > -1) {
  const before = pd.substring(0, lastIdx);
  const after = pd.substring(lastIdx);
  
  let newAfter = after.replace("  disableHeroFilter: false,\n  standardEquipment: [", replaceStr1);
  if (newAfter === after) {
    newAfter = after.replace("  disableHeroFilter: false,\r\n  standardEquipment: [", replaceStr2);
  }
  
  fs.writeFileSync('src/data/productDetails.ts', before + newAfter);
  console.log('Fixed features array for Alucover!');
} else {
  console.log('Could not find disableHeroFilter in Alucover');
}
