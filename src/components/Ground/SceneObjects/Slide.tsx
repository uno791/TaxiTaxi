import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function Slide(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Slide.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Slide.glb");
