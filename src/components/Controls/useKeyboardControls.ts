import { useCallback, useEffect, useState } from "react";
import type { ControlMode, KeyboardState } from "./types";

const relevantKeys = new Set([
  "w",
  "a",
  "s",
  "d",
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "space",
]);

const normalizeKey = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase();
  if (key === " ") return "space";
  return key;
};

export function useKeyboardControls(
  controlMode: ControlMode,
  isPaused: boolean
): {
  keyboardControls: KeyboardState;
  spacePressed: boolean;
  reset: () => void;
} {
  const [keyboardControls, setKeyboardControls] = useState<KeyboardState>({});

  const reset = useCallback(() => {
    setKeyboardControls({});
  }, []);

  useEffect(() => {
    reset();
  }, [controlMode, reset]);

  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      const key = normalizeKey(event);
      if (!relevantKeys.has(key)) return;
      if (isPaused) return;
      setKeyboardControls((controls) => {
        if (controls[key]) return controls;
        return { ...controls, [key]: true };
      });
    };

    const keyUpHandler = (event: KeyboardEvent) => {
      const key = normalizeKey(event);
      if (!relevantKeys.has(key)) return;
      setKeyboardControls((controls) => {
        if (!controls[key]) return controls;
        return { ...controls, [key]: false };
      });
    };

    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);

    return () => {
      window.removeEventListener("keydown", keyDownHandler);
      window.removeEventListener("keyup", keyUpHandler);
    };
  }, [isPaused]);

  return {
    keyboardControls,
    spacePressed: Boolean(keyboardControls.space),
    reset,
  };
}
