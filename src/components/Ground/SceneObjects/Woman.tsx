import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function Woman(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/Adventurer.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("models/Adventurer.glb");
