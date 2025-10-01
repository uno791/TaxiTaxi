import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function Driveway(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Path Straight.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Path Straight.glb");
