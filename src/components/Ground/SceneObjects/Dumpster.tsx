import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function Dumpster(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Dumpster.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Dumpster.glb");
