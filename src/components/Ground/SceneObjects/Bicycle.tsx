import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function Bicycle(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Bicycle.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/ Bicycle.glb");
