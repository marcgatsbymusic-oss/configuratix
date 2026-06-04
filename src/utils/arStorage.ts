import * as THREE from 'three';

const DB_NAME = 'MammutARDB';
const STORE_NAME = 'models';
const MODEL_KEY = 'current_window';

export function saveModelToDB(blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const putReq = store.put(blob, MODEL_KEY);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    request.onerror = () => reject(request.error);
  });
}

export function getModelFromDB(): Promise<Blob | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(MODEL_KEY);
      getReq.onsuccess = () => resolve(getReq.result || null);
      getReq.onerror = () => reject(getReq.error);
    };
    request.onerror = () => reject(request.error);
  });
}

export function getAnimationClipsForTypology(typology: string): THREE.AnimationClip[] {
  const clips: THREE.AnimationClip[] = [];

  if (typology === 'SLE201') {
    // SLE201 open animation
    const positionTrack = new THREE.VectorKeyframeTrack(
      'sashGroup.position',
      [0, 0.8, 2.0, 4.8],
      [
        0, 0, 0,
        0, 0, 0,
        0, 0, -0.01,
        1.0, 0, -0.01
      ]
    );

    const qClosed = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0);
    const qOpen = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI);
    const handleTrack = new THREE.QuaternionKeyframeTrack(
      'handleLever.quaternion',
      [0, 0.8, 4.8],
      [
        qClosed.x, qClosed.y, qClosed.z, qClosed.w,
        qOpen.x, qOpen.y, qOpen.z, qOpen.w,
        qOpen.x, qOpen.y, qOpen.z, qOpen.w
      ]
    );

    clips.push(new THREE.AnimationClip('OpenSash', 4.8, [positionTrack, handleTrack]));
  } else if (typology === 'F100T') {
    // F100T Open Side (Turn) Clip
    const qClosedHandle = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0);
    const qTurnHandle = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2);
    const qTiltHandle = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI);

    const handleTurnTrack = new THREE.QuaternionKeyframeTrack(
      'handleLever.quaternion',
      [0, 0.3, 1.0],
      [
        qClosedHandle.x, qClosedHandle.y, qClosedHandle.z, qClosedHandle.w,
        qTurnHandle.x, qTurnHandle.y, qTurnHandle.z, qTurnHandle.w,
        qTurnHandle.x, qTurnHandle.y, qTurnHandle.z, qTurnHandle.w
      ]
    );

    const qClosedSash = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0);
    const qTurnSash = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 4);

    const sashTurnTrack = new THREE.QuaternionKeyframeTrack(
      'sashPivot.quaternion',
      [0, 0.3, 1.0],
      [
        qClosedSash.x, qClosedSash.y, qClosedSash.z, qClosedSash.w,
        qClosedSash.x, qClosedSash.y, qClosedSash.z, qClosedSash.w,
        qTurnSash.x, qTurnSash.y, qTurnSash.z, qTurnSash.w
      ]
    );

    clips.push(new THREE.AnimationClip('OpenSide', 1.0, [handleTurnTrack, sashTurnTrack]));

    // F100T Open Tilt Clip
    const handleTiltTrack = new THREE.QuaternionKeyframeTrack(
      'handleLever.quaternion',
      [0, 0.3, 1.0],
      [
        qClosedHandle.x, qClosedHandle.y, qClosedHandle.z, qClosedHandle.w,
        qTiltHandle.x, qTiltHandle.y, qTiltHandle.z, qTiltHandle.w,
        qTiltHandle.x, qTiltHandle.y, qTiltHandle.z, qTiltHandle.w
      ]
    );

    const qTiltSash = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI * (15 / 180));
    const sashTiltTrack = new THREE.QuaternionKeyframeTrack(
      'sashPivot.quaternion',
      [0, 0.3, 1.0],
      [
        qClosedSash.x, qClosedSash.y, qClosedSash.z, qClosedSash.w,
        qClosedSash.x, qClosedSash.y, qClosedSash.z, qClosedSash.w,
        qTiltSash.x, qTiltSash.y, qTiltSash.z, qTiltSash.w
      ]
    );

    clips.push(new THREE.AnimationClip('OpenTilt', 1.0, [handleTiltTrack, sashTiltTrack]));
  }

  return clips;
}
