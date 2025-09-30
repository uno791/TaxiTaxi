import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function Woman(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Animated Woman.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Animated Woman.glb");
