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

baseMap["night2-officer"] = [
  {
    missionId: "night2-officer",
    event: "the-child-apparition",
    position: [96.24, 1, -99.525],
  },
  {
    missionId: "night2-officer",
    event: "the-weeping-spirit",
    position: [92.196, 1, -91.063 ],
  },
];

baseMap["night3-reaper"] = [
  {
    missionId: "night3-reaper",
    event: "the-child-apparition",
    position: [72.753, 1, -455.149],
  },
  {
    missionId: "night3-reaper",
    event: "the-weeping-spirit",
    position: [77.87, 1, -473.354  ],
  },
];

baseMap["night3-priest"] = [
  {
    missionId: "night3-priest",
    event: "the-child-apparition",
    position: [28.979, 1, -483.624],
  },
  {
    missionId: "night3-priest",
    event: "the-weeping-spirit",
    position: [35.368, 1, -511.384],
  },
];

baseMap["night3-widow"] = [
  {
    missionId: "night3-widow",
    event: "the-child-apparition",
    position: [23.856, 1, -449.045],
  },
  {
    missionId: "night3-widow",
    event: "the-weeping-spirit",
    position: [-12.715, 1, -428.281],
  },
];

baseMap["night3-jester"] = [
  {
    missionId: "night3-jester",
    event: "the-child-apparition",
    position: [72.776, 1, -433.533],
  },
  {
    missionId: "night3-jester",
    event: "the-weeping-spirit",
    position: [77.57, 1, -473.391],
  },
];

baseMap["night3-child"] = [
  {
    missionId: "night3-child",
    event: "the-child-apparition",
    position: [72.52, 1, -407.82],
  },
  {
    missionId: "night3-child",
    event: "the-weeping-spirit",
    position: [77.014, 1, -419.796],
  },
];

baseMap["night3-voice"] = [
  {
    missionId: "night3-voice",
    event: "the-child-apparition-intense",
    position: [35.565, 1, -530.439],
  },
  {
    missionId: "night3-voice",
    event: "the-weeping-spirit-intense",
    position: [12.303, 1, -545.359],
  },
];


export const MISSION_EVENTS_BY_ID: MissionEventsById = baseMap;

export const ALL_MISSION_EVENTS: MissionEventPlacement[] = Object.values(
  MISSION_EVENTS_BY_ID
).flat();

export const getMissionEventsForMission = (
  missionId: string
): MissionEventPlacement[] => MISSION_EVENTS_BY_ID[missionId] ?? [];
