import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_Movable_post_section_cleaned.dxf";
const outPath = "C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\cf59b1ee-2da4-466c-a686-9bc791b82a60\\IGE_Movable_post_section_cleaned.svg";

try {
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
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

  function transformPoint(pt, tx) {
    const localRot = (tx.rotation || 0) * Math.PI / 180;
    const scaleX = tx.scaleX === undefined ? 1 : tx.scaleX;
    const scaleY = tx.scaleY === undefined ? 1 : tx.scaleY;
    
    let xs = pt.x * scaleX;
    let ys = pt.y * scaleY;
    let xr = xs * Math.cos(localRot) - ys * Math.sin(localRot);
    let yr = xs * Math.sin(localRot) + ys * Math.cos(localRot);
    return { x: xr + tx.x, y: yr + tx.y };
  }

  function collectEntities(entities, tx) {
    entities.forEach(ent => {
      if (ent.type === 'INSERT') {
        const block = dxf.blocks[ent.name];
        if (block && block.entities) {
          const localRot = ent.rotation || 0;
          const localScaleX = (ent.xScale === undefined || ent.xScale === 0) ? 1 : ent.xScale;
          const localScaleY = (ent.yScale === undefined || ent.yScale === 0) ? 1 : ent.yScale;
          const posT = transformPoint({ x: ent.position.x || 0, y: ent.position.y || 0 }, tx);
          
          const nextTx = {
            x: posT.x,
            y: posT.y,
            rotation: tx.rotation + localRot,
            scaleX: tx.scaleX * localScaleX,
            scaleY: tx.scaleY * localScaleY
          };
          collectEntities(block.entities, nextTx);
        }
      } else if (ent.type === 'LINE') {
        const p1 = transformPoint(ent.vertices[0], tx);
        const p2 = transformPoint(ent.vertices[1], tx);
        addPoint(p1.x, p1.y);
        addPoint(p2.x, p2.y);
        paths.push({ type: 'line', p1, p2, layer: ent.layer });
      } else if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
        const pts = ent.vertices.map(v => {
          const pt = transformPoint(v, tx);
          addPoint(pt.x, pt.y);
          return pt;
        });
        paths.push({
          type: 'polyline',
          pts,
          closed: ent.shape || (ent.flag & 1) !== 0,
          layer: ent.layer
        });
      } else if (ent.type === 'ARC') {
        const cx = ent.center?.x ?? 0;
        const cy = ent.center?.y ?? 0;
        const r = ent.radius ?? 0;
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
          const pt = transformPoint(localPt, tx);
          addPoint(pt.x, pt.y);
          pts.push(pt);
        }
        paths.push({ type: 'polyline', pts, closed: false, layer: ent.layer });
      } else if (ent.type === 'CIRCLE') {
        const cx = ent.center?.x ?? 0;
        const cy = ent.center?.y ?? 0;
        const r = ent.radius ?? 0;
        const segments = 32;
        const pts = [];
        for (let i = 0; i <= segments; i++) {
          const a = (i / segments) * Math.PI * 2;
          const localPt = { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
          const pt = transformPoint(localPt, tx);
          addPoint(pt.x, pt.y);
          pts.push(pt);
        }
        paths.push({ type: 'polyline', pts, closed: true, layer: ent.layer });
      }
    });
  }

  collectEntities(dxf.entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });

  console.log(`Corrected Global Bounds: X=[${minX.toFixed(2)}, ${maxX.toFixed(2)}], Y=[${minY.toFixed(2)}, ${maxY.toFixed(2)}]`);

  const width = maxX - minX;
  const height = maxY - minY;
  const padding = 10;

  const colors = {
    'SSH': '#e05a47', // Red-orange
    'MOVABLE_POST': '#c59b27', // Gold/yellow
    'GSK_PST_EXT': '#ff007f', // Deep pink
    'GSK_MD': '#9b30ff', // Purple
    'BZD': '#e0a050', // Brown
    'GSK_BZD': '#00ffff', // Cyan
    'SPACER': '#888888', // Gray
    'GLS_EXT': '#3b82f6', // Blue
    'GLS_MD': '#3b82f6', // Blue
    'GLS_INT': '#3b82f6', // Blue
    'Profil stal': '#b8b8c5', // Steel
    'Mostek pvc': '#a855f7', // Light purple
    'Inne': '#94a3b8' // Slate
  };

  function transformSVGPoint(pt) {
    return {
      x: pt.x,
      y: maxY - (pt.y - minY)
    };
  }

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX - padding} ${minY - padding} ${width + 2 * padding} ${height + 2 * padding}" width="${width + 2 * padding}" height="${height + 2 * padding}" style="background-color: #1e1e2e; display: block;">\n`;

  paths.forEach(p => {
    const stroke = colors[p.layer] || '#ffffff';
    if (p.type === 'line') {
      const p1 = transformSVGPoint(p.p1);
      const p2 = transformSVGPoint(p.p2);
      svgContent += `  <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${stroke}" stroke-width="0.5" />\n`;
    } else if (p.type === 'polyline') {
      const pts = p.pts.map(transformSVGPoint);
      const pointsStr = pts.map(pt => `${pt.x},${pt.y}`).join(' ');
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
