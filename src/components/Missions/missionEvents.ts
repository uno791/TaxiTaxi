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
  {
    missionId: "night1-child",
    event: "the-child-apparition",
    position: [39.63, 1, -15.993],
  },
];

baseMap["night1-child"] = [
  {
    missionId: "night1-child",
    event: "the-child-apparition",
    position: [39.63, 1, -15.993],
  },
];

baseMap["night2-doctor"] = [
  {
    missionId: "night2-doctor",
    event: "the-weeping-spirit",
    position: [106.48, 1, -175.236],
  },
  {
    missionId: "night2-doctor",
    event: "the-child-apparition",
    position: [109.226, 1, -149.225],
  },
];

baseMap["night2-nun"] = [
  {
    missionId: "night2-nun",
    event: "the-weeping-spirit",
    position: [109.425, 1, -149.221],
  },
  {
    missionId: "night2-nun",
    event: "the-child-apparition",
    position: [109.26, 1, -108.509],
  },
];

baseMap["night2-coroner"] = [
  {
    missionId: "night2-coroner",
    event: "the-weeping-spirit",
    position: [121.835, 1, -114.386],
  },
  {
    missionId: "night2-coroner",
    event: "the-child-apparition",
    position: [158.383, 1, -113.204],
  },
  {
    missionId: "night2-coroner",
    event: "the-child-apparition",
    position: [163.821, 1, -108.618],
  },
];


export const MISSION_EVENTS_BY_ID: MissionEventsById = baseMap;

export const ALL_MISSION_EVENTS: MissionEventPlacement[] = Object.values(
  MISSION_EVENTS_BY_ID
).flat();

export const getMissionEventsForMission = (
  missionId: string
): MissionEventPlacement[] => MISSION_EVENTS_BY_ID[missionId] ?? [];
