import { useEffect, useMemo, useState } from "react";

import { FreeFlightControls } from "./FreeFlightControls";

export type FlightModeOptions = {
  onEnable?: () => void;
  onDisable?: () => void;
  allowToggle?: boolean;
};

export function useFlightMode({
  onEnable,
  onDisable,
  allowToggle = true,
}: FlightModeOptions = {}) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!allowToggle && enabled) {
      setEnabled(false);
    }
  }, [allowToggle, enabled]);

  useEffect(() => {
    if (!allowToggle) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey) return;

      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }

      if (event.key === "`") {
        event.preventDefault();
        setEnabled((previous) => !previous);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [allowToggle]);

  useEffect(() => {
    if (enabled) onEnable?.();
    else onDisable?.();
  }, [enabled, onEnable, onDisable]);

  const overlay = useMemo(() => {
    if (!allowToggle || !enabled) return null;

    return (
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          padding: "12px 16px",
          borderRadius: 12,
          background: "rgba(12, 18, 28, 0.82)",
          color: "#e9f1ff",
          fontSize: 14,
          lineHeight: 1.5,
          maxWidth: 280,
          zIndex: 20,
        }}
      >
        <strong style={{ display: "block", marginBottom: 8 }}>
          Flight mode active
        </strong>
        <div>WASD to move • Space/E up • Q/Ctrl down</div>
        <div>Shift to boost • Alt to trim speed</div>
        <div>Click once to capture the mouse and look around</div>
        <div style={{ marginTop: 6, opacity: 0.75 }}>
          Press ` to return to the chase camera • Esc to release the mouse.
        </div>
      </div>
    );
  }, [allowToggle, enabled]);

  const flightControls = useMemo(() => {
    if (!allowToggle) return null;
    return <FreeFlightControls enabled={enabled} />;
  }, [allowToggle, enabled]);

  return { enabled, overlay, flightControls };
}
