import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function StreetLight(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Street Light.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Street Light.glb");
