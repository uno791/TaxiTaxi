import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import type { ReactNode } from "react";
import {
  DEFAULT_MISSION_STATS,
  MISSION_STATS,
  type CollisionStarThresholds,
  type MissionStatConfig,
  type TimeStarThresholds,
} from "./missionStats";

type MissionPerformanceBreakdownKey = "collisions" | "time";

export type MissionStarEvent = {
  starNumber: number;
  key: MissionPerformanceBreakdownKey;
  label: string;
  detail: string;
};

export type MissionPerformanceBreakdown = {
  key: MissionPerformanceBreakdownKey;
  label: string;
  starsEarned: number;
  maxStars: number;
  bonus: number;
  bonusPerStar: number;
  value: number | null;
  thresholds: CollisionStarThresholds | TimeStarThresholds;
  nextStar?: {
    collisionsToReduce?: number | null;
    secondsToSave?: number | null;
  };
};

export type MissionPerformanceResult = {
  missionId: string;
  totalStars: number;
  collisionStars: number;
  timeStars: number;
  collisions: number;
  timeTakenSeconds: number | null;
  bonus: number;
  breakdown: MissionPerformanceBreakdown[];
  starEvents: MissionStarEvent[];
};

type MissionPerformanceContextValue = {
  beginMission: (missionId: string) => void;
  completeMission: (params: {
    missionId: string;
    baseReward: number;
    timeLimit?: number;
    timeLeft?: number | null;
  }) => MissionPerformanceResult;
  abandonMission: () => void;
  registerCollision: () => void;
  registerHardBrake: () => void;
};

const MissionPerformanceContext = createContext<
  MissionPerformanceContextValue | undefined
>(undefined);

type PerformanceCounters = {
  collisions: number;
  hardBrakes: number;
};

const INITIAL_COUNTERS: PerformanceCounters = {
  collisions: 0,
  hardBrakes: 0,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function secondsBetween(start: number | null): number | null {
  if (start === null) return null;
  const now =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  return Math.max(0, (now - start) / 1000);
}

export function MissionPerformanceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const currentMissionIdRef = useRef<string | null>(null);
  const countersRef = useRef<PerformanceCounters>({ ...INITIAL_COUNTERS });
  const startTimeRef = useRef<number | null>(null);

  const beginMission = useCallback((missionId: string) => {
    currentMissionIdRef.current = missionId;
    countersRef.current = { ...INITIAL_COUNTERS };
    startTimeRef.current =
      typeof performance !== "undefined" ? performance.now() : Date.now();
  }, []);

  const abandonMission = useCallback(() => {
    currentMissionIdRef.current = null;
    countersRef.current = { ...INITIAL_COUNTERS };
    startTimeRef.current = null;
  }, []);

  const registerCollision = useCallback(() => {
    if (!currentMissionIdRef.current) return;
    countersRef.current = {
      ...countersRef.current,
      collisions: countersRef.current.collisions + 1,
    };
  }, []);

  const registerHardBrake = useCallback(() => {
    if (!currentMissionIdRef.current) return;
    countersRef.current = {
      ...countersRef.current,
      hardBrakes: countersRef.current.hardBrakes + 1,
    };
  }, []);

  const completeMission = useCallback(
    ({
      missionId,
      baseReward,
      timeLimit,
      timeLeft,
    }: {
      missionId: string;
      baseReward: number;
      timeLimit?: number;
      timeLeft?: number | null;
    }): MissionPerformanceResult => {
      const counters = countersRef.current;
      const collisions = counters.collisions;
      currentMissionIdRef.current = null;
      countersRef.current = { ...INITIAL_COUNTERS };

      const missionStats: MissionStatConfig =
        MISSION_STATS[missionId] ?? DEFAULT_MISSION_STATS;

      const collisionThresholds = missionStats.collisions;
      let collisionStars = 0;
      if (collisions <= collisionThresholds.twoStarMax) {
        collisionStars = 2;
      } else if (collisions <= collisionThresholds.oneStarMax) {
        collisionStars = 1;
      }

      const collisionBonusPerStar = Math.max(
        8,
        Math.round(baseReward * 0.05)
      );
      const collisionBonus = collisionStars * collisionBonusPerStar;

      const collisionsToNextStar =
        collisionStars >= 2
          ? null
          : collisionStars === 1
          ? Math.max(0, collisions - collisionThresholds.twoStarMax)
          : Math.max(0, collisions - collisionThresholds.oneStarMax);

      let elapsedSeconds = secondsBetween(startTimeRef.current);
      if (
        (elapsedSeconds === null || Number.isNaN(elapsedSeconds)) &&
        typeof timeLimit === "number" &&
        typeof timeLeft === "number"
      ) {
        elapsedSeconds = Math.max(0, timeLimit - timeLeft);
      }
      startTimeRef.current = null;

      const timeThresholds = missionStats.time;
      const thresholdsArray = [
        timeThresholds.targetSeconds,
        timeThresholds.targetSeconds + timeThresholds.stepSeconds,
        timeThresholds.targetSeconds + timeThresholds.stepSeconds * 2,
      ];

      let timeStars = 0;
      if (elapsedSeconds !== null) {
        if (elapsedSeconds <= thresholdsArray[0]) {
          timeStars = 3;
        } else if (elapsedSeconds <= thresholdsArray[1]) {
          timeStars = 2;
        } else if (elapsedSeconds <= thresholdsArray[2]) {
          timeStars = 1;
        }
      }

      const timeBonusPerStar = Math.max(6, Math.round(baseReward * 0.04));
      const timeBonus = timeStars * timeBonusPerStar;

      let secondsToNextStar: number | null = null;
      if (elapsedSeconds !== null && timeStars < 3) {
        const nextThreshold =
          timeStars === 2
            ? thresholdsArray[0]
            : timeStars === 1
            ? thresholdsArray[1]
            : thresholdsArray[2];
        secondsToNextStar = Math.max(0, elapsedSeconds - nextThreshold);
      }

      const totalStars = collisionStars + timeStars;
      const totalBonus = collisionBonus + timeBonus;

      const breakdown: MissionPerformanceBreakdown[] = [
        {
          key: "collisions",
          label: "Defensive driving",
          starsEarned: collisionStars,
          maxStars: 2,
          bonus: collisionBonus,
          bonusPerStar: collisionBonusPerStar,
          value: collisions,
          thresholds: collisionThresholds,
          nextStar: {
            collisionsToReduce:
              collisionsToNextStar !== null && collisionsToNextStar > 0
                ? collisionsToNextStar
                : null,
            secondsToSave: null,
          },
        },
        {
          key: "time",
          label: "Speed run",
          starsEarned: timeStars,
          maxStars: 3,
          bonus: timeBonus,
          bonusPerStar: timeBonusPerStar,
          value: elapsedSeconds,
          thresholds: timeThresholds,
          nextStar: {
            collisionsToReduce: null,
            secondsToSave:
              secondsToNextStar !== null && secondsToNextStar > 0
                ? secondsToNextStar
                : null,
          },
        },
      ];

      const starEvents: MissionStarEvent[] = [];
      let starCounter = 0;
      for (let index = 0; index < collisionStars; index += 1) {
        starCounter += 1;
        starEvents.push({
          starNumber: starCounter,
          key: "collisions",
          label: "Defensive driving",
          detail: `${collisions} collision${collisions === 1 ? "" : "s"}`,
        });
      }
      if (elapsedSeconds !== null) {
        for (let index = 0; index < timeStars; index += 1) {
          starCounter += 1;
          starEvents.push({
            starNumber: starCounter,
            key: "time",
            label: "Speed run",
            detail: `${elapsedSeconds.toFixed(1)}s finish`,
          });
        }
      }

      return {
        missionId,
        totalStars: clamp(totalStars, 0, 5),
        collisionStars,
        timeStars,
        collisions,
        timeTakenSeconds: elapsedSeconds,
        bonus: totalBonus,
        breakdown,
        starEvents,
      };
    },
    []
  );

  const value = useMemo(
    () => ({
      beginMission,
      completeMission,
      abandonMission,
      registerCollision,
      registerHardBrake,
    }),
    [abandonMission, beginMission, completeMission, registerCollision, registerHardBrake]
  );

  return (
    <MissionPerformanceContext.Provider value={value}>
      {children}
    </MissionPerformanceContext.Provider>
  );
}

export function useMissionPerformance() {
  const ctx = useContext(MissionPerformanceContext);
  if (!ctx) {
    throw new Error(
      "useMissionPerformance must be used within a MissionPerformanceProvider"
    );
  }
  return ctx;
}
