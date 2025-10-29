import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function FlowerPotA(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/Flower Pot.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("models/Flower Pot.glb");
