import { useGLTF } from "@react-three/drei";
import { Group } from "three";
import { usePlane } from "@react-three/cannon";
import type { JSX } from "react/jsx-runtime";

export function Grass(props: JSX.IntrinsicElements["group"]) {
  // Load model (must be in public/models/)
  const { scene } = useGLTF("/models/Grass Tile.glb") as { scene: Group };
  const [planeRef] = usePlane(() => ({
    type: "Static",
    rotation: [-Math.PI / 2, 0, 0],
  }));
  void planeRef;
  return (
    <group {...props}>
      <primitive object={scene} />
    </group>
  );
}

// Preload so it's ready when used
useGLTF.preload("/models/Grass Tile.glb");
