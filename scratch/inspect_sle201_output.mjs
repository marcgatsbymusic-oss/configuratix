import fs from 'fs';

const jsonPath = 'src/data/profiles/IgloEdge/SLE201.json';
try {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log("Meta:", data.meta);
    console.log("Layers detail:");
    Object.entries(data.layers).forEach(([layer, lData]) => {
        console.log(`- Layer: ${layer}, count: ${lData.contours.length}`);
        const sample = lData.contours[0];
        if (sample) {
            console.log(`  Sample contour point count: ${sample.pointCount}`);
            console.log(`  Sample points (first 5):`, sample.points.slice(0, 5));
        }
    });
} catch (e) {
    console.error(e);
}
