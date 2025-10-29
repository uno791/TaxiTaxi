import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function Hospital(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/Hospital.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("models/Hospital.glb");
