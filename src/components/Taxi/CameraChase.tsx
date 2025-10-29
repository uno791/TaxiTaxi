// CameraChase.tsx
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

type CameraChaseProps = {
  target: React.MutableRefObject<THREE.Object3D | null>;
};

export function CameraChase({ target }: CameraChaseProps) {
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

  const [viewIndex, setViewIndex] = useState(0);

  const views = [
    { distance: 3, height: 1.6, lookAhead: 1.8, lookUp: 0.5 }, // Default chase
    { distance: 1.2, height: 1.3, lookAhead: 2.5, lookUp: 0.6 }, // Hood
    { distance: 0, height: 10, lookAhead: 0, lookUp: 0 }, // Top-down (rotates yaw only, reversed)
    { distance: 6, height: 2.5, lookAhead: 2, lookUp: 0.5 }, // Far chase
  ];
  const stiffness = 8;
  const targetSmoothing = 6;

  // Switch camera view with "C"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "c") {
        setViewIndex((prev) => (prev + 1) % views.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [views.length]);

  useFrame((_, dt) => {
    const t = target.current;
    if (!t) return;

    const { distance, height, lookAhead, lookUp } = views[viewIndex];

    t.getWorldPosition(pos.current);
    t.getWorldQuaternion(quat.current);

    forward.current.set(0, 0, -1).applyQuaternion(quat.current).normalize();

    if (viewIndex === 2) {
      // --- STABLE ROTATING TOP-DOWN CAMERA (REVERSED) ---
      const euler = new THREE.Euler().setFromQuaternion(quat.current, "YXZ");
      const yaw = euler.y;

      desiredPos.current.set(
        pos.current.x,
        pos.current.y + height,
        pos.current.z
      );

      // Reverse top view orientation (forward appears downward)
      const sinY = Math.sin(yaw + Math.PI);
      const cosY = Math.cos(yaw + Math.PI);
      camera.up.set(sinY, 0, cosY);

      desiredTarget.current.copy(pos.current);
    } else {
      // --- NORMAL CHASE CAMERA ---
      desiredPos.current
        .copy(pos.current)
        .addScaledVector(forward.current, -distance)
        .addScaledVector(up.current, height);

      desiredTarget.current
        .copy(pos.current)
        .addScaledVector(forward.current, lookAhead)
        .addScaledVector(up.current, lookUp);

      // Reset camera orientation for all other views
      camera.up.set(0, 1, 0);
    }

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
