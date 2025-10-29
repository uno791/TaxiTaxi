import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function BitsLevel2(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/bitsV1.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("models/bitsV1.glb");
