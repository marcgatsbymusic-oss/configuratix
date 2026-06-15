import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\Monday 8th experiment\\Roller_Blind_225.dxf";
const outPath = "c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\scratch\\roller_blind.svg";

try {
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  // We want to collect all resolved lines/curves to draw
  const paths = [];

  function addPoint(x, y) {
    if (typeof x === 'number' && !isNaN(x)) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
    }
    if (typeof y === 'number' && !isNaN(y)) {
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }

  function transformPoint(p, pos, scale, rotDeg) {
    let x = p.x;
    let y = p.y;
    // Scale
    const sx = scale?.x ?? 1;
    const sy = scale?.y ?? 1;
    x *= sx;
    y *= sy;
    // Rotate
    if (rotDeg) {
      const rad = (rotDeg * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const rx = x * cos - y * sin;
      const ry = x * sin + y * cos;
      x = rx;
      y = ry;
    }
    // Translate
    x += pos.x;
    y += pos.y;
    return { x, y };
  }

  function processEntities(entities, pos = { x: 0, y: 0 }, scale = { x: 1, y: 1 }, rotDeg = 0, styleInfo = {}) {
    entities.forEach(ent => {
      if (ent.type === 'INSERT') {
        const block = dxf.blocks[ent.name];
        if (block && block.entities) {
          const insPos = {
            x: (ent.position?.x ?? 0) * (scale.x ?? 1) + pos.x,
            y: (ent.position?.y ?? 0) * (scale.y ?? 1) + pos.y
          };
          const insScale = {
            x: (ent.scale?.x ?? 1) * (scale.x ?? 1),
            y: (ent.scale?.y ?? 1) * (scale.y ?? 1)
          };
          const insRot = (ent.rotation ?? 0) + rotDeg;
          processEntities(block.entities, insPos, insScale, insRot, { blockName: ent.name, ...styleInfo });
        }
      } else if (ent.type === 'LINE') {
        const p1 = transformPoint({ x: ent.x1, y: ent.y1 }, pos, scale, rotDeg);
        const p2 = transformPoint({ x: ent.x2, y: ent.y2 }, pos, scale, rotDeg);
        addPoint(p1.x, p1.y);
        addPoint(p2.x, p2.y);
        paths.push({
          type: 'line',
          p1,
          p2,
          layer: ent.layer,
          blockName: styleInfo.blockName || 'none'
        });
      } else if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
        const pts = ent.vertices.map(v => {
          const pt = transformPoint({ x: v.x, y: v.y }, pos, scale, rotDeg);
          addPoint(pt.x, pt.y);
          return pt;
        });
        paths.push({
          type: 'polyline',
          pts,
          closed: ent.shape || (ent.flag & 1) !== 0,
          layer: ent.layer,
          blockName: styleInfo.blockName || 'none'
        });
      } else if (ent.type === 'ARC') {
        // approximate arc
        const cx = ent.center?.x ?? ent.cx ?? 0;
        const cy = ent.center?.y ?? ent.cy ?? 0;
        const r = ent.radius ?? ent.r ?? 0;
        const startDeg = ent.startAngle ?? 0;
        const endDeg = ent.endAngle ?? 360;

        let s = (startDeg % 360 + 360) % 360;
        let e = (endDeg   % 360 + 360) % 360;
        if (e <= s) e += 360;
        const segments = 16;
        const pts = [];
        for (let i = 0; i <= segments; i++) {
          const a = ((s + (e - s) * (i / segments)) * Math.PI) / 180;
          const localPt = { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
          const pt = transformPoint(localPt, pos, scale, rotDeg);
          addPoint(pt.x, pt.y);
          pts.push(pt);
        }
        paths.push({
          type: 'polyline',
          pts,
          closed: false,
          layer: ent.layer,
          blockName: styleInfo.blockName || 'none'
        });
      } else if (ent.type === 'CIRCLE') {
        const cx = ent.center?.x ?? ent.cx ?? 0;
        const cy = ent.center?.y ?? ent.cy ?? 0;
        const r = ent.radius ?? ent.r ?? 0;
        const segments = 32;
        const pts = [];
        for (let i = 0; i <= segments; i++) {
          const a = (i / segments) * Math.PI * 2;
          const localPt = { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
          const pt = transformPoint(localPt, pos, scale, rotDeg);
          addPoint(pt.x, pt.y);
          pts.push(pt);
        }
        paths.push({
          type: 'polyline',
          pts,
          closed: true,
          layer: ent.layer,
          blockName: styleInfo.blockName || 'none'
        });
      }
    });
  }

  processEntities(dxf.entities);

  console.log(`Global Bounds: X=[${minX.toFixed(2)}, ${maxX.toFixed(2)}], Y=[${minY.toFixed(2)}, ${maxY.toFixed(2)}]`);

  // Render to SVG
  const width = maxX - minX;
  const height = maxY - minY;
  const padding = 10;

  // Colors based on blockName/layer to differentiate
  const colors = {
    'póro 37mm': '#f43f5e',     // rose-500
    'listwa końcowa': '#0ea5e9', // sky-500
    'R0027-A': '#eab308',        // yellow-500
    'R0024-A': '#22c55e',        // green-500
    'R0022-A': '#a855f7',        // purple-500
    'R0021-A': '#ec4899',        // pink-500
    'R0023': '#3b82f6',          // blue-500
    'R0029-A': '#f97316',        // orange-500
    'none': '#94a3b8'            // slate-400
  };

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX - padding} ${minY - padding} ${width + 2 * padding} ${height + 2 * padding}" width="${width + 2 * padding}" height="${height + 2 * padding}" style="background-color: #1e1e2e; display: block;">\n`;

  paths.forEach(p => {
    const stroke = colors[p.blockName] || colors[p.layer] || '#ffffff';
    if (p.type === 'line') {
      svgContent += `  <line x1="${p.p1.x}" y1="${p.p1.y}" x2="${p.p2.x}" y2="${p.p2.y}" stroke="${stroke}" stroke-width="0.5" />\n`;
    } else if (p.type === 'polyline') {
      const pointsStr = p.pts.map(pt => `${pt.x},${pt.y}`).join(' ');
      const fill = 'none';
      svgContent += `  <polyline points="${pointsStr}" fill="${fill}" stroke="${stroke}" stroke-width="0.5" />\n`;
    }
  });

  svgContent += `</svg>\n`;

  fs.writeFileSync(outPath, svgContent);
  console.log(`Rendered SVG written to: ${outPath}`);

} catch (err) {
  console.error(err);
}
