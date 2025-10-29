import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";
import { FlowerPotA } from "../../Ground/SceneObjects/FlowerPotA";
import { FlowerPotB } from "../../Ground/SceneObjects/FlowerPotB";

export function BigBuilding(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("models/Big Building.glb");
  return (
    <group {...props}>
      <FlowerPotA
        position={[1, 0.7, 2]}
        scale={0.5}
        rotation={[0, Math.PI, 0]}
      />
      <FlowerPotB position={[-1, 0.55, 2]} scale={0.5} rotation={[0, 0, 0]} />
      <Clone object={scene} />
    </group>
  );
}

useGLTF.preload("models/Big Building.glb");
