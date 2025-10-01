import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function BBall(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Basketball court.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Basketball court.glb");
