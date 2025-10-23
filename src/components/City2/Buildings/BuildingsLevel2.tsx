import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function BuildingsLevel2(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/buildingsV1.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/buildingsV1.glb");
