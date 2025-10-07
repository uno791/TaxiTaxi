import { useGLTF, Clone } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import type { JSX } from "react/jsx-runtime";

export function StreetLight(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Streetlight.glb");
  const bulb = useMemo(() => {
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    const radius = Math.max(size.y * 0.05, 0.08);
    const position: [number, number, number] = [
      center.x,
      box.max.y - radius * 0.6,
      center.z,
    ];

    return {
      position,
      radius,
    };
  }, [scene]);

  return (
    <group {...props}>
      <Clone object={scene} />
      <mesh position={bulb.position}>
        <sphereGeometry args={[bulb.radius, 16, 16]} />
        <meshBasicMaterial
          color="#f5d7a5"
          transparent
          opacity={0.9}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

useGLTF.preload("/models/Streetlight.glb");
