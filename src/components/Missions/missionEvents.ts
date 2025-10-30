import { MISSIONS_BY_CITY } from "./missionConfig";
import type { MissionEventPlacement } from "./events";

type MissionEventsById = Record<string, MissionEventPlacement[]>;

const baseMap: MissionEventsById = Object.values(MISSIONS_BY_CITY)
  .flat()
  .reduce<MissionEventsById>((acc, mission) => {
    acc[mission.id] = [];
    return acc;
  }, {});

baseMap["night3-child"] = [
  {
    missionId: "night3-child",
    event: "the-child-apparition",
    position: [64, 0.15, -424],
  },
];
baseMap["night1-accountant"] = [
  {
    missionId: "night1-accountant",
    event: "the-child-apparition",
    position: [26.689, 0.15, -36.048],
  },
];

export const MISSION_EVENTS_BY_ID: MissionEventsById = baseMap;

export const ALL_MISSION_EVENTS: MissionEventPlacement[] = Object.values(
  MISSION_EVENTS_BY_ID
).flat();

export const getMissionEventsForMission = (
  missionId: string
): MissionEventPlacement[] => MISSION_EVENTS_BY_ID[missionId] ?? [];
