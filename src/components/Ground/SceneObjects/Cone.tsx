import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function Cone(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/Cone.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("models/Cone.glb");
