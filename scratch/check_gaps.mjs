import fs from 'fs';

const files = [
  'src/data/profiles/IgloEdge/IGE_F104.json',
  'src/data/profiles/IgloEdge/IGE_MOVABLE_POST_LEFT_OPENING.json',
  'src/data/profiles/IgloEdge/SLE201.json',
  'src/data/profiles/IgloEdge/SLE201_DoorPost.json'
];

files.forEach(filePath => {
  console.log(`\nFile: ${filePath}`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const [layerName, layerData] of Object.entries(data.layers)) {
    if (layerName.includes('GSK') || layerName === 'GSK_BZD') {
      console.log(`  Layer: ${layerName}`);
      layerData.contours.forEach((c, idx) => {
        console.log(`    Contour ${idx}: pts=${c.points.length}, verified=${c.verified}, residualGap=${c.residualGap} mm`);
      });
    }
  }
});
