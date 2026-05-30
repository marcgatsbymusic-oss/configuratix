import fs from 'fs';

const ig5F100 = JSON.parse(fs.readFileSync("src/data/profiles/IG5_F100.json", 'utf-8'));
const sshExtOrig = ig5F100.profiles.SSH_EXT.vertices;

function smoothFacetedCorners(vertices) {
  if (vertices.length < 3) return vertices;
  
  const result = [];
  const n = vertices.length;
  
  for (let i = 0; i < n; i++) {
    const prev = vertices[(i - 1 + n) % n];
    const curr = vertices[i];
    const next = vertices[(i + 1) % n];
    
    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const len1 = Math.hypot(dx1, dy1);
    
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;
    const len2 = Math.hypot(dx2, dy2);
    
    let isFaceted = false;
    
    if (len1 > 0.001 && len2 > 0.001) {
      const dot = dx1 * dx2 + dy1 * dy2;
      const cosTheta = dot / (len1 * len2);
      const angleRad = Math.acos(Math.max(-1, Math.min(1, cosTheta)));
      const angleDeg = angleRad * 180 / Math.PI;
      
      // Detect faceted curve corner
      if (angleDeg >= 10 && angleDeg <= 80) {
        isFaceted = true;
      }
    }
    
    if (isFaceted) {
      const m1x = (prev.x + curr.x) / 2;
      const m1y = (prev.y + curr.y) / 2;
      const m2x = (curr.x + next.x) / 2;
      const m2y = (curr.y + next.y) / 2;
      
      const steps = 8;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const mt = 1 - t;
        const px = mt * mt * m1x + 2 * mt * t * curr.x + t * t * m2x;
        const py = mt * mt * m1y + 2 * mt * t * curr.y + t * t * m2y;
        result.push({ x: px, y: py });
      }
    } else {
      result.push({ x: curr.x, y: curr.y });
    }
  }
  
  const unique = [];
  for (let i = 0; i < result.length; i++) {
    const p = result[i];
    const nextP = result[(i + 1) % result.length];
    if (Math.hypot(p.x - nextP.x, p.y - nextP.y) > 0.001) {
      unique.push(p);
    }
  }
  return unique;
}

const smoothed = smoothFacetedCorners(sshExtOrig);
console.log(`Original vertices: ${sshExtOrig.length}`);
console.log(`Smoothed vertices: ${smoothed.length}`);
