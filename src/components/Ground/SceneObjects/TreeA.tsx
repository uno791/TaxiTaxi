import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function TreeA(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/Tree.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("models/Tree.glb");
