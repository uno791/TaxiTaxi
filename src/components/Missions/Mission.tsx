import { useCallback, useEffect, useRef, useState } from "react";
import type { JSX } from "react/jsx-runtime";
import type { MutableRefObject } from "react";
import type { Object3D } from "three";
import { useGame } from "../../GameContext";
import { MissionZone } from "./MissionZone";
import { Woman } from "../Ground/SceneObjects/Woman";
import { useMissionUI } from "./MissionUIContext";
import type { CityId } from "../../constants/cities";
import type { MissionConfig } from "./missionConfig";

type MissionState = "available" | "prompt" | "dialog" | "active" | "completed";

export type MissionTargetInfo = {
  id: string;
  position: [number, number, number];
};

const createInitialMissionState = (
  missions: MissionConfig[]
): Record<string, MissionState> => {
  const initialState: Record<string, MissionState> = {};
  for (const config of missions) {
    initialState[config.id] = "available";
  }
  return initialState;
};

type MissionProps = JSX.IntrinsicElements["group"] & {
  taxiRef?: MutableRefObject<Object3D | null>;
  missions: MissionConfig[];
  cityId: CityId;
  onDestinationChange?: (position: [number, number, number] | null) => void;
  onAvailableMissionTargetsChange?: (targets: MissionTargetInfo[]) => void;
  onPauseChange?: (paused: boolean) => void;
  onAllMissionsCompleted?: (cityId: CityId) => void;
};

type CompletionInfo = {
  missionId: string;
  reward: number;
};

export default function Mission({
  taxiRef,
  missions,
  cityId,
  onDestinationChange,
  onAvailableMissionTargetsChange,
  onPauseChange,
  onAllMissionsCompleted,
  ...groupProps
}: MissionProps) {
  const [missionStates, setMissionStates] = useState<
    Record<string, MissionState>
  >(() => createInitialMissionState(missions));
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

  const missionStatesRef = useRef(missionStates);
  const activeMissionIdRef = useRef(activeMissionId);
  const promptMissionIdRef = useRef(promptMissionId);
  const dialogIntervalRef = useRef<number | null>(null);

  // TIMER: new refs and state
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const { setMoney, gameOver } = useGame();
  // TIMER: include setTimer
  const { setPrompt, setActive, setDialog, setCompletion, setTimer } =
    useMissionUI();
  const lastGameOverRef = useRef(gameOver);

  useEffect(() => {
    const initialState = createInitialMissionState(missions);
    missionStatesRef.current = initialState;
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
    if (onDestinationChange) {
      onDestinationChange(null);
    }
  }, [
    missions,
    cityId,
    onDestinationChange,
    setMissionStates,
    setPromptMissionId,
    setActiveMissionId,
    setCompletionInfo,
    setDialogVisible,
    setDialogIndex,
    setTimeLeft,
    setTimer,
  ]);

  useEffect(() => {
    if (typeof Audio === "undefined") return;

    const startSound = new Audio("/sounds/start-mission.wav");
    startSound.preload = "auto";
    startSound.volume = 0.7;

    const winSound = new Audio("/sounds/win-mission.wav");
    winSound.preload = "auto";
    winSound.volume = 0.75;

    const loseSound = new Audio("/sounds/lose-mission.wav");
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

  useEffect(() => {
    if (gameOver && !lastGameOverRef.current) {
      playMissionLoseSound();
      setMissionStates((prev) => {
        let mutated = false;
        const next: Record<string, MissionState> = { ...prev };
        for (const key of Object.keys(next)) {
          if (next[key] !== "available") {
            next[key] = "available";
            mutated = true;
          }
        }
        if (mutated) {
          missionStatesRef.current = next;
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
      if (onDestinationChange) {
        onDestinationChange(null);
      }
    }
    lastGameOverRef.current = gameOver;
  }, [
    gameOver,
    onDestinationChange,
    playMissionLoseSound,
    setMissionStates,
    setActiveMissionId,
    setPromptMissionId,
    setDialogVisible,
    setCompletionInfo,
    setTimeLeft,
    setTimer,
  ]);

  const handlePickupEnter = useCallback(
    (missionId: string) => {
      const currentState = missionStatesRef.current[missionId];
      if (currentState !== "available") return;
      const currentActive = activeMissionIdRef.current;
      if (currentActive && currentActive !== missionId) return;
      setMissionStates((prev) => {
        if (prev[missionId] === "prompt") return prev;
        const next = { ...prev, [missionId]: "prompt" };
        missionStatesRef.current = next;
        return next;
      });
      setPromptMissionId(missionId);
      promptMissionIdRef.current = missionId;
    },
    [setMissionStates, setPromptMissionId]
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
      setMissionStates((prev) => {
        if (prev[missionId] !== "prompt") return prev;
        const next = { ...prev, [missionId]: "available" };
        missionStatesRef.current = next;
        return next;
      });
    },
    [setMissionStates, setPromptMissionId]
  );

  const handleStartMission = useCallback(() => {
    const missionId = promptMissionIdRef.current;
    if (!missionId) return;

    const config = missionConfigByIdRef.current[missionId];
    if (!config) return;

    // Enter dialog mode first (do NOT start mission/timer yet)
    setMissionStates((prev) => {
      const current = prev[missionId];
      if (current === "active" || current === "dialog") return prev;
      const next = { ...prev, [missionId]: "dialog" };
      missionStatesRef.current = next;
      return next;
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
    setMissionStates,
    setActiveMissionId,
    setPromptMissionId,
    setDialogIndex,
    setDialogVisible,
    onPauseChange,
  ]);

  const handleDeclineMission = useCallback(() => {
    const missionId = promptMissionIdRef.current;
    if (missionId) {
      setMissionStates((prev) => {
        if (prev[missionId] === "available") return prev;
        const next = { ...prev, [missionId]: "available" };
        missionStatesRef.current = next;
        return next;
      });
    }
    setPromptMissionId(null);
    promptMissionIdRef.current = null;
  }, [setMissionStates, setPromptMissionId]);

  useEffect(() => {
    if (!onAvailableMissionTargetsChange) {
      return;
    }
    const targets: MissionTargetInfo[] = missions
      .filter((config) => {
        const state = missionStates[config.id];
        return state === "available" || state === "prompt";
      })
      .map((config) => ({
        id: config.id,
        position: [...config.pickupPosition] as [number, number, number],
      }));
    onAvailableMissionTargetsChange(targets);
  }, [missionStates, missions, onAvailableMissionTargetsChange]);

  const checkForCityCompletion = useCallback(() => {
    if (!missions.length) return;
    const allCompleted = missions.every(
      (config) => missionStatesRef.current[config.id] === "completed"
    );
    if (allCompleted) {
      onAllMissionsCompleted?.(cityId);
    }
  }, [missions, onAllMissionsCompleted, cityId]);

  const handleDropoffEnter = useCallback(
    (missionId: string) => {
      if (missionStatesRef.current[missionId] !== "active") return;
      const config = missionConfigByIdRef.current[missionId];
      if (!config) return;
      let completionApplied = false;
      setMissionStates((prev) => {
        if (prev[missionId] !== "active") return prev;
        const next = { ...prev, [missionId]: "completed" };
        missionStatesRef.current = next;
        completionApplied = true;
        return next;
      });
      if (!completionApplied) return;
      setActiveMissionId(null);
      activeMissionIdRef.current = null;
      setPromptMissionId(null);
      promptMissionIdRef.current = null;
      setDialogVisible(false);
      setMoney((value) => value + config.reward);
      setCompletionInfo({ missionId, reward: config.reward });
      if (onDestinationChange) {
        onDestinationChange(null);
      }

      // TIMER: stop on success
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimer(null);
      setTimeLeft(null);
      playMissionWinSound();
      checkForCityCompletion();
    },
    [
      checkForCityCompletion,
      onDestinationChange,
      playMissionWinSound,
      setActiveMissionId,
      setCompletionInfo,
      setDialogVisible,
      setPromptMissionId,
      setMissionStates,
      setMoney,
      setTimeLeft,
      setTimer,
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
            setMissionStates((prevStates) => {
              if (prevStates[activeId] === "available") return prevStates;
              const nextStates = { ...prevStates, [activeId]: "available" };
              missionStatesRef.current = nextStates;
              return nextStates;
            });
            setActiveMissionId(null);
            activeMissionIdRef.current = null;
            setPromptMissionId(null);
            promptMissionIdRef.current = null;
            setDialogVisible(false);
            setCompletionInfo(null);
            if (onDestinationChange) onDestinationChange(null);
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
    setMissionStates,
    setPromptMissionId,
    setTimer,
  ]);

  // DIALOG: handle Spacebar to progress dialog
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        event.stopPropagation();
        const missionId = activeMissionIdRef.current;
        if (!missionId) return;

        const currentState = missionStatesRef.current[missionId];
        if (currentState !== "dialog") return;

        const config = missionConfigByIdRef.current[missionId];
        if (!config) return;

        setDialogIndex((prev) => {
          const next = prev + 1;
          if (next >= config.passengerDialog.length) {
            // End of dialog: start mission
            setDialogVisible(false);
            onPauseChange?.(false); // resume game
            setMissionStates((p) => {
              const updated = { ...p, [missionId]: "active" };
              missionStatesRef.current = updated;
              return updated;
            });

            if (onDestinationChange)
              onDestinationChange(config.dropoffPosition);
            const limit = config?.timeLimit ?? 30;
            setTimeLeft(limit);
            setTimer({ secondsLeft: limit });
            return prev;
          }
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onDestinationChange, onPauseChange, setTimer]);

  useEffect(() => {
    if (!completionInfo) return;
    const timeout = window.setTimeout(() => setCompletionInfo(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [completionInfo]);

  useEffect(() => {
    const missionId = activeMissionIdRef.current;
    if (!missionId) return;

    const config = missionConfigByIdRef.current[missionId];
    if (!config) return;

    if (dialogVisible && config.passengerDialog[dialogIndex]) {
      setDialog({ text: config.passengerDialog[dialogIndex] });
    } else {
      setDialog(null);
    }
  }, [dialogVisible, dialogIndex, setDialog]);

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

  const activeDialog =
    activeConfig && activeConfig.passengerDialog.length > 0
      ? activeConfig.passengerDialog[
          dialogIndex % activeConfig.passengerDialog.length
        ]
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
    if (completionInfo && completionConfig) {
      setCompletion({ reward: completionInfo.reward });
    } else {
      setCompletion(null);
    }
  }, [completionInfo, completionConfig, setCompletion]);

  useEffect(() => {
    return () => {
      setPrompt(null);
      setActive(null);
      setDialog(null);
      setCompletion(null);
      setTimer(null); // TIMER: reset on unmount
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
    onDestinationChange,
  ]);

  return (
    <group {...groupProps}>
      {missions.map((config) => {
        const missionState = missionStates[config.id];
        const pickupActive =
          missionState === "available" || missionState === "prompt";
        const dropoffActive = missionState === "active";

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

            {pickupActive && (
              <Woman
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
          </group>
        );
      })}
    </group>
  );
}
