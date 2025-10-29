import { MISSIONS_BY_CITY } from "./missionConfig";

export type CollisionStarThresholds = {
  /** Maximum collisions allowed to keep both collision stars. */
  twoStarMax: number;
  /** Maximum collisions allowed to keep at least one collision star. */
  oneStarMax: number;
};

export type TimeStarThresholds = {
  /** Time in seconds required (or better) to earn all three speed stars. */
  targetSeconds: number;
  /** Incremental leniency applied for each lower speed star. */
  stepSeconds: number;
};

export type MissionStatConfig = {
  collisions: CollisionStarThresholds;
  time: TimeStarThresholds;
};

const DEFAULT_COLLISION_THRESHOLDS: CollisionStarThresholds = {
  twoStarMax: 0,
  oneStarMax: 3,
};

const DEFAULT_TIME_SETTINGS: TimeStarThresholds = {
  targetSeconds: 55,
  stepSeconds: 18,
};

function deriveTimeSettings(timeLimit?: number | null): TimeStarThresholds {
  if (!timeLimit || timeLimit <= 0) {
    return DEFAULT_TIME_SETTINGS;
  }

  const target = Math.max(timeLimit * 0.6, timeLimit - 15, 20);
  const step = Math.max(timeLimit * 0.2, 6);

  return {
    targetSeconds: Math.round(target),
    stepSeconds: Math.round(step),
  };
}

const ALL_MISSIONS = Object.values(MISSIONS_BY_CITY).flat();

export const MISSION_STATS: Record<string, MissionStatConfig> = ALL_MISSIONS.reduce(
  (accumulator, mission) => {
    accumulator[mission.id] = {
      collisions: { ...DEFAULT_COLLISION_THRESHOLDS },
      time: deriveTimeSettings(mission.timeLimit),
    };
    return accumulator;
  },
  {} as Record<string, MissionStatConfig>
);

export const DEFAULT_MISSION_STATS: MissionStatConfig = {
  collisions: { ...DEFAULT_COLLISION_THRESHOLDS },
  time: { ...DEFAULT_TIME_SETTINGS },
};

