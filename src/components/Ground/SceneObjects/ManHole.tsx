import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function ManHole(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Manhole Cover.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Manhole Cover.glb");
