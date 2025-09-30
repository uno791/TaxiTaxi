// CameraChase.tsx
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export function CameraChase({
  target,
  distance = 3,
  height = 1.6,
  lookAhead = 1.8,
  lookUp = 0.5,
  stiffness = 8,
  targetSmoothing = 6,
}: {
  target: React.MutableRefObject<THREE.Object3D | null>;
  distance?: number;
  height?: number;
  lookAhead?: number;
  lookUp?: number;
  stiffness?: number;
  targetSmoothing?: number;
}) {
  const { camera } = useThree();

  const pos = useRef(new THREE.Vector3());
  const quat = useRef(new THREE.Quaternion());
  const forward = useRef(new THREE.Vector3());
  const desiredPos = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());
  const filteredPos = useRef(new THREE.Vector3());
  const filteredTarget = useRef(new THREE.Vector3());
  const up = useRef(new THREE.Vector3(0, 1, 0));
  const initialized = useRef(false);

  useFrame((_, dt) => {
    const t = target.current;
    if (!t) return;

    t.getWorldPosition(pos.current);
    t.getWorldQuaternion(quat.current);

    forward.current.set(0, 0, -1).applyQuaternion(quat.current).normalize();

    desiredPos.current
      .copy(pos.current)
      .addScaledVector(forward.current, -distance)
      .addScaledVector(up.current, height);

    desiredTarget.current
      .copy(pos.current)
      .addScaledVector(forward.current, lookAhead)
      .addScaledVector(up.current, lookUp);

    if (!initialized.current) {
      filteredPos.current.copy(desiredPos.current);
      filteredTarget.current.copy(desiredTarget.current);
      camera.position.copy(filteredPos.current);
      camera.lookAt(filteredTarget.current);
      initialized.current = true;
      return;
    }

    const positionAlpha = 1 - Math.exp(-stiffness * dt);
    filteredPos.current.lerp(desiredPos.current, positionAlpha);
    camera.position.copy(filteredPos.current);

    const targetAlpha = 1 - Math.exp(-targetSmoothing * dt);
    filteredTarget.current.lerp(desiredTarget.current, targetAlpha);
    camera.lookAt(filteredTarget.current);
  });

  return null;
}
