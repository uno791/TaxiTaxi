import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function MissionZone(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Glass.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Glass.glb");
