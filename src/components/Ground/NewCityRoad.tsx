import type { JSX } from "react/jsx-runtime";
import { NewRoadtest } from "./Roads/NewRoadtest";
import { City3Buildings } from "./Roads/City3Buildings";
import { City3Block2 } from "./Roads/City3Block2";
import { City3Block3 } from "./Roads/City3Block3";

export default function NewCityRoad(props: JSX.IntrinsicElements["group"]) {
  return (
    <group {...props}>
      <NewRoadtest
        position={[28, 0.1, -150]}
        scale={0.3}
        rotation={[0, 0, 0]}
      />
      <City3Buildings
        position={[28, 0.1, -150]}
        scale={0.3}
        rotation={[0, 0, 0]}
      />
      <City3Block2
        position={[88.89, 0.1, -181.7]}
        scale={0.3}
        rotation={[0, 0, 0]}
      />
      <City3Block3
        position={[11.3, 0.1, -209.3]}
        scale={0.3}
        rotation={[0, 0, 0]}
      />
    </group>
  );
}
