import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function StreetLight(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Streetlight.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Streetlight.glb");
