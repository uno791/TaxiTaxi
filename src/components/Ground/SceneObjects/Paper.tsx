import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function Paper(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Debris Papers.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Debris Papers.glb");
