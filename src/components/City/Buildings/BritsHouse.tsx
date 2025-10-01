import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function BritsHouse(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Brit's House.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Brit's House.glb");
