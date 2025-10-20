import { useCallback, useEffect, useRef, useState } from "react";
import type { JSX } from "react/jsx-runtime";
import type { MutableRefObject } from "react";
import type { Object3D } from "three";
import { useGame } from "../../GameContext";
import { MissionZone } from "./MissionZone";
import { Woman } from "../Ground/SceneObjects/Woman";
import { useMissionUI } from "./MissionUIContext";

type MissionState = "available" | "prompt" | "dialog" | "active" | "completed";

type MissionConfig = {
  id: string;
  pickupPosition: [number, number, number];
  passengerPosition: [number, number, number];
  dropoffPosition: [number, number, number];
  dropoffHint: string;
  reward: number;
  pickupRadius?: number;
  dropoffRadius?: number;
  passengerDialog: string[];
  passengerRotation?: [number, number, number];
  passengerScale?: number;
  timeLimit?: number; // seconds
};

export type MissionTargetInfo = {
  id: string;
  position: [number, number, number];
};

const missionConfigs: MissionConfig[] = [
  {
    id: "mission-tennis",
    pickupPosition: [-26, -1, -20],
    passengerPosition: [-26, 0, -20],
    dropoffPosition: [59, -1, -48],
    dropoffHint: "the tennis courts",
    reward: 350,
    pickupRadius: 3,
    dropoffRadius: 2,
    passengerRotation: [0, Math.PI, 0],
    passengerDialog: [
      "Thanks for stopping! I’m running late for my match.",
      "These roads get busier every day, don’t they?",
      "I heard the courts got resurfaced—can’t wait to see them.",
    ],
    timeLimit: 50,
  },
  {
    id: "mission-docks",
    pickupPosition: [59, 0.012, -58],
    passengerPosition: [59, 0, -58],
    dropoffPosition: [-18, -1, 11],
    dropoffHint: "the city docks",
    reward: 420,
    pickupRadius: 3.5,
    dropoffRadius: 4,
    passengerDialog: [
      "Appreciate the pickup. My boat leaves in a few minutes!",
      "Could you take the river road? It’s usually quicker.",
      "I hope the tide hasn’t held everyone up again.",
    ],
    timeLimit: 50,
  },
  {
    id: "mission-museum",
    pickupPosition: [-33, 0, -22.4],
    passengerPosition: [-33, 0, -22.4],
    dropoffPosition: [25, -1, -53],
    dropoffHint: "the museum plaza",
    reward: 380,
    pickupRadius: 3,
    dropoffRadius: 4,
    passengerDialog: [
      "I’ve got an exhibit opening—thank you for the rescue!",
      "Do you know any shortcuts through downtown?",
      "The plaza should be buzzing right about now.",
    ],
    timeLimit: 50,
  },
  {
    id: "mission-mall",
    pickupPosition: [-12.5, 0.1, -3.45],
    passengerPosition: [-12.5, 0, -3.45],
    dropoffPosition: [46.6, -1, -12],
    dropoffHint: "the shopping district",
    reward: 400,
    pickupRadius: 3,
    dropoffRadius: 4.2,
    passengerDialog: [
      "Perfect timing! The sales end in ten minutes.",
      "Let me know if you spot a faster lane ahead.",
      "I can’t believe how heavy these bags are!",
    ],
    timeLimit: 50,
  },
];

const missionConfigById: Record<string, MissionConfig> = missionConfigs.reduce(
  (acc, config) => {
    acc[config.id] = config;
    return acc;
  },
  {} as Record<string, MissionConfig>
);

type MissionProps = JSX.IntrinsicElements["group"] & {
  taxiRef?: MutableRefObject<Object3D | null>;
  onDestinationChange?: (position: [number, number, number] | null) => void;
  onAvailableMissionTargetsChange?: (targets: MissionTargetInfo[]) => void;
  onPauseChange?: (paused: boolean) => void;
};

type CompletionInfo = {
  missionId: string;
  reward: number;
};

export default function Mission({
  taxiRef,
  onDestinationChange,
  onAvailableMissionTargetsChange,
  onPauseChange,
  ...groupProps
}: MissionProps) {
  const [missionStates, setMissionStates] = useState<
    Record<string, MissionState>
  >(() => {
    const initial: Record<string, MissionState> = {};
    for (const config of missionConfigs) {
      initial[config.id] = "available";
    }
    return initial;
  });
  const [promptMissionId, setPromptMissionId] = useState<string | null>(null);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [completionInfo, setCompletionInfo] = useState<CompletionInfo | null>(
    null
  );
  const [dialogIndex, setDialogIndex] = useState(0);
  const [dialogVisible, setDialogVisible] = useState(false);

  const missionStatesRef = useRef(missionStates);
  const activeMissionIdRef = useRef(activeMissionId);
  const promptMissionIdRef = useRef(promptMissionId);
  const dialogIntervalRef = useRef<number | null>(null);

  // TIMER: new refs and state
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const { setMoney } = useGame();
  // TIMER: include setTimer
  const { setPrompt, setActive, setDialog, setCompletion, setTimer } =
    useMissionUI();

  useEffect(() => {
    missionStatesRef.current = missionStates;
  }, [missionStates]);

  useEffect(() => {
    activeMissionIdRef.current = activeMissionId;
  }, [activeMissionId]);

  useEffect(() => {
    promptMissionIdRef.current = promptMissionId;
  }, [promptMissionId]);

  const handlePickupEnter = useCallback((missionId: string) => {
    const currentState = missionStatesRef.current[missionId];
    if (currentState !== "available") return;
    const currentActive = activeMissionIdRef.current;
    if (currentActive && currentActive !== missionId) return;
    setMissionStates((prev) => ({ ...prev, [missionId]: "prompt" }));
    setPromptMissionId(missionId);
  }, []);

  const handlePickupExit = useCallback((missionId: string) => {
    setPromptMissionId((current) => (current === missionId ? null : current));
    setMissionStates((prev) => {
      if (prev[missionId] !== "prompt") return prev;
      return { ...prev, [missionId]: "available" };
    });
  }, []);

  const handleStartMission = useCallback(() => {
    const missionId = promptMissionIdRef.current;
    if (!missionId) return;

    const config = missionConfigById[missionId];
    if (!config) return;

    // Set to dialog mode first
    setMissionStates((prev) => ({ ...prev, [missionId]: "dialog" }));
    setActiveMissionId(missionId);
    setPromptMissionId(null);
    setDialogIndex(0);
    setDialogVisible(true);
    onPauseChange?.(true); // Pause game

    // Destination is set only after dialog ends
  }, [onPauseChange]);

  const handleDeclineMission = useCallback(() => {
    const missionId = promptMissionIdRef.current;
    if (missionId) {
      setMissionStates((prev) => ({ ...prev, [missionId]: "available" }));
    }
    setPromptMissionId(null);
  }, []);

  useEffect(() => {
    if (!onAvailableMissionTargetsChange) {
      return;
    }
    const targets: MissionTargetInfo[] = missionConfigs
      .filter((config) => {
        const state = missionStates[config.id];
        return state === "available" || state === "prompt";
      })
      .map((config) => ({
        id: config.id,
        position: [...config.pickupPosition] as [number, number, number],
      }));
    onAvailableMissionTargetsChange(targets);
  }, [missionStates, onAvailableMissionTargetsChange]);

  const handleDropoffEnter = useCallback(
    (missionId: string) => {
      if (missionStatesRef.current[missionId] !== "active") return;
      const config = missionConfigById[missionId];
      if (!config) return;
      setMissionStates((prev) => ({ ...prev, [missionId]: "completed" }));
      setActiveMissionId(null);
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
    },
    [setMoney, onDestinationChange, setTimer]
  );

  // TIMER: countdown effect
  useEffect(() => {
    if (timeLeft === null) return;

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
            setMissionStates((prev) => ({ ...prev, [activeId]: "available" }));
            setActiveMissionId(null);
            setDialogVisible(false);
            setCompletionInfo(null);
            if (onDestinationChange) onDestinationChange(null);
            setTimer({ secondsLeft: 0 }); // Triggers MissionOverlay popup instead of browser alert
          }
          return 0;
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
  }, [timeLeft, onDestinationChange, setTimer]);

  useEffect(() => {
    if (!completionInfo) return;
    const timeout = window.setTimeout(() => setCompletionInfo(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [completionInfo]);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        event.stopPropagation();
        const missionId = activeMissionIdRef.current;
        if (!missionId) return;

        const currentState = missionStatesRef.current[missionId];
        if (currentState !== "dialog") return;

        const config = missionConfigById[missionId];
        if (!config) return;

        setDialogIndex((prev) => {
          const next = prev + 1;
          if (next >= config.passengerDialog.length) {
            // end of dialog
            setDialogVisible(false);
            onPauseChange?.(false); // resume game
            setMissionStates((p) => ({ ...p, [missionId]: "active" }));

            // Set destination and start timer
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

  const promptConfig = promptMissionId
    ? missionConfigById[promptMissionId] ?? null
    : null;
  const activeConfig = activeMissionId
    ? missionConfigById[activeMissionId] ?? null
    : null;
  const completionConfig = completionInfo
    ? missionConfigById[completionInfo.missionId] ?? null
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
    const missionId = activeMissionIdRef.current;
    if (!missionId) return;

    const config = missionConfigById[missionId];
    if (!config) return;

    if (dialogVisible && config.passengerDialog[dialogIndex]) {
      setDialog({ text: config.passengerDialog[dialogIndex] });
    } else {
      setDialog(null);
    }
  }, [dialogVisible, dialogIndex, setDialog]);

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
      {missionConfigs.map((config) => {
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
