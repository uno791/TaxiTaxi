import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function Mountain(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/Mountain Scene.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("models/Mountain Scene.glb");
