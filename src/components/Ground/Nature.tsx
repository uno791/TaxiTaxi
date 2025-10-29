import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function Nature(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/Forest.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("models/Forest.glb");
