import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function Bench(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Bench.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Bench.glb");
