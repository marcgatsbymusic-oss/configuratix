import fs from 'fs';
import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg';

const f104Raw = JSON.parse(fs.readFileSync('src/data/profiles/IgloEdge/IGE_F104.json', 'utf8'));
const vertices = f104Raw.layers.SSH_EXT.contours[0].points;

const scale = 0.001;
const length = 1200 / 2 + 54; // 654 mm
const scaledLength = length * scale;
const scaleFactor = scale;

let minX =  Infinity, minY =  Infinity;
let maxX = -Infinity, maxY = -Infinity;
for (const v of vertices) {
  if (v.x < minX) minX = v.x;
  if (v.y < minY) minY = v.y;
  if (v.x > maxX) maxX = v.x;
  if (v.y > maxY) maxY = v.y;
}

const ox = minX;
const oy = minY;

const shape = new THREE.Shape();
shape.moveTo((vertices[0].x - ox) * scaleFactor, (vertices[0].y - oy) * scaleFactor);
for (let i = 1; i < vertices.length; i++) {
  shape.lineTo((vertices[i].x - ox) * scaleFactor, (vertices[i].y - oy) * scaleFactor);
}
shape.lineTo((vertices[0].x - ox) * scaleFactor, (vertices[0].y - oy) * scaleFactor);

const leftExtra = 200 * scaleFactor;
const rightExtra = 200 * scaleFactor;
const baseGeo = new THREE.ExtrudeGeometry(shape, { depth: scaledLength + leftExtra + rightExtra, bevelEnabled: false });
baseGeo.translate(0, 0, -leftExtra);

const widthX  = (maxX - minX) * scaleFactor;
const heightY = (maxY - minY) * scaleFactor;
const boxSize = Math.max(widthX, heightY, scaledLength) * 10;

const baseBrush = new Brush(baseGeo);
baseBrush.updateMatrixWorld();

const evaluator = new Evaluator();
const boxGeo    = new THREE.BoxGeometry(boxSize, boxSize, boxSize);

// Let's test leftSign = 1, rightSign = 1 (current default)
const runTest = (leftSign, rightSign) => {
  let result = baseBrush;

  // Left cut
  const leftBrush = new Brush(boxGeo);
  leftBrush.position.set(0, 0, 0);
  leftBrush.rotation.x = (Math.PI / 4) * leftSign;
  leftBrush.translateZ(-boxSize / 2);
  leftBrush.updateMatrixWorld();
  result = evaluator.evaluate(result, leftBrush, SUBTRACTION);

  // Right cut
  const rightBrush = new Brush(boxGeo);
  rightBrush.position.set(0, 0, scaledLength);
  rightBrush.rotation.x = (-Math.PI / 4) * rightSign;
  rightBrush.translateZ(boxSize / 2);
  rightBrush.updateMatrixWorld();
  result = evaluator.evaluate(result, rightBrush, SUBTRACTION);

  const geo = result.geometry;
  geo.computeBoundingBox();
  const box = geo.boundingBox;
  
  // Now let's sample points to see the length at different profile coordinates (y = 58 vs y = 114)
  const pos = geo.attributes.position;
  let minZ_at_y58 = Infinity, maxZ_at_y58 = -Infinity;
  let minZ_at_y114 = Infinity, maxZ_at_y114 = -Infinity;

  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i) / scale + minY;
    const pz = pos.getZ(i) / scale;

    if (Math.abs(py - 58) < 1) {
      if (pz < minZ_at_y58) minZ_at_y58 = pz;
      if (pz > maxZ_at_y58) maxZ_at_y58 = pz;
    }
    if (Math.abs(py - 114) < 1) {
      if (pz < minZ_at_y114) minZ_at_y114 = pz;
      if (pz > maxZ_at_y114) maxZ_at_y114 = pz;
    }
  }

  console.log(`Test with leftSign=${leftSign}, rightSign=${rightSign}:`);
  console.log(`  Overall Z bounds: [${(box.min.z/scale).toFixed(2)}, ${(box.max.z/scale).toFixed(2)}]`);
  console.log(`  At outer face (y=58): Z = [${minZ_at_y58.toFixed(2)}, ${maxZ_at_y58.toFixed(2)}]`);
  console.log(`  At inner face (y=114): Z = [${minZ_at_y114.toFixed(2)}, ${maxZ_at_y114.toFixed(2)}]`);
};

runTest(1, 1);
runTest(-1, 1);
runTest(1, -1);
runTest(-1, -1);
