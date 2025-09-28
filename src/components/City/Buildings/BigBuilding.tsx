import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function BigBuilding(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Big Building.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Big Building.glb");
