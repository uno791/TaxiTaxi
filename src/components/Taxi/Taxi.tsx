import { useGLTF } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";
import { Group } from "three";

export function Taxi(props: JSX.IntrinsicElements["group"]) {
  // Load model (must be in public/models/)
  const { scene } = useGLTF("/models/Taxi.glb") as { scene: Group };

  return (
    <group {...props}>
      <primitive object={scene} />
    </group>
  );
}

// Preload so it's ready when used
useGLTF.preload("/models/Taxi.glb");
