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
        const res = { x: xr + tx.x, y: yr + tx.y };
        if (isNaN(res.x) || isNaN(res.y)) {
            console.log("NaN in transformPoint!", pt, tx);
        }
        return res;
    }

    const layerSegments = {};
    const TARGET_LAYERS = ['GLS_EXT', 'BZD', 'DOOR_FRM_EXT'];
    TARGET_LAYERS.forEach(l => { layerSegments[l] = []; });

    function processEntities(entities, tx) {
        entities.forEach(ent => {
            if (ent.type === 'INSERT') {
                const block = dxf.blocks[ent.name];
                if (block && block.entities) {
                    const localRot = (ent.rotation || 0) * Math.PI / 180;
                    const localScaleX = (ent.xScale === undefined || ent.xScale === 0) ? 1 : ent.xScale;
                    const localScaleY = (ent.yScale === undefined || ent.yScale === 0) ? 1 : ent.yScale;
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
                const layerUpper = ent.layer?.toUpperCase();
                const matchedLayer = TARGET_LAYERS.find(tl => tl.toUpperCase() === layerUpper);
                if (!matchedLayer) return;

                if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
                    const localPts = [];
                    const verts = ent.vertices;
                    if (!verts || verts.length === 0) return;
                    const isClosed = (ent.shape || (ent.flag & 1) !== 0);

                    for (let i = 0; i < verts.length; i++) {
                        const v = verts[i];
                        localPts.push({ x: v.x, y: v.y });
                    }
                    const worldPts = localPts.map(pt => transformPoint(pt, tx));
                    for (let i = 0; i < worldPts.length - 1; i++) {
                        layerSegments[matchedLayer].push({ start: worldPts[i], end: worldPts[i+1], pts: [worldPts[i], worldPts[i+1]] });
                    }
                } else if (ent.type === 'LINE') {
                    if (ent.vertices && ent.vertices.length >= 2) {
                        const s = transformPoint(ent.vertices[0], tx);
                        const e = transformPoint(ent.vertices[1], tx);
                        layerSegments[matchedLayer].push({ start: s, end: e, pts: [s, e] });
                    }
                }
            }
        });
    }

    processEntities(dxf.entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });

    // Test a specific layer
    const layer = 'GLS_EXT';
    console.log(`Checking layer ${layer}... raw segments count: ${layerSegments[layer].length}`);
    layerSegments[layer].forEach((seg, i) => {
        if (isNaN(seg.start.x) || isNaN(seg.start.y) || isNaN(seg.end.x) || isNaN(seg.end.y)) {
            console.log(`Segment ${i} has NaNs:`, seg);
        }
    });

    // Check if stitch introduces NaN
    const unused = [...layerSegments[layer]];
    console.log("Checking stitch step...");
    if (unused.length > 0) {
        let seg = unused[0];
        console.log("Initial segment:", seg);
    }
} catch (err) {
    console.error(err);
}
