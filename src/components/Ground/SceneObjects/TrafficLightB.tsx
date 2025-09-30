import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function TrafficLightB(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Trafficlight B.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Trafficlight B.glb");
