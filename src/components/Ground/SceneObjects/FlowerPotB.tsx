import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function FlowerPotB(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/FlowerPotB.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("models/FlowerPotB.glb");
