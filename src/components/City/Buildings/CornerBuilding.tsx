import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function CornerBuilding(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Building Red Corner.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Building Red Corner.glb");
