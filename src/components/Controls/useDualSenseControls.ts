import { useEffect, useRef, useState } from "react";
import type { DualSenseControls } from "./types";

const DEADZONE = 0.12;
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
const applyDeadzone = (value: number) => (Math.abs(value) < DEADZONE ? 0 : value);

const STANDARD_MAPPING = "standard";

const getGamepads = () => {
  if (typeof navigator === "undefined" || !navigator.getGamepads) {
    return [] as (Gamepad | null)[];
  }
  return navigator.getGamepads();
};

export function useDualSenseControls(): DualSenseControls {
  const [, setConnected] = useState(false);
  const rafRef = useRef<number | null>(null);

  const keyboardFallbackRef = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
    space: false,
    r: false,
    restart: false,
  });

  const [state, setState] = useState<DualSenseControls>({
    connected: false,
    steer: 0,
    throttle: 0,
    brake: 0,
    handbrake: false,
    reverse: false,
    cameraX: 0,
    cameraY: 0,
    restart: false,
  });

  useEffect(() => {
    const handleKeyChange = (event: KeyboardEvent, down: boolean) => {
      switch (event.code) {
        case "ArrowLeft":
        case "KeyA":
          keyboardFallbackRef.current.left = down;
          break;
        case "ArrowRight":
        case "KeyD":
          keyboardFallbackRef.current.right = down;
          break;
        case "ArrowUp":
        case "KeyW":
          keyboardFallbackRef.current.up = down;
          break;
        case "ArrowDown":
        case "KeyS":
          keyboardFallbackRef.current.down = down;
          break;
        case "Space":
          keyboardFallbackRef.current.space = down;
          break;
        case "KeyR":
          keyboardFallbackRef.current.r = down;
          keyboardFallbackRef.current.restart = down && event.shiftKey;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          if (!down) {
            keyboardFallbackRef.current.restart = false;
          }
          break;
        default:
          break;
      }
    };

    const onKeyDown = (event: KeyboardEvent) => handleKeyChange(event, true);
    const onKeyUp = (event: KeyboardEvent) => handleKeyChange(event, false);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    window.addEventListener("gamepadconnected", onConnect);
    window.addEventListener("gamepaddisconnected", onDisconnect);

    const initialPads = getGamepads();
    setConnected(initialPads.some(Boolean));

    const loop = () => {
      const pads = getGamepads();
      const pad =
        pads.find((entry): entry is Gamepad => !!entry && entry.mapping === STANDARD_MAPPING) ??
        pads.find((entry): entry is Gamepad => !!entry) ??
        null;

      if (pad) {
        const leftX = applyDeadzone(pad.axes[0] ?? 0);
        const rightX = applyDeadzone(pad.axes[2] ?? 0);
        const rightY = applyDeadzone(pad.axes[3] ?? 0);
        const l2 = clamp(pad.buttons[6]?.value ?? 0, 0, 1);
        const r2 = clamp(pad.buttons[7]?.value ?? 0, 0, 1);
        const handbrake = Boolean(pad.buttons[0]?.pressed);
        const reverse = Boolean(pad.buttons[1]?.pressed);
        const restartButton =
          Boolean(pad.buttons[9]?.pressed) || Boolean(pad.buttons[8]?.pressed);

        setState({
          connected: true,
          steer: clamp(-leftX, -1, 1),
          throttle: r2,
          brake: l2,
          handbrake,
          reverse,
          cameraX: clamp(rightX, -1, 1),
          cameraY: clamp(rightY, -1, 1),
          restart: restartButton,
        });
      } else {
        const fallback = keyboardFallbackRef.current;
        const steerLeft = fallback.left ? 1 : 0;
        const steerRight = fallback.right ? -1 : 0;
        const steer = clamp(steerLeft + steerRight, -1, 1);
        const throttle = fallback.up ? 1 : 0;
        const brake = fallback.down ? 1 : 0;

        setState({
          connected: false,
          steer,
          throttle,
          brake,
          handbrake: fallback.space,
          reverse: fallback.r,
          cameraX: 0,
          cameraY: 0,
          restart: fallback.restart,
        });
      }

      rafRef.current = window.requestAnimationFrame(loop);
    };

    rafRef.current = window.requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("gamepadconnected", onConnect);
      window.removeEventListener("gamepaddisconnected", onDisconnect);
    };
  }, []);

  return state;
}
