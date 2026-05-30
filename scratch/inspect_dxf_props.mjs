import fs from 'fs';

const inFile = 'C:/Users/Shadow/Cloud-Drive/Web dev Drutex Product Content/CAD Files Drutex/DWG to DXF conversion tests/testing new layers.dxf';
const text = fs.readFileSync(inFile, 'utf8');
const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

function peek(i) { return (lines[i] || '').trim(); }
function seekSection(name, start = 0) {
  for (let i = start; i < lines.length - 1; i++) {
    if (peek(i) === '2' && peek(i + 1) === name) return i + 2;
  }
  return -1;
}

const entities = [];
const entStart = seekSection('ENTITIES');
let i = entStart;
while (i < lines.length) {
  if (peek(i) === '0') {
    const type = peek(i + 1);
    if (type === 'ENDSEC' || type === 'EOF') break;
    
    const ent = { type, props: {} };
    i += 2;
    while (i < lines.length) {
      const code = peek(i);
      const val = peek(i + 1);
      if (code === '0') break;
      if (code === '8') ent.layer = val;
      if (!ent.props[code]) ent.props[code] = [];
      ent.props[code].push(val);
      i += 2;
    }
    if (ent.layer === 'FRM_EXT' || ent.layer === 'FRM_INT') {
        entities.push(ent);
    }
  } else {
    i += 2;
  }
}

console.log(`Found ${entities.length} entities in FRM_EXT / FRM_INT`);
const typeCount = {};
entities.forEach(e => {
    typeCount[e.type] = (typeCount[e.type] || 0) + 1;
});
console.log('Types:', typeCount);

// Let's see if there's a difference in properties (like color code '62' or '370' lineweight)
const propSummary = {};
entities.forEach(e => {
    const props = Object.keys(e.props).sort().join(',');
    propSummary[props] = (propSummary[props] || 0) + 1;
    // Check color specifically
    if (e.props['62']) console.log(`Entity ${e.type} has color ${e.props['62']}`);
});
console.log('Property signatures:', propSummary);
