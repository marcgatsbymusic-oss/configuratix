import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg';

interface FrameSegmentProps {
  length: number;
  vertices: {x: number, y: number}[];
  material?: THREE.Material;
  position?: [number, number, number];
  rotation?: [number, number, number];
  invertCuts?: boolean;
  origin?: {x: number, y: number} | null;
}

export const FrameSegment: React.FC<FrameSegmentProps> = ({ 
  length, 
  vertices, 
  material, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  invertCuts = false,
  origin = null
}) => {
  const geometry = useMemo(() => {
    if (!vertices || vertices.length === 0) return new THREE.BufferGeometry();

    // 1. Normalize vertices to local origin (minX, minY) or use provided origin
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const v of vertices) {
      if (v.x < minX) minX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.x > maxX) maxX = v.x;
      if (v.y > maxY) maxY = v.y;
    }
    
    const ox = origin ? origin.x : minX;
    const oy = origin ? origin.y : minY;
    
    const shape = new THREE.Shape();
    shape.moveTo(vertices[0].x - ox, vertices[0].y - oy);
    for (let i = 1; i < vertices.length; i++) {
      shape.lineTo(vertices[i].x - ox, vertices[i].y - oy);
    }
    shape.lineTo(vertices[0].x - ox, vertices[0].y - oy);

    // 2. Extrude Geometry
    const extrudeSettings = {
      depth: length,
      bevelEnabled: false,
    };
    const baseGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    const widthX = maxX - minX;
    const heightY = maxY - minY;
    const boxSize = Math.max(widthX, heightY, length) * 2;
    
    // Create base brush
    const baseBrush = new Brush(baseGeo);
    baseBrush.updateMatrixWorld();
    
    const evaluator = new Evaluator();
    
    // We want mitre cuts. Assuming the frame profile lies in X-Y plane and extrudes along Z.
    // Outer edge is at X = widthX. Inner edge is at X = 0.
    // For a standard frame, the outer edge is longer.
    // So the cut planes are Z = X and Z = length - X.
    
    const boxGeo = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const sign = invertCuts ? -1 : 1;
    
    // Left Cut Box (z = 0)
    const leftBrush = new Brush(boxGeo);
    leftBrush.position.set(0, 0, 0);
    leftBrush.rotation.x = (Math.PI / 4) * sign;
    leftBrush.translateZ(-boxSize/2);
    leftBrush.updateMatrixWorld();
    
    let result = evaluator.evaluate(baseBrush, leftBrush, SUBTRACTION);
    
    // Right Cut Box (z = length)
    const rightBrush = new Brush(boxGeo);
    rightBrush.position.set(0, 0, length);
    rightBrush.rotation.x = (-Math.PI / 4) * sign;
    rightBrush.translateZ(boxSize/2);
    rightBrush.updateMatrixWorld();
    
    result = evaluator.evaluate(result, rightBrush, SUBTRACTION);
    
    return result.geometry;
  }, [length, vertices, invertCuts]);

  return (
    <mesh geometry={geometry} material={material} position={position} rotation={rotation} castShadow receiveShadow />
  );
};
