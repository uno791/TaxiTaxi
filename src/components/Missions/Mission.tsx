import { useCallback, useEffect, useRef, useState } from "react";
import type { JSX } from "react/jsx-runtime";
import type { MutableRefObject } from "react";
import { Vector3, type Object3D } from "three";
import { useGame } from "../../GameContext";
import { MissionZone } from "./MissionZone";
import { PassengerModel } from "../Ground/SceneObjects/PassengerModel";
import { useMissionUI } from "./MissionUIContext";
import type { CityId } from "../../constants/cities";
import type { MissionConfig, MissionDialogueEntry } from "./missionConfig";
import {
  useMissionPerformance,
  type MissionPerformanceBreakdown,
  type MissionStarEvent,
} from "./MissionPerformanceContext";
import { getMissionEventComponent } from "./events";
import { getMissionEventsForMission } from "./missionEvents";
import { useMusic } from "../../context/MusicContext";

export type MissionState =
  | "locked"
  | "available"
  | "prompt"
  | "dialog"
  | "active"
  | "completed";

export type MissionResumeState = {
  completedMissionIds: string[];
  nextMissionId: string | null;
};

export type MissionProgressSummary = {
  cityId: CityId;
  activeMissionId: string | null;
  nextMissionId: string | null;
  completedMissionIds: string[];
};

export type MissionTargetInfo = {
  id: string;
  position: [number, number, number];
};

const createInitialMissionState = (
  missions: MissionConfig[],

  unlockAll: boolean,
  resume?: MissionResumeState | null
): Record<string, MissionState> => {
  const initialState: Record<string, MissionState> = {};
  missions.forEach((config, index) => {
    initialState[config.id] = unlockAll || index === 0 ? "available" : "locked";
  });

  if (!resume) return initialState;

  const completedSet = new Set(resume.completedMissionIds);
  missions.forEach((config) => {
    if (completedSet.has(config.id)) {
      initialState[config.id] = "completed";
    }
  });

  if (resume.nextMissionId) {
    let nextAssigned = false;
    for (const config of missions) {
      if (completedSet.has(config.id)) {
        continue;
      }
      if (!nextAssigned) {
        initialState[config.id] =
          config.id === resume.nextMissionId ? "available" : "locked";
        if (config.id === resume.nextMissionId) {
          nextAssigned = true;
        }
      } else {
        initialState[config.id] = "locked";
      }
    }
  } else if (completedSet.size >= missions.length && missions.length > 0) {
    // All missions completed �?" reflect completion state
    missions.forEach((config) => {
      initialState[config.id] = "completed";
    });
  }

  return initialState;
};

const getMissionDialogue = (config: MissionConfig): MissionDialogueEntry[] => {
  if (config.dialogue && config.dialogue.length > 0) {
    return config.dialogue;
  }
  if (config.passengerDialog && config.passengerDialog.length > 0) {
    return config.passengerDialog.map((text) => ({
      speaker: "passenger",
      text,
    }));
  }
  return [];
};

const getDefaultSpeakerLabel = (
  entry: MissionDialogueEntry,
  config: MissionConfig
) => {
  switch (entry.speaker) {
    case "driver":
      return "Driver";
    case "passenger":
      return config.passengerName ?? "Passenger";
    case "internal":
      return "Driver (Internal)";
    case "radio":
      return "Radio";
    case "narration":
    default:
      return "Narration";
  }
};

type MissionProps = JSX.IntrinsicElements["group"] & {
  taxiRef?: MutableRefObject<Object3D | null>;
  missions: MissionConfig[];
  cityId: CityId;
  onDestinationChange?: (position: [number, number, number] | null) => void;
  onAvailableMissionTargetsChange?: (targets: MissionTargetInfo[]) => void;
  onPauseChange?: (paused: boolean) => void;
  onAllMissionsCompleted?: (cityId: CityId) => void;
  onMissionProgress?: (remaining: number, nextName: string | null) => void;
  onMissionSummaryChange?: (summary: MissionProgressSummary) => void;
  onMissionFailed?: (startPosition: [number, number, number]) => void;
  initialResumeState?: MissionResumeState | null;
  unlockAll?: boolean;
};

type CompletionInfo = {
  missionId: string;
  reward: number;
  bonus?: number;
  stars?: number;
  collisionStars?: number;
  timeStars?: number;
  collisions?: number;
  timeTakenSeconds?: number | null;
  breakdown?: MissionPerformanceBreakdown[];
  starEvents?: MissionStarEvent[];
};

export default function Mission({
  taxiRef,
  missions,
  cityId,
  onDestinationChange,
  onAvailableMissionTargetsChange,
  onPauseChange,
  onAllMissionsCompleted,
  onMissionProgress,
  onMissionSummaryChange,
  onMissionFailed,
  initialResumeState = null,
  unlockAll = false,
  ...groupProps
}: MissionProps) {
  const [missionStates, setMissionStates] = useState<
    Record<string, MissionState>
  >(() => createInitialMissionState(missions, unlockAll, initialResumeState));
  const [promptMissionId, setPromptMissionId] = useState<string | null>(null);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [completionInfo, setCompletionInfo] = useState<CompletionInfo | null>(
    null
  );
  const [dialogIndex, setDialogIndex] = useState(0);
  const [dialogVisible, setDialogVisible] = useState(false);
  const missionStartSoundRef = useRef<HTMLAudioElement | null>(null);
  const missionWinSoundRef = useRef<HTMLAudioElement | null>(null);
  const missionLoseSoundRef = useRef<HTMLAudioElement | null>(null);
  const missionConfigByIdRef = useRef<Record<string, MissionConfig>>({});
  const missionPerformance = useMissionPerformance();
  const resumeStateRef = useRef<MissionResumeState | null>(initialResumeState);
  const missionStartPositionsRef = useRef<
    Record<string, [number, number, number]>
  >({});
  const missionStartScratchRef = useRef(new Vector3());

  const playMissionStartSound = useCallback(() => {
    const audio = missionStartSoundRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }, []);

  const playMissionWinSound = useCallback(() => {
    const audio = missionWinSoundRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }, []);

  const playMissionLoseSound = useCallback(() => {
    const audio = missionLoseSoundRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }, []);

  useEffect(() => {
    const map: Record<string, MissionConfig> = {};
    for (const config of missions) {
      map[config.id] = config;
    }
    missionConfigByIdRef.current = map;
  }, [missions]);

  useEffect(() => {
    if (!onMissionProgress) return;

    const remaining = missions.filter(
      (m) => missionStates[m.id] !== "completed"
    ).length;

    const nextMission =
      missions.find((m) => missionStates[m.id] !== "completed")?.id || null;

    onMissionProgress(remaining, nextMission);
  }, [missions, missionStates, onMissionProgress]);

  useEffect(() => {
    if (!onMissionSummaryChange) return;

    const completedMissionIds = missions
      .filter((m) => missionStates[m.id] === "completed")
      .map((m) => m.id);

    const nextMission =
      missions.find((m) => missionStates[m.id] !== "completed")?.id || null;

    onMissionSummaryChange({
      cityId,
      activeMissionId,
      nextMissionId: nextMission,
      completedMissionIds,
    });
  }, [
    missions,
    missionStates,
    activeMissionId,
    cityId,
    onMissionSummaryChange,
  ]);

  const missionStatesRef = useRef(missionStates);
  const updateMissionStates = useCallback(
    (
      updater: (
        prev: Record<string, MissionState>
      ) => Record<string, MissionState>
    ) =>
      setMissionStates((prev) => {
        const next = updater(prev);
        missionStatesRef.current = next;
        return next;
      }),
    [setMissionStates]
  );
  const activeMissionIdRef = useRef(activeMissionId);
  const promptMissionIdRef = useRef(promptMissionId);
  const dialogIntervalRef = useRef<number | null>(null);

  // TIMER: new refs and state
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const completionDisplayedRef = useRef(false);

  const { suppressPlayback, releasePlayback } = useMusic();
  const suppressedMissionRef = useRef<string | null>(null);
  const { setMoney, gameOver } = useGame();
  // TIMER: include setTimer
  const {
    setPrompt,
    setActive,
    setDialog,
    setCompletion,
    setTimer,
    completion,
    setMissionFailureActive,
    setDialogTyping,
    setMissionFailureMessage,
    setDebugMissions,
    setDebugStartMission,
    setNotification,
  } = useMissionUI();
  const lastGameOverRef = useRef(gameOver);

  useEffect(() => {
    resumeStateRef.current = initialResumeState ?? null;
  }, [initialResumeState]);

  useEffect(() => {
    const resumeState = resumeStateRef.current;
    const initialState = createInitialMissionState(
      missions,
      unlockAll,
      resumeState
    );
    missionStatesRef.current = initialState;
    missionStartPositionsRef.current = {};
    setMissionStates(initialState);
    setPromptMissionId(null);
    promptMissionIdRef.current = null;
    setActiveMissionId(null);
    activeMissionIdRef.current = null;
    setCompletionInfo(null);
    setDialogVisible(false);
    setDialogIndex(0);
    setTimeLeft(null);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimer(null);
    setMissionFailureActive(false);
    setMissionFailureMessage(null);
    if (onDestinationChange) {
      onDestinationChange(null);
    }
    if (suppressedMissionRef.current) {
      releasePlayback();
      suppressedMissionRef.current = null;
    }
    resumeStateRef.current = null;
  }, [
    missions,
    cityId,
    unlockAll,
    onDestinationChange,
    setMissionStates,
    setPromptMissionId,
    setActiveMissionId,
    setCompletionInfo,
    setDialogVisible,
    setDialogIndex,
    setTimeLeft,
    setTimer,
    setMissionFailureActive,
    setMissionFailureMessage,
    releasePlayback,
  ]);

  useEffect(() => {
    if (typeof Audio === "undefined") return;

    const startSound = new Audio("sounds/start-mission.wav");
    startSound.preload = "auto";
    startSound.volume = 0.7;

    const winSound = new Audio("sounds/win-mission.wav");
    winSound.preload = "auto";
    winSound.volume = 0.75;

    const loseSound = new Audio("sounds/lose-mission.wav");
    loseSound.preload = "auto";
    loseSound.volume = 0.75;

    missionStartSoundRef.current = startSound;
    missionWinSoundRef.current = winSound;
    missionLoseSoundRef.current = loseSound;

    return () => {
      startSound.pause();
      winSound.pause();
      loseSound.pause();
      startSound.currentTime = 0;
      winSound.currentTime = 0;
      loseSound.currentTime = 0;
      missionStartSoundRef.current = null;
      missionWinSoundRef.current = null;
      missionLoseSoundRef.current = null;
    };
  }, []);

  useEffect(() => {
    missionStatesRef.current = missionStates;
  }, [missionStates]);

  useEffect(() => {
    activeMissionIdRef.current = activeMissionId;
  }, [activeMissionId]);

  useEffect(() => {
    promptMissionIdRef.current = promptMissionId;
  }, [promptMissionId]);

  const recordMissionStartPosition = useCallback(
    (missionId: string, config: MissionConfig) => {
      let startPosition: [number, number, number];
      const taxi = taxiRef?.current ?? null;
      if (taxi) {
        const scratch = missionStartScratchRef.current;
        taxi.updateMatrixWorld(true);
        taxi.getWorldPosition(scratch);
        startPosition = [scratch.x, scratch.y, scratch.z];
      } else if (config.pickupPosition) {
        startPosition = [
          config.pickupPosition[0],
          config.pickupPosition[1],
          config.pickupPosition[2],
        ];
      } else {
        startPosition = [0, 0, 0];
      }
      missionStartPositionsRef.current[missionId] = startPosition;
    },
    [taxiRef]
  );

  const teleportToMissionStart = useCallback(
    (missionId: string) => {
      const recorded = missionStartPositionsRef.current[missionId];
      let target = recorded;
      if (!target) {
        const config = missionConfigByIdRef.current[missionId];
        if (config?.pickupPosition) {
          target = [
            config.pickupPosition[0],
            config.pickupPosition[1],
            config.pickupPosition[2],
          ];
        }
      }
      if (target && onMissionFailed) {
        onMissionFailed([
          target[0],
          target[1],
          target[2],
        ] as [number, number, number]);
      }
      if (recorded) {
        delete missionStartPositionsRef.current[missionId];
      }
    },
    [onMissionFailed]
  );

  useEffect(() => {
    if (gameOver && !lastGameOverRef.current) {
      const activeId = activeMissionIdRef.current;
      if (activeId) {
        teleportToMissionStart(activeId);
      }
      playMissionLoseSound();
      updateMissionStates((prev) => {
        if (unlockAll) {
          let mutated = false;
          const next: Record<string, MissionState> = {};
          for (const mission of missions) {
            const previousState = prev[mission.id];
            if (previousState !== "available") {
              mutated = true;
            }
            next[mission.id] = "available";
          }
          return mutated ? next : prev;
        }

        let mutated = false;
        const next: Record<string, MissionState> = {};
        let unlocked = false;

        for (const mission of missions) {
          const previousState = prev[mission.id];
          if (previousState === "completed") {
            next[mission.id] = "completed";
            if (next[mission.id] !== previousState) mutated = true;
            continue;
          }

          if (!unlocked) {
            next[mission.id] = "available";
            unlocked = true;
          } else {
            next[mission.id] = "locked";
          }

          if (next[mission.id] !== previousState) mutated = true;
        }

        if (mutated) {
          return next;
        }
        return prev;
      });
      setActiveMissionId(null);
      activeMissionIdRef.current = null;
      setPromptMissionId(null);
      promptMissionIdRef.current = null;
      setDialogVisible(false);
      setCompletionInfo(null);
      setTimeLeft(null);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimer(null);
      setMissionFailureMessage(null);
      if (onDestinationChange) {
        onDestinationChange(null);
      }
      if (suppressedMissionRef.current) {
        releasePlayback();
        suppressedMissionRef.current = null;
      }
    }
    lastGameOverRef.current = gameOver;
  }, [
    gameOver,
    onDestinationChange,
    missions,
    playMissionLoseSound,
    updateMissionStates,
    teleportToMissionStart,
    setActiveMissionId,
    setPromptMissionId,
    setDialogVisible,
    setCompletionInfo,
    setTimeLeft,
    setTimer,
    setMissionFailureMessage,
    unlockAll,
    releasePlayback,
  ]);

  const handlePickupEnter = useCallback(
    (missionId: string) => {
      const currentState = missionStatesRef.current[missionId];
      if (
        currentState !== "available" &&
        !(unlockAll && currentState === "completed")
      ) {
        return;
      }
      const currentActive = activeMissionIdRef.current;
      if (currentActive && currentActive !== missionId) return;
      updateMissionStates((prev) => {
        if (prev[missionId] === "prompt") return prev;
        return {
          ...prev,
          [missionId]: "prompt",
        } as Record<string, MissionState>;
      });
      setPromptMissionId(missionId);
      promptMissionIdRef.current = missionId;
    },
    [updateMissionStates, setPromptMissionId, unlockAll]
  );

  const handlePickupExit = useCallback(
    (missionId: string) => {
      setPromptMissionId((current) => {
        if (current === missionId) {
          promptMissionIdRef.current = null;
          return null;
        }
        return current;
      });
      updateMissionStates((prev) => {
        if (prev[missionId] !== "prompt") return prev;
        return {
          ...prev,
          [missionId]: "available",
        } as Record<string, MissionState>;
      });
    },
    [updateMissionStates, setPromptMissionId]
  );

  const handleStartMission = useCallback(() => {
    const missionId = promptMissionIdRef.current;
    if (!missionId) return;

    const config = missionConfigByIdRef.current[missionId];
    if (!config) return;

    // Enter dialog mode first (do NOT start mission/timer yet)
    updateMissionStates((prev) => {
      const current = prev[missionId];
      if (current === "active" || current === "dialog") return prev;
      return {
        ...prev,
        [missionId]: "dialog",
      } as Record<string, MissionState>;
    });

    setActiveMissionId(missionId);
    activeMissionIdRef.current = missionId;

    setPromptMissionId(null);
    promptMissionIdRef.current = null;

    setDialogIndex(0);
    setDialogVisible(true);

    // Pause gameplay while dialog is showing
    onPauseChange?.(true);

    // Play start sound now; actual driving begins after dialog finishes
    playMissionStartSound();
  }, [
    playMissionStartSound,
    updateMissionStates,
    setActiveMissionId,
    setPromptMissionId,
    setDialogIndex,
    setDialogVisible,
    onPauseChange,
  ]);

  const handleDeclineMission = useCallback(() => {
    const missionId = promptMissionIdRef.current;
    if (missionId) {
      updateMissionStates((prev) => {
        if (prev[missionId] === "available") return prev;
        return {
          ...prev,
          [missionId]: "available",
        } as Record<string, MissionState>;
      });
    }
    setPromptMissionId(null);
    promptMissionIdRef.current = null;
  }, [updateMissionStates, setPromptMissionId]);

  const failActiveMission = useCallback(
    (options?: {
      message?: string;
      setTimerZero?: boolean;
      clearTimeLeft?: boolean;
    }) => {
      const activeId = activeMissionIdRef.current;
      if (!activeId) return false;

      missionPerformance.abandonMission();

      updateMissionStates((prevStates) => {
        if (prevStates[activeId] === "available") return prevStates;
        return {
          ...prevStates,
          [activeId]: "available",
        } as Record<string, MissionState>;
      });

      setActiveMissionId(null);
      activeMissionIdRef.current = null;
      setPromptMissionId(null);
      promptMissionIdRef.current = null;
      setDialogVisible(false);
      setCompletionInfo(null);

      if (options?.clearTimeLeft !== false) {
        setTimeLeft(null);
      }

      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (options?.setTimerZero) {
        setTimer({ secondsLeft: 0 });
      } else {
        setTimer(null);
      }

      if (onDestinationChange) {
        onDestinationChange(null);
      }

      teleportToMissionStart(activeId);

      if (suppressedMissionRef.current === activeId) {
        releasePlayback();
        suppressedMissionRef.current = null;
      }

      setMissionFailureMessage(options?.message ?? "Mission Failed.");

      setMissionFailureActive(true);
      playMissionLoseSound();

      return true;
    },
    [
      missionPerformance,
      updateMissionStates,
      setActiveMissionId,
      setPromptMissionId,
      setDialogVisible,
      setCompletionInfo,
      setTimeLeft,
      setTimer,
      onDestinationChange,
      teleportToMissionStart,
      setMissionFailureMessage,
      setMissionFailureActive,
      playMissionLoseSound,
      releasePlayback,
    ]
  );

  const debugStartMission = useCallback(
    (missionId: string) => {
      const config = missionConfigByIdRef.current[missionId];
      if (!config) return;

      if (suppressedMissionRef.current) {
        releasePlayback();
        suppressedMissionRef.current = null;
      }

      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setMissionFailureActive(false);
      setCompletionInfo(null);
      setDialogVisible(false);
      setDialogIndex(0);
      setTimeLeft(null);
      setTimer(null);

      const activeId = activeMissionIdRef.current;
      if (activeId) {
        if (activeId !== missionId) {
          missionPerformance.abandonMission();
        }
        setActiveMissionId(null);
        activeMissionIdRef.current = null;
      }

      if (onDestinationChange) {
        onDestinationChange(null);
      }

      updateMissionStates((prev) => {
        const next = { ...prev };
        if (
          activeId &&
          activeId !== missionId &&
          next[activeId] !== "completed"
        ) {
          next[activeId] = "available";
        }
        next[missionId] = "prompt";
        return next as Record<string, MissionState>;
      });

      setPromptMissionId(missionId);
      promptMissionIdRef.current = missionId;

      handleStartMission();
    },
    [
      handleStartMission,
      missionPerformance,
      onDestinationChange,
      setActiveMissionId,
      setCompletionInfo,
      setDialogIndex,
      setDialogVisible,
      setMissionFailureActive,
      setPromptMissionId,
      setTimeLeft,
      setTimer,
      updateMissionStates,
      releasePlayback,
    ]
  );

  const showEventWarning = useCallback(
    (missionId: string) => {
      setNotification({
        id: `${missionId}-event-omen`,
        message: "The spirits are upset, be careful.",
        tone: "warning",
        durationMs: 6000,
      });
    },
    [setNotification]
  );

  const concludeDialogAndStartMission = useCallback(
    (missionId: string, config: MissionConfig) => {
      setDialogVisible(false);
      onPauseChange?.(false);
      updateMissionStates(
        (current) =>
          ({
            ...current,
            [missionId]: "active",
          } as Record<string, MissionState>)
      );
      setMissionFailureActive(false);
      recordMissionStartPosition(missionId, config);
      missionPerformance.beginMission(missionId);
      const missionHasEvents =
        getMissionEventsForMission(missionId).length > 0;
      if (missionHasEvents) {
        if (
          suppressedMissionRef.current &&
          suppressedMissionRef.current !== missionId
        ) {
          releasePlayback();
        }
        suppressPlayback();
        suppressedMissionRef.current = missionId;
        showEventWarning(missionId);
      }
      if (onDestinationChange) {
        onDestinationChange(config.dropoffPosition);
      }
      const hasLimit =
        typeof config.timeLimit === "number" && config.timeLimit > 0;
      if (hasLimit) {
        const limit = config.timeLimit as number;
        setTimeLeft(limit);
        setTimer({ secondsLeft: limit });
      } else {
        setTimeLeft(null);
        setTimer(null);
      }
    },
    [
      missionPerformance,
      onDestinationChange,
      onPauseChange,
      updateMissionStates,
      setTimeLeft,
      setTimer,
      recordMissionStartPosition,
      setMissionFailureActive,
      showEventWarning,
      suppressPlayback,
      releasePlayback,
    ]
  );

  const advanceDialog = useCallback(
    (explicitIndex?: number) => {
      const missionId = activeMissionIdRef.current;
      if (!missionId) return;

      const config = missionConfigByIdRef.current[missionId];
      if (!config) return;

      const entries = getMissionDialogue(config);
      if (!entries.length) {
        concludeDialogAndStartMission(missionId, config);
        return;
      }

      setDialogIndex((prev) => {
        const targetIndex =
          typeof explicitIndex === "number" ? explicitIndex : prev + 1;
        if (targetIndex >= entries.length) {
          concludeDialogAndStartMission(missionId, config);
          return prev;
        }
        return targetIndex;
      });
    },
    [concludeDialogAndStartMission]
  );

  useEffect(() => {
    if (!onAvailableMissionTargetsChange) {
      return;
    }
    const targets: MissionTargetInfo[] = missions
      .filter((config) => {
        const state = missionStates[config.id];
        return (
          state === "available" ||
          state === "prompt" ||
          (unlockAll && state === "completed")
        );
      })
      .map((config) => ({
        id: config.id,
        position: [...config.pickupPosition] as [number, number, number],
      }));
    onAvailableMissionTargetsChange(targets);
  }, [missionStates, missions, onAvailableMissionTargetsChange, unlockAll]);

  const checkForCityCompletion = useCallback(() => {
    if (!missions.length || unlockAll) return;
    const allCompleted = missions.every(
      (config) => missionStatesRef.current[config.id] === "completed"
    );
    if (allCompleted) {
      onAllMissionsCompleted?.(cityId);
    }
  }, [missions, onAllMissionsCompleted, cityId, unlockAll]);

  const handleDropoffEnter = useCallback(
    (missionId: string) => {
      if (missionStatesRef.current[missionId] !== "active") return;
      const config = missionConfigByIdRef.current[missionId];
      if (!config) return;

      let completionApplied = false;
      updateMissionStates((prev) => {
        if (prev[missionId] !== "active") return prev;
        completionApplied = true;
        const completionState: MissionState = unlockAll
          ? "available"
          : "completed";
        return {
          ...prev,
          [missionId]: completionState,
        } as Record<string, MissionState>;
      });
      if (!completionApplied) return;

      const performance = missionPerformance.completeMission({
        missionId,
        baseReward: config.reward,
        timeLimit: config.timeLimit,
        timeLeft,
      });
      const finalReward = config.reward + performance.bonus;

      // ✅ Apply money
      setMoney((value) => value + finalReward);

      // ✅ Store completion info (for overlay)
      setCompletionInfo({
        missionId,
        reward: finalReward,
        bonus: performance.bonus,
        stars: performance.totalStars,
        collisionStars: performance.collisionStars,
        timeStars: performance.timeStars,
        collisions: performance.collisions,
        timeTakenSeconds: performance.timeTakenSeconds,
        breakdown: performance.breakdown,
        starEvents: performance.starEvents,
      });

      if (onDestinationChange) {
        onDestinationChange(null);
      }

      delete missionStartPositionsRef.current[missionId];

      // ✅ Stop timer AFTER computing bonus
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimer(null);
      setTimeLeft(null);
      playMissionWinSound();

      // ✅ Clear active mission so overlay hides
      setActive(null);
      setActiveMissionId(null);
      activeMissionIdRef.current = null;

      if (onDestinationChange) {
        onDestinationChange(null);
      }

      if (suppressedMissionRef.current === missionId) {
        releasePlayback();
        suppressedMissionRef.current = null;
      }

      // ✅ Unlock next mission
      if (!unlockAll) {
        const currentIndex = missions.findIndex(
          (mission) => mission.id === missionId
        );
        if (currentIndex >= 0) {
          const nextMission = missions[currentIndex + 1];
          if (nextMission) {
            updateMissionStates((prevStates) => {
              if (prevStates[nextMission.id] !== "locked") return prevStates;
              return {
                ...prevStates,
                [nextMission.id]: "available",
              } as Record<string, MissionState>;
            });
          }
        }
      }

      checkForCityCompletion();
    },
    [
      checkForCityCompletion,
      missions,
      missionPerformance,
      onDestinationChange,
      playMissionWinSound,
      setActiveMissionId,
      setCompletionInfo,
      updateMissionStates,
      setMoney,
      setTimeLeft,
      setTimer,
      timeLeft,
      unlockAll,
      releasePlayback,
    ]
  );

  // TIMER: countdown effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          window.clearInterval(timerRef.current!);
          timerRef.current = null;
          const activeId = activeMissionIdRef.current;
          if (activeId) {
            failActiveMission({
              message: "Mission Failed! Time ran out.",
              setTimerZero: true,
              clearTimeLeft: false,
            });
            missionPerformance.abandonMission();
            updateMissionStates((prevStates) => {
              if (prevStates[activeId] === "available") return prevStates;
              return {
                ...prevStates,
                [activeId]: "available",
              } as Record<string, MissionState>;
            });
            setActiveMissionId(null);
            activeMissionIdRef.current = null;
            setPromptMissionId(null);
            promptMissionIdRef.current = null;
            setDialogVisible(false);
            setCompletionInfo(null);
            if (onDestinationChange) onDestinationChange(null);
            teleportToMissionStart(activeId);
            setTimer({ secondsLeft: 0 }); // Triggers MissionOverlay popup instead of browser alert
            playMissionLoseSound();
          }
          return null;
        }

        const next = prev - 1;
        setTimer({ secondsLeft: next });
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    timeLeft,
    onDestinationChange,
    playMissionLoseSound,
    setActiveMissionId,
    setCompletionInfo,
    setDialogVisible,
    teleportToMissionStart,
    updateMissionStates,
    setPromptMissionId,
    setTimer,
    missionPerformance,
  ]);

  useEffect(() => {
    if (completion) {
      completionDisplayedRef.current = true;
    }
  }, [completion]);

  useEffect(() => {
    if (completionDisplayedRef.current && !completion && completionInfo) {
      completionDisplayedRef.current = false;
      setCompletionInfo(null);
    }
  }, [completion, completionInfo]);

  useEffect(() => {
    if (!completionInfo) return;
    onPauseChange?.(true);
    return () => {
      onPauseChange?.(false);
    };
  }, [completionInfo, onPauseChange]);

  useEffect(() => {
    if (!dialogVisible) {
      setDialog(null);
      setDialogTyping(false);
      return;
    }

    const missionId = activeMissionIdRef.current;
    if (!missionId) {
      setDialog(null);
      setDialogTyping(false);
      return;
    }

    const config = missionConfigByIdRef.current[missionId];
    if (!config) {
      setDialog(null);
      setDialogTyping(false);
      return;
    }

    const entries = getMissionDialogue(config);
    const entry = entries[dialogIndex];
    if (!entry) {
      setDialog(null);
      setDialogTyping(false);
      return;
    }

    const speakerLabel =
      entry.speakerLabel ?? getDefaultSpeakerLabel(entry, config);
    const driverSpeakerLabel =
      entry.speaker === "driver"
        ? speakerLabel
        : getDefaultSpeakerLabel(
            { speaker: "driver", text: "" } as MissionDialogueEntry,
            config
          );

    const options = entry.options
      ? entry.options.map((option, optionIndex) => {
          const optionId = `${missionId}-option-${dialogIndex}-${optionIndex}`;
          const nextIndex =
            typeof option.nextIndex === "number" ? option.nextIndex : undefined;
          return {
            id: optionId,
            label: option.label,
            onSelect: () => {
              setDialog({
                id: `${optionId}-selection`,
                speaker: "driver",
                speakerLabel: driverSpeakerLabel,
                text: option.label,
                passengerModel: config.passengerModel ?? "generic",
                passengerPreview: config.passengerPreview,
                onContinue: () => advanceDialog(nextIndex),
                autoAdvance: {
                  nextIndex,
                  delayMs: 700,
                },
              });
              setDialogTyping(true);
            },
          };
        })
      : undefined;

    setDialog({
      id: `${missionId}-entry-${dialogIndex}`,
      speaker: entry.speaker,
      speakerLabel,
      text: entry.text,
      options,
      onContinue:
        !options || options.length === 0 ? () => advanceDialog() : undefined,
      passengerModel: config.passengerModel ?? "generic",
      passengerPreview: config.passengerPreview,
    });
    setDialogTyping(true);
  }, [advanceDialog, dialogIndex, dialogVisible, setDialog, setDialogTyping]);

  useEffect(() => {
    return () => {
      if (dialogIntervalRef.current) {
        window.clearInterval(dialogIntervalRef.current);
      }
      // TIMER: cleanup
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const promptConfig = promptMissionId
    ? missionConfigByIdRef.current[promptMissionId] ?? null
    : null;
  const activeConfig = activeMissionId
    ? missionConfigByIdRef.current[activeMissionId] ?? null
    : null;
  const completionConfig = completionInfo
    ? missionConfigByIdRef.current[completionInfo.missionId] ?? null
    : null;

  useEffect(() => {
    if (promptConfig) {
      setPrompt({
        dropoffHint: promptConfig.dropoffHint,
        reward: promptConfig.reward,
        onStart: handleStartMission,
        onDecline: handleDeclineMission,
      });
    } else {
      setPrompt(null);
    }
  }, [promptConfig, handleStartMission, handleDeclineMission, setPrompt]);

  useEffect(() => {
    if (activeConfig) {
      setActive({ dropoffHint: activeConfig.dropoffHint });
    } else {
      setActive(null);
    }
  }, [activeConfig, setActive]);

  useEffect(() => {
    setDebugStartMission(() => debugStartMission);
    return () => setDebugStartMission(undefined);
  }, [debugStartMission, setDebugStartMission]);

  useEffect(() => {
    return () => {
      if (suppressedMissionRef.current) {
        releasePlayback();
        suppressedMissionRef.current = null;
      }
    };
  }, [releasePlayback]);

  useEffect(() => {
    setDebugMissions(
      missions.map((config) => ({
        id: config.id,
        label: config.passengerName ?? config.id,
        reward: config.reward,
        dropoffHint: config.dropoffHint,
        passengerModel: config.passengerModel,
      }))
    );
    return () => setDebugMissions([]);
  }, [missions, setDebugMissions]);

  useEffect(() => {
    if (completionInfo && completionConfig) {
      setCompletion({
        reward: completionInfo.reward,
        bonus: completionInfo.bonus ?? 0,
        stars: completionInfo.stars,
        breakdown: completionInfo.breakdown,
        collisionStars: completionInfo.collisionStars,
        timeStars: completionInfo.timeStars,
        collisions: completionInfo.collisions,
        timeTakenSeconds: completionInfo.timeTakenSeconds ?? null,
        starEvents: completionInfo.starEvents,
      });
    } else {
      setCompletion(null);
    }
  }, [completionInfo, completionConfig, setCompletion]);

  useEffect(() => {
    return () => {
      missionPerformance.abandonMission();
      setPrompt(null);
      setActive(null);
      setDialog(null);
      setDialogTyping(false);
      setCompletion(null);
      setTimer(null); // TIMER: reset on unmount
      setMissionFailureActive(false);
      missionStartPositionsRef.current = {};
      setMissionFailureMessage(null);
      if (onDestinationChange) {
        onDestinationChange(null);
      }
    };
  }, [
    setPrompt,
    setActive,
    setDialog,
    setCompletion,
    setTimer,
    setDialogTyping,
    onDestinationChange,
    missionPerformance,
    setMissionFailureActive,
    setMissionFailureMessage,
  ]);

  return (
    <group {...groupProps}>
      {missions.map((config) => {
        const missionState = missionStates[config.id];
        const pickupActive =
          missionState === "available" ||
          missionState === "prompt" ||
          (unlockAll && missionState === "completed");
        const dropoffActive = missionState === "active";

        const missionEventPlacements = getMissionEventsForMission(config.id);

        return (
          <group key={config.id}>
            {pickupActive && (
              <MissionZone
                position={config.pickupPosition}
                scale={1.5}
                radius={config.pickupRadius ?? 3}
                taxiRef={taxiRef}
                onTaxiEnter={() => handlePickupEnter(config.id)}
                onTaxiExit={() => handlePickupExit(config.id)}
              />
            )}

            {pickupActive && config.passengerModel !== "none" && (
              <PassengerModel
                modelId={config.passengerModel ?? "generic"}
                position={config.passengerPosition}
                scale={config.passengerScale ?? 0.5}
                rotation={config.passengerRotation ?? [0, Math.PI, 0]}
              />
            )}

            {dropoffActive && (
              <MissionZone
                position={config.dropoffPosition}
                scale={1.8}
                radius={config.dropoffRadius ?? 4}
                taxiRef={taxiRef}
                onTaxiEnter={() => handleDropoffEnter(config.id)}
              />
            )}

            {missionEventPlacements.map((placement, index) => {
              const EventComponent = getMissionEventComponent(placement.event);
              return (
                <EventComponent
                  key={`${placement.event}-${index}`}
                  position={placement.position}
                  taxiRef={taxiRef}
                  active={
                    missionState === "active" ||
                    (unlockAll && missionState === "completed")
                  }
                  onMissionFailed={(options) =>
                    failActiveMission({
                      message: options?.message,
                      setTimerZero: false,
                    })
                  }
                />
              );
            })}
          </group>
        );
      })}
    </group>
  );
}
