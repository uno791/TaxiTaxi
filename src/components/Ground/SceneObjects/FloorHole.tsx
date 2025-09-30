import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function FloorHole(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Floor Hole.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Floor Hole.glb");
