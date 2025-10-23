import type { JSX } from "react/jsx-runtime";
import { NewRoadtest } from "./Roads/NewRoadtest";

export default function NewCityRoad(props: JSX.IntrinsicElements["group"]) {
  return (
    <group {...props}>
      <NewRoadtest
        position={[28, 0.1, -150]}
        scale={0.3}
        rotation={[0, 0, 0]}
      />
    </group>
  );
}
