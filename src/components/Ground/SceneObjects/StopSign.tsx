import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function StopSign(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/Stop sign.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("models/Stop sign.glb");
