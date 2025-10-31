import type { MutableRefObject } from "react";
import type { JSX } from "react/jsx-runtime";
import type { Vector3 } from "three";
import { NewRoadtest } from "./NewRoadtest";
import { City3Buildings } from "./City3Buildings";
import { City3Block2 } from "./City3Block2";
import { City3Block3 } from "./City3Block3";
import { Grass } from "../Ground/Grass";
import { City3Colliders } from "./City3Colliders";
import { Mountains } from "./Mountains";
import { City3Ramp, CITY3_RAMP_CONFIGS } from "./City3Ramp";

type NewCityRoadProps = JSX.IntrinsicElements["group"] & {
  playerPositionRef: MutableRefObject<Vector3>;
};

export default function NewCityRoad({
  playerPositionRef,
  ...props
}: NewCityRoadProps) {
  return (
    <group {...props}>
      <NewRoadtest
        position={[28, 0.1, -450]}
        scale={0.3}
        rotation={[0, 0, 0]}
      />
      <City3Buildings
        position={[28, 0.1, -450]}
        scale={0.3}
        rotation={[0, 0, 0]}
      />
      <City3Block2
        position={[88.89, 0.1, -481.7]}
        scale={0.3}
        rotation={[0, 0, 0]}
      />
      <City3Block3
        position={[11.3, 0.1, -509.3]}
        scale={0.3}
        rotation={[0, 0, 0]}
      />
      {CITY3_RAMP_CONFIGS.map((config, index) => (
        <City3Ramp key={`city3-ramp-${index}`} {...config} />
      ))}
      <City3Colliders playerPositionRef={playerPositionRef} />
      <Grass position={[0, -1, 0]} scale={[1000, 1, 1000]} />
      <Mountains position={[27, 0, -449.3]} scale={0.3} rotation={[0, 0, 0]} />
    </group>
  );
}
