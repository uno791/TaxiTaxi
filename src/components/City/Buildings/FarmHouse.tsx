import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function FarmHouse(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/Farm house.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("models/Farm house.glb");
