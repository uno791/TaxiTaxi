import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import infoIcon from "../../assets/info-circle-svgrepo-com.svg";
import type { ControlMode } from "./useControls";
import { useGameLifecycle } from "../../GameContext";
import { useMusic } from "../../context/MusicContext";

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

const QUICK_TIPS: Array<{ title: string; detail: string }> = [
  { title: "Shift + R", detail: "Quickly restart the current night." },
  { title: "Space / Cross", detail: "Tap to boost or engage the handbrake." },
  { title: "M", detail: "Toggle the mission tracker overlay." },
];

export function TaxiControlSettings({
  controlMode,
  onControlModeChange,
  isPaused,
  onPauseChange,
  onSaveAndExit,
}: Props) {
  const [infoTarget, setInfoTarget] = useState<ControlMode | null>(null);
  const { restartGame } = useGameLifecycle();
  const { isMuted, toggleMuted, setMuted, volume, setVolume } = useMusic();

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
    setInfoTarget(null);
    onPauseChange(false);
  };

  const handleSave = () => {
    setInfoTarget(null);
    onPauseChange(false);
    onSaveAndExit();
  };

  const handleRestart = () => {
    restartGame();
    handleResume();
  };

  const handleToggleMute = () => {
    toggleMuted();
  };

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value);
    const normalized = Math.min(Math.max(nextValue, 0), 100) / 100;
    setVolume(normalized);
    if (normalized > 0 && isMuted) {
      setMuted(false);
    }
  };

  const volumePercent = Math.round(volume * 100);

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
          zIndex: 40,
        }}
      >
        <button
          type="button"
          onClick={() => onPauseChange(true)}
          style={{
            padding: "10px 20px",
            borderRadius: 999,
            border: "none",
            background: "linear-gradient(135deg, #f3f5ff, #dbe2ff)",
            color: "#1C274C",
            fontWeight: 600,
            fontSize: 15,
            boxShadow: "0 4px 12px rgba(10, 15, 28, 0.25)",
            cursor: "pointer",
            letterSpacing: "0.02em",
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
            background: "rgba(6, 11, 25, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 30,
            backdropFilter: "blur(4px)",
          }}
          onClick={handleResume}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(860px, 92vw)",
              background: "linear-gradient(155deg, #101727 0%, #1c2740 100%)",
              borderRadius: 26,
              padding: "32px 36px",
              boxShadow: "0 32px 80px rgba(6, 10, 24, 0.55)",
              display: "flex",
              flexDirection: "column",
              gap: 28,
              color: "#f5f7ff",
              border: "1px solid rgba(92, 122, 190, 0.35)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 32,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                  }}
                >
                  Game Paused
                </h2>
                <p style={{ margin: 0, color: "rgba(223, 228, 255, 0.7)", fontSize: 15 }}>
                  Take a breather, adjust your setup, then dive back into the city.
                </p>
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: "rgba(255, 255, 255, 0.12)",
                  fontWeight: 700,
                  fontSize: 20,
                  letterSpacing: "0.3em",
                }}
              >
                II
              </span>
            </div>

            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={handleResume}
                style={{
                  flex: "1 1 160px",
                  borderRadius: 18,
                  border: "none",
                  background: "linear-gradient(135deg, #5de0a5, #3ab18c)",
                  color: "#041626",
                  padding: "14px 20px",
                  fontSize: 17,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 16px 36px rgba(60, 180, 150, 0.4)",
                }}
              >
                Resume Drive
              </button>
              <button
                type="button"
                onClick={handleRestart}
                style={{
                  flex: "1 1 160px",
                  borderRadius: 18,
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#f5f7ff",
                  padding: "14px 20px",
                  fontSize: 17,
                  fontWeight: 600,
                  cursor: "pointer",
                  backdropFilter: "blur(4px)",
                }}
              >
                Restart Level
              </button>
              <button
                type="button"
                onClick={handleSave}
                style={{
                  flex: "1 1 160px",
                  borderRadius: 18,
                  border: "none",
                  background: "linear-gradient(135deg, #ff6a6a, #d6315f)",
                  color: "#fff",
                  padding: "14px 20px",
                  fontSize: 17,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 16px 38px rgba(214, 74, 122, 0.45)",
                }}
              >
                Save & Exit
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 20,
              }}
            >
              <section
                style={{
                  background: "rgba(9, 14, 28, 0.55)",
                  borderRadius: 18,
                  padding: "20px 22px",
                  border: "1px solid rgba(84, 112, 180, 0.3)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 18 }}>Audio</h3>
                  <button
                    type="button"
                    onClick={handleToggleMute}
                    style={{
                      border: "none",
                      borderRadius: 999,
                      padding: "8px 14px",
                      background: isMuted
                        ? "rgba(255, 255, 255, 0.14)"
                        : "rgba(93, 224, 165, 0.18)",
                      color: "#f5f7ff",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {isMuted ? "Music Off" : "Music On"}
                  </button>
                </div>
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    fontSize: 14,
                    color: "rgba(223, 228, 255, 0.75)",
                  }}
                >
                  <span>Master Volume</span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={volumePercent}
                      onChange={handleVolumeChange}
                      style={{ flex: 1 }}
                    />
                    <span style={{ width: 44, textAlign: "right" }}>
                      {volumePercent}%
                    </span>
                  </div>
                </label>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(223, 228, 255, 0.6)" }}>
                  Tweak the soundtrack mix to suit your ride. Raising the volume
                  automatically unmutes the music.
                </p>
              </section>

              <section
                style={{
                  background: "rgba(9, 14, 28, 0.55)",
                  borderRadius: 18,
                  padding: "20px 22px",
                  border: "1px solid rgba(84, 112, 180, 0.3)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <h3 style={{ margin: 0, fontSize: 18 }}>Driving Controls</h3>
                  <p style={{ margin: 0, fontSize: 13, color: "rgba(223, 228, 255, 0.6)" }}>
                    Pick a control scheme and review the layout.
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
                          ? "2px solid rgba(120, 152, 255, 0.9)"
                          : "1px solid rgba(120, 152, 255, 0.2)",
                        background: isActive
                          ? "rgba(120, 152, 255, 0.14)"
                          : "rgba(9, 14, 28, 0.6)",
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          cursor: "pointer",
                          flex: 1,
                          fontSize: 14,
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
                        <span>{label}</span>
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
                          background: "rgba(255, 255, 255, 0.14)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        aria-label={`How ${label} controls work`}
                      >
                        <img
                          src={infoIcon}
                          alt=""
                          aria-hidden="true"
                          style={{ width: 20, height: 20 }}
                        />
                      </button>
                    </div>
                  );
                })}

                {infoTarget && (
                  <div
                    style={{
                      background: "rgba(15, 23, 43, 0.85)",
                      borderRadius: 14,
                      padding: "14px 16px",
                      color: "rgba(223, 228, 255, 0.8)",
                      fontSize: 13,
                      lineHeight: 1.5,
                    }}
                  >
                    {infoText[infoTarget]}
                  </div>
                )}
              </section>

              <section
                style={{
                  background: "rgba(9, 14, 28, 0.55)",
                  borderRadius: 18,
                  padding: "20px 22px",
                  border: "1px solid rgba(84, 112, 180, 0.3)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <h3 style={{ margin: 0, fontSize: 18 }}>Quick Tips</h3>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    fontSize: 13,
                    color: "rgba(223, 228, 255, 0.7)",
                  }}
                >
                  {QUICK_TIPS.map((tip) => (
                    <li key={tip.title}>
                      <span style={{ fontWeight: 600 }}>{tip.title}:</span> {tip.detail}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
