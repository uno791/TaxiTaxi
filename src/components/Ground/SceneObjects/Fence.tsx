import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function Fence(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/Fence.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("models/Fence.glb");
