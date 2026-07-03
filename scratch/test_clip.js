function clipPolygonX(points, splitX, keepLeft) {
  const result = [];
  
  function inside(p) {
    return keepLeft ? p.x <= splitX + 0.0001 : p.x >= splitX - 0.0001;
  }
  
  function intersect(p1, p2) {
    // line equation: x = splitX
    // line segment from p1 to p2
    // x(t) = p1.x + t * (p2.x - p1.x) = splitX
    // t = (splitX - p1.x) / (p2.x - p1.x)
    // y(t) = p1.y + t * (p2.y - p1.y)
    const t = (splitX - p1.x) / (p2.x - p1.x);
    return { x: splitX, y: p1.y + t * (p2.y - p1.y) };
  }

  for (let i = 0; i < points.length; i++) {
    const cur = points[i];
    const prev = points[i === 0 ? points.length - 1 : i - 1];
    
    const curIn = inside(cur);
    const prevIn = inside(prev);
    
    if (curIn !== prevIn) {
      result.push(intersect(prev, cur));
    }
    if (curIn) {
      result.push(cur);
    }
  }
  
  return result;
}

const pts = [
  {x: 0, y: 0},
  {x: 100, y: 0},
  {x: 100, y: 100},
  {x: 0, y: 100}
];

console.log("Left half:", clipPolygonX(pts, 50, true));
console.log("Right half:", clipPolygonX(pts, 50, false));
