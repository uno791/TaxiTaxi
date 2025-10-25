import type { JSX } from "react/jsx-runtime";
import { NewRoadtest } from "./NewRoadtest";
import { City3Buildings } from "./City3Buildings";
import { City3Block2 } from "./City3Block2";
import { City3Block3 } from "./City3Block3";
import { Grass } from "../Ground/Grass";

export default function NewCityRoad(props: JSX.IntrinsicElements["group"]) {
  return (
    <group {...props}>
      <Grass position={[28, -1, -450]} scale={[600, 1, 600]} />
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
    </group>
  );
}
