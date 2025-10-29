import type { MutableRefObject } from "react";
import type { JSX } from "react/jsx-runtime";
import type { Vector3 } from "three";
import { RoadLevel2 } from "./Road/RoadLevel2";
import { BuildingsLevel2 } from "./Buildings/BuildingsLevel2";
import { ResLevel2 } from "./Buildings/ResLevel2";
import { BitsLevel2 } from "./Buildings/BitsLevel2";
import { Grass } from "../Ground/Grass";
import { City2Colliders } from "./City2Colliders";

type Level2Props = JSX.IntrinsicElements["group"] & {
  playerPositionRef: MutableRefObject<Vector3>;
};

export default function Level2({
  playerPositionRef,
  ...groupProps
}: Level2Props) {
  const positionProp = groupProps.position;
  const cityOffset: [number, number, number] = Array.isArray(positionProp)
    ? [positionProp[0] ?? 0, positionProp[1] ?? 0, positionProp[2] ?? 0]
    : positionProp && typeof positionProp === "object" && "x" in positionProp
    ? [
        (positionProp.x as number | undefined) ?? 0,
        (positionProp.y as number | undefined) ?? 0,
        (positionProp.z as number | undefined) ?? 0,
      ]
    : [0, 0, 0];

  return (
    <group {...groupProps}>
      <RoadLevel2
        position={[100, 0.1, -150]}
        scale={0.4}
        rotation={[0, 0, 0]}
      />

      <BuildingsLevel2
        position={[100.4, 0, -150.5]}
        scale={[0.4, 0.35, 0.4]}
        rotation={[0, 0, 0]}
      />

      <ResLevel2 position={[100, 0.1, -150]} scale={0.4} rotation={[0, 0, 0]} />
      <BitsLevel2
        position={[100, 0.1, -150]}
        scale={0.4}
        rotation={[0, 0, 0]}
      />
      <City2Colliders
        playerPositionRef={playerPositionRef}
        cityOffset={cityOffset}
      />
      <Grass position={[0, -1, 0]} scale={[1000, 1, 1000]} />
    </group>
  );
}
