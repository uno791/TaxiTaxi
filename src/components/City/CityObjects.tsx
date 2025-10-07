import type { JSX } from "react/jsx-runtime";
import { Bicycle } from "../Ground/SceneObjects/Bicycle";
import { Billboard } from "../Ground/SceneObjects/Billboard";
import { Box } from "../Ground/SceneObjects/Box";
import { Bench } from "../Ground/SceneObjects/Bench";
import { Cone } from "../Ground/SceneObjects/Cone";
import { Dumpster } from "../Ground/SceneObjects/Dumpster";
import { FlowerPotA } from "../Ground/SceneObjects/FlowerPotA";
import { FlowerPotB } from "../Ground/SceneObjects/FlowerPotB";
import { FireHydrant } from "../Ground/SceneObjects/FireHydrant";
import { MailBox } from "../Ground/SceneObjects/MailBox";
import { ManHole } from "../Ground/SceneObjects/ManHole";
import { Paper } from "../Ground/SceneObjects/Paper";
import { Planter } from "../Ground/SceneObjects/Planter";
import { StreetLight } from "../Ground/SceneObjects/StreetLight";
import { TrafficLight } from "../Ground/SceneObjects/TrafficLight";
import { TrashBag } from "../Ground/SceneObjects/TrashBag";
import BoxCluster from "../Ground/SceneObjects/BoxCluster";
import { TrafficLightB } from "../Ground/SceneObjects/TrafficLightB";
import { TrafficLightC } from "../Ground/SceneObjects/TrafficLightC";
import TrafficSigns from "../Ground/SceneObjects/TrafficSigns";
import WorldObjects from "../Ground/SceneObjects/WorldObjects";
import StreetLights from "../Ground/StreetLights";

export default function CityObjects(props: JSX.IntrinsicElements["group"]) {
  return (
    <group {...props}>
      <group>
        <BoxCluster position={[0, 0, 0]} />
        <BoxCluster position={[-0.1, 0, 0.7]} rotation={[0, 0, 0]} />
        <WorldObjects position={[0, 0, 0]} />
        <TrafficSigns position={[0, 0, 0]} />
        <StreetLights />
      </group>
    </group>
  );
}
