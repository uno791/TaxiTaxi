import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type {
  MissionPerformanceBreakdown,
  MissionStarEvent,
} from "./MissionPerformanceContext";
import type {
  MissionPassengerModelId,
  MissionPassengerPreviewConfig,
} from "./missionConfig";

export type MissionDebugEntry = {
  id: string;
  label: string;
  reward: number;
  dropoffHint: string;
  passengerModel?: MissionPassengerModelId;
};

type MissionPromptState = {
  dropoffHint: string;
  reward: number;
  onStart: () => void;
  onDecline: () => void;
};

type MissionActiveState = {
  dropoffHint: string;
};

export type MissionDialogSpeaker =
  | "driver"
  | "passenger"
  | "narration"
  | "internal"
  | "radio";

export type MissionDialogOption = {
  id: string;
  label: string;
  onSelect: () => void;
};

export type MissionDialogAutoAdvance = {
  nextIndex?: number;
  delayMs?: number;
};

export type MissionDialogState = {
  id: string;
  speaker: MissionDialogSpeaker;
  speakerLabel: string;
  text: string;
  options?: MissionDialogOption[];
  onContinue?: () => void;
  passengerModel?: MissionPassengerModelId;
  passengerPreview?: MissionPassengerPreviewConfig;
  autoAdvance?: MissionDialogAutoAdvance;
};

export type MissionCompletionState = {
  reward: number;
  bonus?: number;
  stars?: number;
  breakdown?: MissionPerformanceBreakdown[];
  collisionStars?: number;
  timeStars?: number;
  collisions?: number;
  timeTakenSeconds?: number | null;
  starEvents?: MissionStarEvent[];
};

type MissionTimerState = {
  secondsLeft: number;
};

type MissionUIContextValue = {
  prompt: MissionPromptState | null;
  active: MissionActiveState | null;
  dialog: MissionDialogState | null;
  dialogTyping: boolean;
  completion: MissionCompletionState | null;
  timer: MissionTimerState | null;
  setPrompt: React.Dispatch<React.SetStateAction<MissionPromptState | null>>;
  setActive: React.Dispatch<React.SetStateAction<MissionActiveState | null>>;
  setDialog: React.Dispatch<React.SetStateAction<MissionDialogState | null>>;
  setDialogTyping: React.Dispatch<React.SetStateAction<boolean>>;
  setCompletion: React.Dispatch<
    React.SetStateAction<MissionCompletionState | null>
  >;
  setTimer: React.Dispatch<React.SetStateAction<MissionTimerState | null>>;
  missionFailureActive: boolean;
  setMissionFailureActive: React.Dispatch<React.SetStateAction<boolean>>;
  missionFailureMessage: string | null;
  setMissionFailureMessage: React.Dispatch<React.SetStateAction<string | null>>;
  debugMissions: MissionDebugEntry[];
  setDebugMissions: React.Dispatch<React.SetStateAction<MissionDebugEntry[]>>;
  debugStartMission?: (missionId: string) => void;
  setDebugStartMission: React.Dispatch<
    React.SetStateAction<((missionId: string) => void) | undefined>
  >;
};

const MissionUIContext = createContext<MissionUIContextValue | undefined>(
  undefined
);

export function MissionUIProvider({ children }: { children: ReactNode }) {
  const [prompt, setPrompt] = useState<MissionPromptState | null>(null);
  const [active, setActive] = useState<MissionActiveState | null>(null);
  const [dialog, setDialog] = useState<MissionDialogState | null>(null);
  const [dialogTyping, setDialogTyping] = useState(false);
  const [completion, setCompletion] = useState<MissionCompletionState | null>(
    null
  );
  const [timer, setTimer] = useState<MissionTimerState | null>(null);
  const [missionFailureActive, setMissionFailureActive] = useState(false);
  const [missionFailureMessage, setMissionFailureMessage] = useState<
    string | null
  >(null);
  const [debugMissions, setDebugMissions] = useState<MissionDebugEntry[]>([]);
  const [debugStartMission, setDebugStartMission] = useState<
    ((missionId: string) => void) | undefined
  >(undefined);

  const value = useMemo(
    () => ({
      prompt,
      active,
      dialog,
      dialogTyping,
      completion,
      timer,
      setPrompt,
      setActive,
      setDialog,
      setDialogTyping,
      setCompletion,
      setTimer,
      missionFailureActive,
      setMissionFailureActive,
      missionFailureMessage,
      setMissionFailureMessage,
      debugMissions,
      setDebugMissions,
      debugStartMission,
      setDebugStartMission,
    }),
    [
      prompt,
      active,
      dialog,
      dialogTyping,
      completion,
      timer,
      missionFailureActive,
      missionFailureMessage,
      debugMissions,
      debugStartMission,
    ]
  );

  return (
    <MissionUIContext.Provider value={value}>
      {children}
    </MissionUIContext.Provider>
  );
}

export function useMissionUI() {
  const ctx = useContext(MissionUIContext);
  if (!ctx) {
    throw new Error("useMissionUI must be used inside MissionUIProvider");
  }
  return ctx;
}
