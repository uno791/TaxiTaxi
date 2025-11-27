import { useEffect, useRef, useState } from "react";
import {
  applyDeadzone,
  clamp,
  findPrimaryGamepad,
} from "./gamepadUtils";

type Props = {
  enabled: boolean;
};

const CLICKABLE_SELECTOR =
  "button, [role='button'], [role='menuitem'], [role='option'], a[href], input, select, textarea, option, label";

const isDisabledElement = (element: HTMLElement) =>
  (element instanceof HTMLButtonElement ||
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLOptionElement) &&
  element.disabled;

function findClickableTarget(x: number, y: number) {
  if (typeof document === "undefined") return null;
  const hit = document.elementFromPoint(x, y) as HTMLElement | null;
  if (!hit) return null;

  const interactive =
    hit.closest<HTMLElement>(CLICKABLE_SELECTOR) ??
    (hit.tabIndex >= 0 ? hit : null);
  if (interactive) return interactive;

  const cursor = window.getComputedStyle(hit).cursor;
  if (cursor === "pointer") return hit;
  return null;
}

function dispatchSyntheticClick(target: HTMLElement, x: number, y: number) {
  if (isDisabledElement(target)) return;

  const commonProps = {
    bubbles: true,
    clientX: x,
    clientY: y,
    button: 0,
  };

  const pointerDown = new PointerEvent("pointerdown", {
    ...commonProps,
    pointerId: 1,
    isPrimary: true,
  });
  const pointerUp = new PointerEvent("pointerup", {
    ...commonProps,
    pointerId: 1,
    isPrimary: true,
  });

  target.focus({ preventScroll: true });
  target.dispatchEvent(pointerDown);
  target.dispatchEvent(new MouseEvent("mousedown", commonProps));
  target.dispatchEvent(pointerUp);
  target.dispatchEvent(new MouseEvent("mouseup", commonProps));
  target.dispatchEvent(new MouseEvent("click", commonProps));
}

export default function ControllerCursor({ enabled }: Props) {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastPressRef = useRef(false);
  const hasPadRef = useRef(false);
  const [hasGamepad, setHasGamepad] = useState(false);
  const positionRef = useRef({
    x: typeof window === "undefined" ? 0 : window.innerWidth / 2,
    y: typeof window === "undefined" ? 0 : window.innerHeight / 2,
  });

  const updateCursorStyle = () => {
    const element = cursorRef.current;
    if (!element) return;
    const { x, y } = positionRef.current;
    element.style.left = `${x - 11}px`;
    element.style.top = `${y - 11}px`;
  };

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      setHasGamepad(false);
      return;
    }

    positionRef.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    updateCursorStyle();

    const step = () => {
      const gamepad = findPrimaryGamepad();
      if (!gamepad) {
        if (hasPadRef.current) {
          hasPadRef.current = false;
          setHasGamepad(false);
        }
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      if (!hasPadRef.current) {
        hasPadRef.current = true;
        setHasGamepad(true);
      }

      const leftX = applyDeadzone(gamepad.axes[0] ?? 0);
      const leftY = applyDeadzone(gamepad.axes[1] ?? 0);

      const dpadX =
        (gamepad.buttons[15]?.pressed ? 1 : 0) -
        (gamepad.buttons[14]?.pressed ? 1 : 0);
      const dpadY =
        (gamepad.buttons[13]?.pressed ? 1 : 0) -
        (gamepad.buttons[12]?.pressed ? 1 : 0);

      const moveX = leftX !== 0 ? leftX : dpadX;
      const moveY = leftY !== 0 ? leftY : dpadY;

      if (moveX !== 0 || moveY !== 0) {
        const speed = leftX !== 0 || leftY !== 0 ? 18 : 12;
        const nextX = clamp(
          positionRef.current.x + moveX * speed,
          6,
          window.innerWidth - 6
        );
        const nextY = clamp(
          positionRef.current.y + moveY * speed,
          6,
          window.innerHeight - 6
        );
        if (
          nextX !== positionRef.current.x ||
          nextY !== positionRef.current.y
        ) {
          positionRef.current = { x: nextX, y: nextY };
          updateCursorStyle();
        }
      }

      const pressed = Boolean(gamepad.buttons[0]?.pressed);
      if (pressed && !lastPressRef.current) {
        const target = findClickableTarget(
          positionRef.current.x,
          positionRef.current.y
        );
        if (target) {
          dispatchSyntheticClick(
            target,
            positionRef.current.x,
            positionRef.current.y
          );
        }
      }
      lastPressRef.current = pressed;

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastPressRef.current = false;
      hasPadRef.current = false;
    };
  }, [enabled]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      const x = clamp(positionRef.current.x, 6, window.innerWidth - 6);
      const y = clamp(positionRef.current.y, 6, window.innerHeight - 6);
      positionRef.current = { x, y };
      updateCursorStyle();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!enabled || !hasGamepad) return null;

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        width: 22,
        height: 22,
        borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.9)",
        boxShadow: "0 0 0 4px rgba(255,255,255,0.15), 0 6px 18px rgba(0,0,0,0.5)",
        background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.1) 70%, transparent 100%)",
        pointerEvents: "none",
        zIndex: 120,
        left: "-9999px",
        top: "-9999px",
        transition: "box-shadow 0.18s ease, background 0.18s ease",
      }}
    />
  );
}
