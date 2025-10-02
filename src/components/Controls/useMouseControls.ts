import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { ControlMode, MouseState } from "./types";

const ZERO_MOUSE_STATE: MouseState = {
  accelerate: false,
  brake: false,
  steer: 0,
};

export function useMouseControls(
  controlMode: ControlMode,
  isPaused: boolean
): {
  mouseControls: MouseState;
  reset: () => void;
} {
  const [mouseControls, setMouseControls] = useState<MouseState>({
    ...ZERO_MOUSE_STATE,
  });
  const pointerStateRef = useRef<MouseState>({ ...ZERO_MOUSE_STATE });

  const reset = useCallback(() => {
    pointerStateRef.current = { ...ZERO_MOUSE_STATE };
    setMouseControls({ ...ZERO_MOUSE_STATE });
  }, []);

  useEffect(() => {
    reset();
  }, [controlMode, reset]);

  useEffect(() => {
    if (controlMode !== "mouse") {
      reset();
      return;
    }

    pointerStateRef.current = { ...ZERO_MOUSE_STATE };
    setMouseControls({ ...ZERO_MOUSE_STATE });

    const syncMouseControls = () => {
      setMouseControls({ ...pointerStateRef.current });
    };

    const updateSteerFromPointer = (clientX: number | null) => {
      if (typeof clientX !== "number") return;
      const normalized = THREE.MathUtils.clamp(
        (clientX / window.innerWidth) * 2 - 1,
        -1,
        1
      );

      const steerValue = THREE.MathUtils.clamp(-normalized, -1, 1);
      if (Math.abs(pointerStateRef.current.steer - steerValue) < 0.001) return;

      pointerStateRef.current.steer = steerValue;
      syncMouseControls();
    };

    const releaseButtons = () => {
      const pointer = pointerStateRef.current;
      if (!pointer.accelerate && !pointer.brake) return;
      pointer.accelerate = false;
      pointer.brake = false;
      syncMouseControls();
    };

    const pointerDownHandler = (event: PointerEvent) => {
      if (isPaused) return;
      if (event.button === 2) {
        event.preventDefault();
        if (!pointerStateRef.current.accelerate) {
          pointerStateRef.current.accelerate = true;
          syncMouseControls();
        }
      }
      if (event.button === 0) {
        if (!pointerStateRef.current.brake) {
          pointerStateRef.current.brake = true;
          syncMouseControls();
        }
      }
      updateSteerFromPointer(event.clientX);
    };

    const pointerUpHandler = (event: PointerEvent) => {
      if (isPaused) return;
      if (event.button === 2 && pointerStateRef.current.accelerate) {
        pointerStateRef.current.accelerate = false;
        syncMouseControls();
      }
      if (event.button === 0 && pointerStateRef.current.brake) {
        pointerStateRef.current.brake = false;
        syncMouseControls();
      }
    };

    const pointerMoveHandler = (event: PointerEvent) => {
      if (isPaused) return;
      updateSteerFromPointer(event.clientX);
    };

    const contextMenuHandler = (event: MouseEvent) => {
      event.preventDefault();
    };

    const blurHandler = () => {
      pointerStateRef.current = { ...ZERO_MOUSE_STATE };
      syncMouseControls();
    };

    window.addEventListener("pointerdown", pointerDownHandler);
    window.addEventListener("pointerup", pointerUpHandler);
    window.addEventListener("pointermove", pointerMoveHandler);
    window.addEventListener("pointercancel", releaseButtons);
    window.addEventListener("blur", blurHandler);
    window.addEventListener("contextmenu", contextMenuHandler);

    return () => {
      window.removeEventListener("pointerdown", pointerDownHandler);
      window.removeEventListener("pointerup", pointerUpHandler);
      window.removeEventListener("pointermove", pointerMoveHandler);
      window.removeEventListener("pointercancel", releaseButtons);
      window.removeEventListener("blur", blurHandler);
      window.removeEventListener("contextmenu", contextMenuHandler);
    };
  }, [controlMode, isPaused, reset]);

  return { mouseControls, reset };
}
