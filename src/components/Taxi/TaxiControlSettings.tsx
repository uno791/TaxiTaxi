import { useEffect, useMemo, useState } from "react";
import settingsIcon from "../../assets/settings-svgrepo-com.svg";
import infoIcon from "../../assets/info-circle-svgrepo-com.svg";
import type { ControlMode } from "./useControls";

type Props = {
  controlMode: ControlMode;
  onControlModeChange: (mode: ControlMode) => void;
  isPaused: boolean;
  onPauseChange: (paused: boolean) => void;
};

const CONTROL_OPTIONS: Array<{ mode: ControlMode; label: string }> = [
  { mode: "mouse", label: "Mouse (Recomeneded)" },
  { mode: "keyboard", label: "Keyboard (WASD)" },
];

export function TaxiControlSettings({
  controlMode,
  onControlModeChange,
  isPaused,
  onPauseChange,
}: Props) {
  const [infoTarget, setInfoTarget] = useState<ControlMode | null>(null);

  const infoText = useMemo(
    () => ({
      mouse:
        "Hold the right mouse button to accelerate, hold the left button to brake, and move the mouse left/right to steer.",
      keyboard:
        "Use W to accelerate, S to reverse, and A/D (or the arrow keys) to steer left and right.",
    }),
    []
  );

  const closeSettings = () => {
    onPauseChange(false);
  };

  useEffect(() => {
    if (!isPaused) setInfoTarget(null);
  }, [isPaused]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onPauseChange(!isPaused);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPaused, onPauseChange]);

  return (
    <>
      <button
        type="button"
        onClick={() => onPauseChange(true)}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "none",
          padding: 8,
          background: "rgba(255, 255, 255, 0.85)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          cursor: "pointer",
        }}
        aria-label="Open driving settings"
      >
        <img
          src={settingsIcon}
          alt="Settings"
          style={{ width: "100%", height: "100%" }}
        />
      </button>

      {isPaused && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
          onClick={closeSettings}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(340px, 90vw)",
              background: "#ffffff",
              borderRadius: 16,
              padding: "24px 28px",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.25)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 22 }}>Driving Controls</h2>
            <p style={{ margin: 0, color: "#555" }}>
              Pick how you want to drive the taxi.
            </p>

            {CONTROL_OPTIONS.map(({ mode, label }) => {
              const isActive = controlMode === mode;
              return (
                <div
                  key={mode}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: isActive
                      ? "2px solid #1C274C"
                      : "1px solid #d0d0d0",
                    background: isActive ? "#f5f8ff" : "#fafafa",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      flex: 1,
                    }}
                  >
                    <input
                      type="radio"
                      name="control-mode"
                      checked={isActive}
                      onChange={() => {
                        onControlModeChange(mode);
                        setInfoTarget(null);
                      }}
                    />
                    <span style={{ fontSize: 16 }}>{label}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setInfoTarget((current) =>
                        current === mode ? null : mode
                      )
                    }
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      border: "none",
                      background: "rgba(255, 255, 255, 0.92)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                    aria-label={`How ${label} controls work`}
                  >
                    <img
                      src={infoIcon}
                      alt=""
                      aria-hidden="true"
                      style={{ width: 20, height: 20, display: "block" }}
                    />
                  </button>
                </div>
              );
            })}

            {infoTarget && (
              <div
                style={{
                  background: "#f1f5f9",
                  borderRadius: 12,
                  padding: "12px 16px",
                  color: "#1c274c",
                }}
              >
                <p style={{ margin: 0, fontSize: 14 }}>
                  {infoText[infoTarget]}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={closeSettings}
              style={{
                alignSelf: "flex-end",
                border: "none",
                background: "#1C274C",
                color: "white",
                padding: "10px 18px",
                borderRadius: 999,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
