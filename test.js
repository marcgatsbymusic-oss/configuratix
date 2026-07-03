
const fs = require('fs');
const z02 = JSON.parse(fs.readFileSync('src/data/profiles/IGLO5/zlozenie_02.json'));
const z30 = JSON.parse(fs.readFileSync('src/data/profiles/IGLO5/zlozenie_30.json'));
const z07 = JSON.parse(fs.readFileSync('src/data/profiles/IGLO5/zlozenie_07.json'));

const SEAM_TOL = 0.75;
function loopEndpointsCollinear(pts) {
  if (!pts || pts.length < 2) return false;
  const a = pts[0], b = pts[pts.length - 1];
  return Math.abs(a.x - b.x) < SEAM_TOL || Math.abs(a.y - b.y) < SEAM_TOL;
}

function assertProfile(name, contour) {
  const n = contour.pointCount ?? (contour.points?.length ?? 0);
  const STRUCTURAL = /^(FRM|SSH|POST)_(EXT|INT)$/.test(name);
  if (STRUCTURAL && n < 8) throw new Error('[F252] ' + name + ': ' + n + ' pts. Flat-slab bug.');
  if (STRUCTURAL && !contour.verified && !loopEndpointsCollinear(contour.points))
    throw new Error('[F252] ' + name + ': unverified AND non-collinear endpoints.');
}

function check(ds) {
  for (const layer in ds.layers) {
    if (ds.layers[layer].contours) {
      for (const c of ds.layers[layer].contours) {
        assertProfile(layer, c);
      }
    }
  }
}
try {
  check(z02); check(z30); check(z07);
  console.log('OK');
} catch (e) {
  console.error(e.message);
}

