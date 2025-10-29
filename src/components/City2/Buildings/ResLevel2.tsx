import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function ResLevel2(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/resV3.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("models/resV3.glb");
