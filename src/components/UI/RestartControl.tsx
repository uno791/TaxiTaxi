import { useCallback, useEffect, useRef } from "react";
import { useGameLifecycle } from "../../GameContext";
import { useDualSenseControls } from "../Controls/useDualSenseControls";

export default function RestartControl() {
  const { restartGame } = useGameLifecycle();
  const { connected, restart: controllerRestartPressed } =
    useDualSenseControls();
  const lastControllerRestart = useRef(false);

  const triggerRestart = useCallback(() => {
    restartGame({ skipIntro: true });
  }, [restartGame]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.code !== "KeyR") return;
      if (!event.shiftKey) return;
      event.preventDefault();
      triggerRestart();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [triggerRestart]);

  useEffect(() => {
    if (!connected) {
      lastControllerRestart.current = false;
      return;
    }

    if (controllerRestartPressed && !lastControllerRestart.current) {
      triggerRestart();
    }
    lastControllerRestart.current = controllerRestartPressed;
  }, [connected, controllerRestartPressed, triggerRestart]);

  return (
    <button
      type="button"
      onClick={triggerRestart}
      style={{
        position: "absolute",
        top: 16,
        right: 130,
        zIndex: 30,
        border: "1px solid rgba(255, 255, 255, 0.3)",
        borderRadius: 8,
        background: "rgba(24, 28, 35, 0.85)",
        color: "#f5f5f5",
        padding: "8px 14px",
        fontSize: "0.9rem",
        cursor: "pointer",
        backdropFilter: "blur(2px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 2,
      }}
      title="Restart the current level (Shift+R on keyboard or Share/Back on your controller)."
      aria-label="Restart level"
    >
      <span>Restart Level</span>
      <span style={{ fontSize: "0.74rem", opacity: 0.75 }}>
        Shift+R / Share
      </span>
    </button>
  );
}
