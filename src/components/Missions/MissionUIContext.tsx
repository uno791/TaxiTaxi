import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

type MissionPromptState = {
  dropoffHint: string;
  reward: number;
  onStart: () => void;
  onDecline: () => void;
};

type MissionActiveState = {
  dropoffHint: string;
};

type MissionDialogState = {
  text: string;
};

type MissionCompletionState = {
  reward: number;
};

type MissionTimerState = {
  secondsLeft: number;
};

type MissionUIContextValue = {
  prompt: MissionPromptState | null;
  active: MissionActiveState | null;
  dialog: MissionDialogState | null;
  completion: MissionCompletionState | null;
  timer: MissionTimerState | null;
  setPrompt: React.Dispatch<React.SetStateAction<MissionPromptState | null>>;
  setActive: React.Dispatch<React.SetStateAction<MissionActiveState | null>>;
  setDialog: React.Dispatch<React.SetStateAction<MissionDialogState | null>>;
  setCompletion: React.Dispatch<
    React.SetStateAction<MissionCompletionState | null>
  >;
  setTimer: React.Dispatch<React.SetStateAction<MissionTimerState | null>>;
};

const MissionUIContext = createContext<MissionUIContextValue | undefined>(
  undefined
);

export function MissionUIProvider({ children }: { children: ReactNode }) {
  const [prompt, setPrompt] = useState<MissionPromptState | null>(null);
  const [active, setActive] = useState<MissionActiveState | null>(null);
  const [dialog, setDialog] = useState<MissionDialogState | null>(null);
  const [completion, setCompletion] = useState<MissionCompletionState | null>(
    null
  );
  const [timer, setTimer] = useState<MissionTimerState | null>(null);

  const value = useMemo(
    () => ({
      prompt,
      active,
      dialog,
      completion,
      timer,
      setPrompt,
      setActive,
      setDialog,
      setCompletion,
      setTimer,
    }),
    [prompt, active, dialog, completion, timer]
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
