import { useGLTF } from "@react-three/drei";
import { usePlane } from "@react-three/cannon";
import type { JSX } from "react/jsx-runtime";
import { Group } from "three";
import { useMemo, useRef } from "react";

function normalizePosition(
  position?: JSX.IntrinsicElements["group"]["position"]
): [number, number, number] {
  if (Array.isArray(position)) {
    return position as [number, number, number];
  }

  if (position && typeof position === "object" && "x" in position) {
    return [position.x ?? 0, position.y ?? 0, position.z ?? 0];
  }

  return [0, 0, 0];
}

export function Grass(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/Grass Tile.glb") as { scene: Group };
  const physicsRef = useRef<Group | null>(null);
  const planePosition = useMemo(
    () => normalizePosition(props.position),
    [props.position]
  );

  usePlane(
    () => ({
      type: "Static",
      rotation: [0, 0, 0],
      position: planePosition,
    }),
    physicsRef
  );

  return (
    <group ref={physicsRef} {...props}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/models/Grass Tile.glb");
