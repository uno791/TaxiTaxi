import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function HouseCar(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/House-Car.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("models/House-Car.glb");
