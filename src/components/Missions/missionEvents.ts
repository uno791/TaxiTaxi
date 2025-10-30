import { MISSIONS_BY_CITY } from "./missionConfig";
import type { MissionEventPlacement } from "./events";

type MissionEventsById = Record<string, MissionEventPlacement[]>;

const baseMap: MissionEventsById = Object.values(MISSIONS_BY_CITY)
  .flat()
  .reduce<MissionEventsById>((acc, mission) => {
    acc[mission.id] = [];
    return acc;
  }, {});

baseMap["night1-mirror-man"] = [
  {
    missionId: "night1-mirror-man",
    event: "the-child-apparition",
    position: [23.843, 1, -19.942],
  },
  {
    missionId: "night1-mirror-man",
    event: "the-child-apparition",
    position: [12.159, 1, -54.178],
  },
];

export const MISSION_EVENTS_BY_ID: MissionEventsById = baseMap;

export const ALL_MISSION_EVENTS: MissionEventPlacement[] = Object.values(
  MISSION_EVENTS_BY_ID
).flat();

export const getMissionEventsForMission = (
  missionId: string
): MissionEventPlacement[] => MISSION_EVENTS_BY_ID[missionId] ?? [];
