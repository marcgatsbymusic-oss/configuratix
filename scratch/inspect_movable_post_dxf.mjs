import fs from 'fs';

const dxfPath = 'C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\Monday 8th experiment\\IGL5_Movablepost_Fusion_processed.dxf';

try {
  const text = fs.readFileSync(dxfPath, 'utf-8');
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  function peek(i) { return (lines[i] || '').trim(); }

  // Find ENTITIES section
  let entStart = -1;
  for (let i = 0; i < lines.length - 1; i++) {
    if (peek(i) === '2' && peek(i + 1) === 'ENTITIES') { entStart = i + 2; break; }
  }
  if (entStart < 0) throw new Error('No ENTITIES section');

  // Collect layer info
  const layers = {};
  let i = entStart;
  while (i < lines.length) {
    if (peek(i) === '0') {
      const type = peek(i + 1);
      if (type === 'ENDSEC' || type === 'EOF') break;
      // Read ahead to find layer (code 8)
      let j = i + 2;
      let layer = '(none)';
      while (j < lines.length && peek(j) !== '0') {
        if (peek(j) === '8') { layer = peek(j + 1); }
        j += 2;
      }
      if (!layers[layer]) layers[layer] = { count: 0, types: new Set() };
      layers[layer].count++;
      layers[layer].types.add(type);
      i = j;
    } else {
      i += 2;
    }
  }

  console.log('=== Movable Post DXF Layers ===');
  Object.entries(layers).forEach(([name, info]) => {
    console.log(`  ${name.padEnd(20)} count=${info.count}  types=${[...info.types].join(',')}`);
  });

} catch (err) {
  console.error('ERROR:', err.message);
}
