import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function RoadLevel2(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/4blocksV3.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/4blocksV3.glb");
