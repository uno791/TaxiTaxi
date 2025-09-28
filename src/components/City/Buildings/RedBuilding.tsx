import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function RedBuilding(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Building Red.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Building Red.glb");
