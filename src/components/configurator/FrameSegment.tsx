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
  scaleFactor?: number;
}

export const FrameSegment: React.FC<FrameSegmentProps> = ({ 
  length, 
  vertices, 
  material, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  invertCuts = false,
  origin = null,
  scaleFactor = 1
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
    shape.moveTo((vertices[0].x - ox) * scaleFactor, (vertices[0].y - oy) * scaleFactor);
    for (let i = 1; i < vertices.length; i++) {
      shape.lineTo((vertices[i].x - ox) * scaleFactor, (vertices[i].y - oy) * scaleFactor);
    }
    shape.lineTo((vertices[0].x - ox) * scaleFactor, (vertices[0].y - oy) * scaleFactor);

    const scaledLength = length * scaleFactor;
    const extrudeSettings = {
      depth: scaledLength,
      bevelEnabled: false,
    };
    const baseGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    const widthX = (maxX - minX) * scaleFactor;
    const heightY = (maxY - minY) * scaleFactor;
    const boxSize = Math.max(widthX, heightY, scaledLength) * 2;
    
    // Create base brush
    const baseBrush = new Brush(baseGeo);
    baseBrush.updateMatrixWorld();
    
    const evaluator = new Evaluator();
    
    // We want mitre cuts. Assuming the frame profile lies in X-Y plane and extrudes along Z.
    // Outer edge is at X = widthX. Inner edge is at X = 0.
    // For a standard frame, the outer edge is longer.
    // So the cut planes are Z = X and Z = scaledLength - X.
    
    const boxGeo = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const sign = invertCuts ? -1 : 1;
    
    // Left Cut Box (z = 0)
    const leftBrush = new Brush(boxGeo);
    leftBrush.position.set(0, 0, 0);
    leftBrush.rotation.x = (Math.PI / 4) * sign;
    leftBrush.translateZ(-boxSize/2);
    leftBrush.updateMatrixWorld();
    
    let result = evaluator.evaluate(baseBrush, leftBrush, SUBTRACTION);
    
    // Right Cut Box (z = scaledLength)
    const rightBrush = new Brush(boxGeo);
    rightBrush.position.set(0, 0, scaledLength);
    rightBrush.rotation.x = (-Math.PI / 4) * sign;
    rightBrush.translateZ(boxSize/2);
    rightBrush.updateMatrixWorld();
    
    result = evaluator.evaluate(result, rightBrush, SUBTRACTION);
    
    const geo = result.geometry;
    geo.clearGroups(); // Fixes GLTFExporter multi-material group crashes
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    return geo;
  }, [length, vertices, invertCuts, scaleFactor]);

  return (
    <mesh geometry={geometry} material={material} position={position} rotation={rotation} castShadow receiveShadow />
  );
};
