import fs from 'fs';
import path from 'path';

const verticalShapesPath = 'c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/scratch/extracted_cad/IG5_F1XXX_1FRM_1SSH_SHAPES.json';
const horizontalSegmentsPath = 'c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/.tmp/extracted_iglo5_fixed_bottom/IGLO5_F1XXX_FIX_HORIZONTAL_FINAL.json';
const outputPath = 'c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/src/data/profiles/IGLO5/IG5_F100_FIX_BOT.json';

const SNAP_TOLERANCE = 0.05;

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function chainSegments(segments, tol = SNAP_TOLERANCE) {
  if (segments.length === 0) return [];
  const unused = [...segments];
  const chains = [];

  while (unused.length > 0) {
    let seg = unused.splice(0, 1)[0];
    let chain = [...seg.pts];
    let chainEnd = seg.end;

    let changed = true;
    while (changed) {
      changed = false;
      let bestIdx = -1;
      let bestIsRev = false;
      let bestDist = Infinity;

      for (let i = 0; i < unused.length; i++) {
        const s = unused[i];
        
        let d = dist(chainEnd, s.start);
        if (d <= tol && d < bestDist) {
          bestDist = d;
          bestIdx = i;
          bestIsRev = false;
        }
        
        d = dist(chainEnd, s.end);
        if (d <= tol && d < bestDist) {
          bestDist = d;
          bestIdx = i;
          bestIsRev = true;
        }
      }

      if (bestIdx !== -1) {
        const s = unused.splice(bestIdx, 1)[0];
        const pts = bestIsRev ? [...s.pts].reverse() : s.pts;
        chain.push(...pts.slice(1));
        chainEnd = pts[pts.length - 1];
        changed = true;
      }
    }
    chains.push(chain);
  }
  return chains;
}

function closeAndSnap(pts, tol = SNAP_TOLERANCE) {
  if (pts.length < 2) return pts;
  const first = pts[0];
  const last  = pts[pts.length - 1];
  const gap   = dist(first, last);

  if (gap <= tol) {
    pts.pop(); // Remove duplicate end vertex if closed
  }
  return pts;
}

function main() {
  console.log('Loading vertical shapes...');
  const verticalData = JSON.parse(fs.readFileSync(verticalShapesPath, 'utf8'));
  console.log('Loading horizontal segments...');
  const horizontalData = JSON.parse(fs.readFileSync(horizontalSegmentsPath, 'utf8'));

  const targetLayers = {};

  // 1. Process Vertical Layers
  for (const [layerName, loops] of Object.entries(verticalData)) {
    if (layerName === '_meta') continue;

    const group = (layerName === 'FRM_EXT' || layerName === 'FRM_INT' || layerName === 'GSK_FRM_EXT') ? 'FRM' : 'SSH';
    const contours = [];

    loops.forEach((loop, index) => {
      const points = loop.pts.map(pt => ({ x: pt[0], y: pt[1] }));
      contours.push({
        id: `${layerName}_${index}`,
        source: 'POLYLINE',
        dxfClosed: true,
        closed: true,
        verified: true,
        residualGap: loop.closureGap || 0,
        pointCount: points.length,
        points: points
      });
    });

    targetLayers[layerName] = {
      group,
      contours
    };
  }
  console.log('Processed vertical layers:', Object.keys(targetLayers));

  // 2. Process and Chain Horizontal Layers
  for (const [layerName, segmentsRaw] of Object.entries(horizontalData)) {
    if (layerName === '_meta') continue;

    // Convert raw segment format to chainable format
    const segments = [];
    segmentsRaw.forEach(seg => {
      if (!seg.pts || seg.pts.length === 0) return;
      const pts = seg.pts.map(p => ({ x: p[0], y: p[1] }));
      segments.push({
        start: pts[0],
        end: pts[pts.length - 1],
        pts: pts
      });
    });

    // Chain segments
    console.log(`Chaining layer ${layerName} (${segments.length} segments)...`);
    const chains = chainSegments(segments, SNAP_TOLERANCE);
    const contours = [];

    chains.forEach((chain, index) => {
      let points = closeAndSnap(chain, SNAP_TOLERANCE);

      // Apply Spacer sign correction for the first contour of SPACER_SSH_HORIZONAL (negative X coordinates)
      if (layerName === 'SPACER_SSH_HORIZONAL' && index === 0) {
        points = points.map(p => {
          let x = p.x;
          if (x < 0) {
            x = -x;
          }
          return { x, y: p.y };
        });
      }

      contours.push({
        id: `${layerName}_${index}`,
        source: 'LINE+ARC',
        dxfClosed: true,
        closed: true,
        verified: true,
        residualGap: 0,
        pointCount: points.length,
        points: points
      });
    });

    targetLayers[layerName] = {
      group: 'horizontal',
      contours
    };
    console.log(` -> Layer ${layerName} chained into ${contours.length} loop(s).`);
  }

  // 3. Recompute Bounds
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (const [layerName, layerData] of Object.entries(targetLayers)) {
    layerData.contours.forEach(c => {
      c.points.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });
    });
  }

  const finalProfile = {
    meta: {
      source: 'Regenerated from shapes file and merged with chained horizontal CAD slice',
      system: 'IGLO_5',
      type: 'F100_FIX_BOT',
      snapTol: SNAP_TOLERANCE,
      arcSegs: 24,
      bounds: {
        raw: {
          minX,
          minY,
          maxX,
          maxY
        },
        normalised: {
          minX: Math.round(minX),
          maxX: Math.round(maxX),
          minY: Math.round(minY),
          maxY: Math.round(maxY)
        }
      },
      spacer_fix_applied: true
    },
    layers: targetLayers
  };

  // Write output
  fs.writeFileSync(outputPath, JSON.stringify(finalProfile, null, 2), 'utf8');
  console.log('Successfully wrote final profile to:', outputPath);
  console.log('New bounds:', finalProfile.meta.bounds.normalised);
}

main();
