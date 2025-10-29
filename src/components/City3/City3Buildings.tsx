import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function City3Buildings(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/block_1_dupicate.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("models/block_1_dupicate.glb");
