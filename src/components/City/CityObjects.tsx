import type { JSX } from "react/jsx-runtime";

import BoxCluster from "../Ground/SceneObjects/BoxCluster";
import TrafficSigns from "../Ground/SceneObjects/TrafficSigns";
import WorldObjects from "../Ground/SceneObjects/WorldObjects";
import StreetLights from "../Ground/StreetLights";
import { WorldFog } from "./WorldFog";

export default function CityObjects(props: JSX.IntrinsicElements["group"]) {
  return (
    <group {...props}>
      <group>
        <WorldFog position={[0, 0, 0]} />
        <BoxCluster position={[0, 0, 0]} />
        <BoxCluster position={[-0.1, 0, 0.7]} rotation={[0, 0, 0]} />
        <WorldObjects position={[0, 0, 0]} />
        <TrafficSigns position={[0, 0, 0]} />
        <StreetLights />
      </group>
    </group>
  );
}
