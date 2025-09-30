import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function Planter(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Planter & Bushes.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Planter & Bushes.glb");
