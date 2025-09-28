import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function GreenBuilding(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Building Green.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Building Green.glb");
