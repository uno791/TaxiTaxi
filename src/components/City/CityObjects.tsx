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
import { TrashBag } from "../Ground/SceneObjects/TrashBag";

export default function CityObjects(props: JSX.IntrinsicElements["group"]) {
  return (
    <group {...props}>
      <group></group>
    </group>
  );
}
