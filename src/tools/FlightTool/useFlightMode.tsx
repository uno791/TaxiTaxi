import { useEffect, useMemo, useState } from "react";

import { FreeFlightControls } from "./FreeFlightControls";

export type FlightModeOptions = {
  onEnable?: () => void;
  onDisable?: () => void;
};

export function useFlightMode({
  onEnable,
  onDisable,
}: FlightModeOptions = {}) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (enabled) onEnable?.();
    else onDisable?.();
  }, [enabled, onEnable, onDisable]);

  const overlay = useMemo(() => {
    if (!enabled) return null;

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
        <div style={{ marginTop: 6, opacity: 0.75 }}>
          Press ` to return to the chase camera.
        </div>
      </div>
    );
  }, [enabled]);

  const flightControls = useMemo(() => {
    return <FreeFlightControls enabled={enabled} />;
  }, [enabled]);

  return { enabled, overlay, flightControls };
}
