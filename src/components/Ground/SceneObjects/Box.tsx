import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function Box(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Box.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Box.glb");
