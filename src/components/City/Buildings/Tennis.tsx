import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function Tennis(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/Tennis court.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("models/Tennis court.glb");
