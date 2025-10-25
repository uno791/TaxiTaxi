export type CityId = "city1" | "city2" | "city3";
export type CityStory = {
  title: string;
  lines: string[];
  continueLabel?: string;
};

export const CITY_SEQUENCE: CityId[] = ["city1", "city2", "city3"];

export const CITY_SPAWN_POINTS: Record<CityId, [number, number, number]> = {
  city1: [-30, 0.5, -25],
  city2: [102, 3, -150],
  city3: [60, 0.5, -448],
};

export const CITY_STORY_DIALOGS: Record<CityId, CityStory> = {
  city1: {
    title: "Night Falls On Old Town",
    lines: [
      "The final passenger waves goodbye as the lamps flicker on across the skyline.",
      "Dispatch crackles in with new coordinates—another district needs a reliable driver.",
      "You grip the wheel, ready to chart a new route through unfamiliar streets.",
    ],
    continueLabel: "Drive to City Two",
  },
  city2: {
    title: "Pulse Of The Tech Corridor",
    lines: [
      "Prototype drones zip overhead while the neon Boulevard fades behind you.",
      "Investors cheer, engineers breathe again, and your cab slips quietly into the night.",
      "There’s one more call—an outpost beyond the megacity, rumors say it touches the clouds.",
    ],
    continueLabel: "Depart for City Three",
  },
  city3: {
    title: "Horizons Above The Bay",
    lines: [
      "Cargo shuttles ascend toward the orbital lift, their lights reflected in the tide.",
      "You delivered every passenger in time; the station chief salutes as the wind picks up.",
      "Beyond the stratosphere awaits a future route. For tonight, the cab can finally rest.",
    ],
    continueLabel: "Continue",
  },
};
