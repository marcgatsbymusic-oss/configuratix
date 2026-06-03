import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\Iglo Edge Slide\\Profile 1 Edge Slide top and bottom movable door for Three JS.dxf";
try {
    const fileText = fs.readFileSync(dxfPath, 'utf-8');
    const parser = new DxfParser();
    const dxf = parser.parseSync(fileText);

    function transformPoint(pt, tx) {
        let xs = pt.x * tx.scaleX;
        let ys = pt.y * tx.scaleY;
        let xr = xs * Math.cos(tx.rotation) - ys * Math.sin(tx.rotation);
        let yr = xs * Math.sin(tx.rotation) + ys * Math.cos(tx.rotation);
        return { x: xr + tx.x, y: yr + tx.y };
    }

    const layerBounds = {};

    function processEntities(entities, tx) {
        entities.forEach(ent => {
            if (ent.type === 'INSERT') {
                const block = dxf.blocks[ent.name];
                if (block && block.entities) {
                    const localRot = (ent.rotation || 0) * Math.PI / 180;
                    const localScaleX = ent.scaleFactorX ?? 1;
                    const localScaleY = ent.scaleFactorY ?? 1;
                    const posTransformed = transformPoint({ x: ent.position.x || 0, y: ent.position.y || 0 }, tx);
                    const nextTx = {
                        x: posTransformed.x,
                        y: posTransformed.y,
                        rotation: tx.rotation + localRot,
                        scaleX: tx.scaleX * localScaleX,
                        scaleY: tx.scaleY * localScaleY
                    };
                    processEntities(block.entities, nextTx);
                }
            } else {
                const layer = ent.layer;
                if (!layerBounds[layer]) {
                    layerBounds[layer] = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, count: 0 };
                }
                layerBounds[layer].count++;
                
                let pts = [];
                if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
                    if (ent.vertices) pts = ent.vertices.map(v => transformPoint(v, tx));
                } else if (ent.type === 'LINE') {
                    if (ent.vertices) pts = ent.vertices.map(v => transformPoint(v, tx));
                } else if (ent.type === 'ARC') {
                    // Just transform center
                    if (ent.center) pts = [transformPoint(ent.center, tx)];
                }

                pts.forEach(p => {
                    if (p.x < layerBounds[layer].minX) layerBounds[layer].minX = p.x;
                    if (p.x > layerBounds[layer].maxX) layerBounds[layer].maxX = p.x;
                    if (p.y < layerBounds[layer].minY) layerBounds[layer].minY = p.y;
                    if (p.y > layerBounds[layer].maxY) layerBounds[layer].maxY = p.y;
                });
            }
        });
    }

    processEntities(dxf.entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });

    console.log("Layer bounds in world coordinates:");
    Object.entries(layerBounds).forEach(([layer, b]) => {
        console.log(`- Layer: ${layer}`);
        console.log(`  Count: ${b.count}`);
        console.log(`  X: ${b.minX.toFixed(4)} -> ${b.maxX.toFixed(4)} (w: ${(b.maxX - b.minX).toFixed(4)})`);
        console.log(`  Y: ${b.minY.toFixed(4)} -> ${b.maxY.toFixed(4)} (h: ${(b.maxY - b.minY).toFixed(4)})`);
    });
} catch (err) {
    console.error(err);
}
