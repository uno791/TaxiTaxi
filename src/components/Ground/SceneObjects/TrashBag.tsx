import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";

export function TrashBag(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/trah bag grey.glb");
  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("/models/trah bag grey.glb");
