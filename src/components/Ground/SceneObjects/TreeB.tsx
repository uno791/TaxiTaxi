import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function TreeB(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/Tree-2.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("models/Tree-2.glb");
