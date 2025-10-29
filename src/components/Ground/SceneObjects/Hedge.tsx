import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function Hedge(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/Hedge.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("models/Hedge.glb");
