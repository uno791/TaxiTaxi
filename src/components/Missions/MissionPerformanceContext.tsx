import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import type { ReactNode } from "react";

type MissionPerformanceBreakdownKey = "speed" | "safety" | "smooth";

export type MissionPerformanceBreakdown = {
  key: MissionPerformanceBreakdownKey;
  achieved: boolean;
  bonus: number;
  label: string;
};

export type MissionPerformanceResult = {
  missionId: string;
  stars: number;
  bonus: number;
  breakdown: MissionPerformanceBreakdown[];
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

export function MissionPerformanceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const currentMissionIdRef = useRef<string | null>(null);
  const countersRef = useRef<PerformanceCounters>({ ...INITIAL_COUNTERS });

  const beginMission = useCallback((missionId: string) => {
    currentMissionIdRef.current = missionId;
    countersRef.current = { ...INITIAL_COUNTERS };
  }, []);

  const abandonMission = useCallback(() => {
    currentMissionIdRef.current = null;
    countersRef.current = { ...INITIAL_COUNTERS };
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
      const hardBrakes = counters.hardBrakes;
      currentMissionIdRef.current = null;
      countersRef.current = { ...INITIAL_COUNTERS };

      const effectiveTimeLimit = timeLimit ?? null;
      const hasTimer = Boolean(
        effectiveTimeLimit && effectiveTimeLimit > 0 && typeof timeLeft === "number"
      );
      const timeRatio =
        hasTimer && effectiveTimeLimit
          ? clamp((timeLeft ?? 0) / effectiveTimeLimit, 0, 1)
          : 0;
      const speedAchieved = hasTimer ? timeRatio >= 0.35 : false;
      const safetyAchieved = collisions === 0;
      const smoothAchieved = hardBrakes <= 1;

      const speedBonus = speedAchieved
        ? Math.max(50, Math.round(baseReward * (0.12 + timeRatio * 0.12)))
        : 0;
      const safetyBonus = safetyAchieved
        ? Math.round(baseReward * 0.08)
        : 0;
      const smoothBonus = smoothAchieved
        ? Math.round(baseReward * 0.06)
        : 0;

      const achievedCount =
        (speedAchieved ? 1 : 0) +
        (safetyAchieved ? 1 : 0) +
        (smoothAchieved ? 1 : 0);
      const stars = clamp(achievedCount > 0 ? achievedCount + 1 : 1, 1, 3);

      const breakdown: MissionPerformanceBreakdown[] = [
        {
          key: "speed",
          achieved: speedAchieved,
          bonus: speedBonus,
          label: "Beat the clock",
        },
        {
          key: "safety",
          achieved: safetyAchieved,
          bonus: safetyBonus,
          label: "No collisions",
        },
        {
          key: "smooth",
          achieved: smoothAchieved,
          bonus: smoothBonus,
          label: "Smooth braking",
        },
      ];

      const totalBonus = speedBonus + safetyBonus + smoothBonus;

      return {
        missionId,
        stars,
        bonus: totalBonus,
        breakdown,
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
