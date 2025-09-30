import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function HouseDriveway(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/House with driveway.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/House with driveway.glb");
