import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

interface AdaptiveCameraProps {
  maxDim: number;
  targetX: number;
  targetY: number;
  targetZ?: number;
  angle?: number;
  defaultRadiusMult?: number;
  fov?: number;
  zSign?: 1 | -1;
  minDistance?: number;
  controlsRef?: React.RefObject<any>;
}

export const AdaptiveCamera: React.FC<AdaptiveCameraProps> = ({
  maxDim,
  targetX,
  targetY,
  targetZ = 0,
  angle = 0,
  defaultRadiusMult = 1.5,
  fov = 30,
  zSign = -1,
  minDistance = 0,
  controlsRef
}) => {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / size.height;
    
    // Calculate adaptive zoom factor.
    // If aspect < 1 (portrait screens / mobile), we increase the camera distance by 1/aspect
    // to ensure the entire horizontal width of the window frame fits within the view.
    const aspectFactor = aspect < 1 ? 1.05 / aspect : 1;
    const baseRadius = minDistance > 0 ? Math.max(minDistance, maxDim * defaultRadiusMult) : maxDim * defaultRadiusMult;
    const radius = baseRadius * aspectFactor;

    const posX = targetX + radius * Math.sin(angle);
    const posY = targetY;
    const posZ = targetZ + zSign * radius * Math.cos(angle);

    camera.position.set(posX, posY, posZ);

    if (controlsRef && controlsRef.current) {
      controlsRef.current.target.set(targetX, targetY, targetZ);
      controlsRef.current.update();
    } else {
      camera.lookAt(targetX, targetY, targetZ);
    }

    if ('fov' in camera) {
      (camera as any).fov = fov;
    }
    camera.updateProjectionMatrix();

    if (controlsRef && controlsRef.current) {
      controlsRef.current.update();
    }
  }, [size.width, size.height, maxDim, targetX, targetY, targetZ, angle, defaultRadiusMult, fov, zSign, camera, controlsRef]);

  return null;
};
