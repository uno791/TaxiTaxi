import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function Barrier(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/Barrier Large.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("models/Barrier Large.glb");
