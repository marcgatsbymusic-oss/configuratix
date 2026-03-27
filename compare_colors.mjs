import fs from 'fs';

const existingStr = fs.readFileSync('./src/data/productDetails.ts', 'utf-8');
const regex = /{ id: '([^']+)', name: '([^']+)', image: '([^']+)'/g;
let match;
const existingColors = [];
while ((match = regex.exec(existingStr)) !== null) {
  existingColors.push({ id: match[1], name: match[2], image: match[3] });
}

const requestedColors = [
  { code: '0002', desc: 'Chocolate brown' },
  { code: '0003', desc: 'Dark - oak' },
  { code: '0004', desc: 'Mahogany' },
  { code: '0005', desc: 'Anthracite' },
  { code: '0006', desc: 'Golden oak' },
  { code: '0007', desc: 'Nut' },
  { code: '0008', desc: 'Macore' },
  { code: '0013', desc: 'CREAMY' },
  { code: '0014', desc: 'Gray' },
  { code: '0024', desc: 'Quartz grey' },
  { code: '0026', desc: 'Winchester XA' },
  { code: '0027', desc: 'Quartz grey (smooth)' },
  { code: '0030', desc: 'Light grey' },
  { code: '0031', desc: 'FX white' },
  { code: '0035', desc: 'Smooth anthracite' },
  { code: '0041', desc: 'Sheffield Oak Light (Whitened oak)' },
  { code: '0052', desc: 'Black ulti-matt' },
  { code: '0053', desc: 'Anthracite ulti-matt' },
  { code: '0054', desc: 'Turner oak' },
  { code: '0057', desc: 'Jet Black Mattex CC+' },
  { code: '0009', desc: 'Oregon' },
  { code: '0011', desc: 'Douglas' },
  { code: '0012', desc: 'Natural oak' },
  { code: '0015', desc: 'Palisander' },
  { code: '0016', desc: 'Brillant blue' },
  { code: '0019', desc: 'Dark - green' },
  { code: '0020', desc: 'Moss green' },
  { code: '0021', desc: 'Dark - red' },
  { code: '0025', desc: 'Steel blue' },
  { code: '0029', desc: 'Basalt grey' },
  { code: '0034', desc: 'Smooth basalt grey' },
  { code: '0038', desc: 'Concrete grey' },
  { code: '0046', desc: 'Crown Platinum' },
  { code: '0047', desc: 'Iron glimmer slate' },
  { code: '0048', desc: 'Slate grey smooth' },
  { code: '0058', desc: 'White Sand Ulti-Matt' },
  { code: '0059', desc: 'Graphite sandblasted matt' },
  { code: '0060', desc: 'Turner Oak Toffee' },
  { code: '0061', desc: 'Turner Oak Walnut' },
  { code: '0062', desc: 'Shine Deep Bronze Mattex' },
  { code: '0045', desc: 'Pyrite' },
];

const manualMap = {
  '0007': 'Walnut',
  '0031': 'White',
  '0047': 'Slate',
  '0046': 'Croviu Platynium',
  '0062': 'Deep Bronze',
  '0048': 'Slate Smooth',
  '0034': 'Basalt Grey Gadki',
  '0003': 'Dark Oak',
  '0011': 'Douglas Fir',
  // those that failed before:
  '0014': 'Grey',
  '0027': 'Grey Quartz Smooth',
  '0035': 'Anthracite Smooth',
  '0041': 'Bleached Oak',
  '0016': 'Brilliant Blue',
  '0058': 'White Sand Matt',
  '0045': 'Piryt',
  '0024': 'Grey Quartz',
};

const matched = [];
for (const req of requestedColors) {
  let found = existingColors.find(e => e.name.toLowerCase() === req.desc.toLowerCase());
  
  if (!found && manualMap[req.code]) {
      found = existingColors.find(e => e.name === manualMap[req.code]);
  }
  
  if (!found) {
    const simpleReq = req.desc.toLowerCase().replace(/[^a-z0-9]/g, '');
    found = existingColors.find(e => {
        const simpleExt = e.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return simpleExt.includes(simpleReq) || simpleReq.includes(simpleExt);
    });
  }

  if (found) {
    matched.push({ req, ext: found });
  } else {
    console.log(`STILL NO MATCH for: ${req.code} - ${req.desc}`);
  }
}

const exteriorLines = matched.map(m => `('${m.req.code}', '${m.req.desc.replace(/'/g, "''")}', '${m.ext.image}')`);
fs.writeFileSync('/tmp/exterior.sql', exteriorLines.join(',\n'), 'utf-8');

const interiorLines = matched.map(m => `('${m.req.code}', '${m.req.desc.replace(/'/g, "''")}', '${m.ext.image}')`);
fs.writeFileSync('/tmp/interior.sql', interiorLines.join(',\n'), 'utf-8');

console.log(`Successfully mapped ${matched.length} out of ${requestedColors.length} colors.`);
