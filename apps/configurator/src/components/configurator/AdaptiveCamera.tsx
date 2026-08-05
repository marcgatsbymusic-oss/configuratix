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
    
    const fovRad = (fov * Math.PI) / 180;
    const vFov = 2 * Math.tan(fovRad / 2);
    // 1.2 padding factor to give a little breathing room
    const radiusForHeight = (maxDim / vFov) * 1.15;
    const radiusForWidth = (maxDim / (vFov * aspect)) * 1.15;
    
    let radius = Math.max(radiusForHeight, radiusForWidth);
    if (minDistance > 0) radius = Math.max(minDistance, radius);

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
