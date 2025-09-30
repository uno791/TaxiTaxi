import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function FireHydrant(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Fire hydrant.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Fire hydrant.glb");
