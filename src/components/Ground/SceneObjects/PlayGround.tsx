import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function PlayGround(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Swing set.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Swing set.glb");
