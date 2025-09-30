import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function TrafficLight(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Traffic light.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Traffic light.glb");
