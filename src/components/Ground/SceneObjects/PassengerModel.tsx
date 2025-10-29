import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";
import type { MissionPassengerModelId } from "../../Missions/missionConfig";

const MODEL_PATHS: Record<Exclude<MissionPassengerModelId, "none">, string> = {
  generic: "models/Adventurer.glb",
  accountant: "models/The Accountant.glb",
  soldier: "models/The Soldier.glb",
  "street-preacher": "models/The Street Preacher.glb",
  child: "models/The Child.glb",
  "blind-woman": "models/The Blind Woman.glb",
  "mirror-man": "models/The Mirror Man.glb",
  widow: "models/The Widow.glb",
  clown: "models/The Clown.glb",
  coroner: "models/The Coroner.glb",
  "radio-host": "models/Radio Host.glb",
  nun: "models/The Priest.glb",
  "hooded-figure": "models/Hooded Figure.glb",
  officer: "models/The Officer.glb",
  doctor: "models/The Doctor.glb",
  butcher: "models/The Butcher.glb",
  jester: "models/The Jester.glb",
  priest: "models/The Priest.glb",
  reflection: "models/The Mirror Man.glb",
  reaper: "models/The Reaper.glb",
};

export function PassengerModel({
  modelId,
  ...groupProps
}: { modelId: MissionPassengerModelId } & JSX.IntrinsicElements["group"]) {
  if (modelId === "none") return null;

  const path =
    MODEL_PATHS[modelId as Exclude<MissionPassengerModelId, "none">] ??
    MODEL_PATHS.generic;
  const { scene } = useGLTF(path);

  return (
    <group {...groupProps}>
      <Clone object={scene} />
    </group>
  );
}

for (const path of Object.values(MODEL_PATHS)) {
  useGLTF.preload(path);
}
