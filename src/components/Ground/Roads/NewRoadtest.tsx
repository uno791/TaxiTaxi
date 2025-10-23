import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function NewRoadtest(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/test2.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/test2.glb");
