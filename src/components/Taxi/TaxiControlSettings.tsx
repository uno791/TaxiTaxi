import { useEffect, useMemo, useState } from "react";
import infoIcon from "../../assets/info-circle-svgrepo-com.svg";
import type { ControlMode } from "./useControls";
import { MusicToggleButton } from "../UI/MusicToggleButton";

type Props = {
  controlMode: ControlMode;
  onControlModeChange: (mode: ControlMode) => void;
  isPaused: boolean;
  onPauseChange: (paused: boolean) => void;
  onSaveAndExit: () => void;
};

const CONTROL_OPTIONS: Array<{ mode: ControlMode; label: string }> = [
  { mode: "mouse", label: "Mouse (Recommended)" },
  { mode: "keyboard", label: "Keyboard (WASD)" },
  { mode: "controller", label: "Controller" },
];

export function TaxiControlSettings({
  controlMode,
  onControlModeChange,
  isPaused,
  onPauseChange,
  onSaveAndExit,
}: Props) {
  const [infoTarget, setInfoTarget] = useState<ControlMode | null>(null);

  const infoText = useMemo(
    () => ({
      mouse:
        "Hold the right mouse button to accelerate, hold the left button to brake, and move the mouse left/right to steer.",
      keyboard:
        "Use W to accelerate, S to reverse, and A/D (or the arrow keys) to steer left and right.",
      controller:
        "Use R2 to accelerate, L2 to brake, hold Circle with R2 to reverse, steer with the left stick, and tap Cross for boost/handbrake.",
    }),
    []
  );

  const handleResume = () => {
    onPauseChange(false);
  };

  const handleSave = () => {
    onPauseChange(false);
    onSaveAndExit();
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
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          zIndex: 11,
        }}
      >
        <MusicToggleButton />
        <button
          type="button"
          onClick={() => onPauseChange(true)}
          style={{
            padding: "10px 18px",
            borderRadius: 999,
            border: "none",
            background: "rgba(255, 255, 255, 0.9)",
            color: "#1C274C",
            fontWeight: 600,
            fontSize: 15,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            cursor: "pointer",
          }}
        >
          Pause
        </button>
      </div>

      {isPaused && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(10, 15, 28, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            backdropFilter: "blur(2px)",
          }}
          onClick={handleResume}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(420px, 92vw)",
              background: "#ffffff",
              borderRadius: 20,
              padding: "28px 32px",
              boxShadow: "0 18px 42px rgba(0, 0, 0, 0.3)",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 26,
                  color: "#1C274C",
                }}
              >
                Game Paused
              </h2>
              <p style={{ margin: 0, color: "#4a5568", fontSize: 15 }}>
                The city can wait. Choose what to do next.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={handleResume}
                style={{
                  flex: "1 1 140px",
                  borderRadius: 999,
                  border: "none",
                  background: "#1C274C",
                  color: "white",
                  padding: "12px 20px",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Resume
              </button>
              <button
                type="button"
                onClick={handleSave}
                style={{
                  flex: "1 1 140px",
                  borderRadius: 999,
                  border: "none",
                  background: "#D92E2E",
                  color: "white",
                  padding: "12px 20px",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Save & Exit
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                paddingTop: 18,
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <h3 style={{ margin: 0, fontSize: 18, color: "#1C274C" }}>
                  Driving Controls
                </h3>
                <p style={{ margin: 0, color: "#4a5568", fontSize: 14 }}>
                  Pick how you want to drive the taxi.
                </p>
              </div>

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
                      borderRadius: 14,
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
                        width: 34,
                        height: 34,
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}
