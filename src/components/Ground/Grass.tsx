import { useGLTF } from "@react-three/drei";
import { usePlane } from "@react-three/cannon";
import type { JSX } from "react/jsx-runtime";
import { Group } from "three";
import { useRef } from "react";

export function Grass(props: JSX.IntrinsicElements["group"]) {
  // Load model (must be in public/models/)
  const { scene } = useGLTF("/models/Grass Tile.glb") as { scene: Group };
  const [ref] = usePlane(
    () => ({
      type: "Static",
      rotation: [-Math.PI / 2, 0, 0],
    }),
    useRef(null)
  );
  return (
    <group {...props}>
      <primitive object={scene} />
    </group>
  );
}

// Preload so it's ready when used
useGLTF.preload("/models/Grass Tile.glb");
