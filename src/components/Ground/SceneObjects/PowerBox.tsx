import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function PowerBox(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Power Box.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Power Box.glb");
