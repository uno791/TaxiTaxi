import { useMissionUI } from "./MissionUIContext";
import { useEffect, useState } from "react";

export default function MissionOverlay() {
  const { prompt, active, dialog, completion, timer } = useMissionUI();
  const [missionFailed, setMissionFailed] = useState(false);

  // Watch for timer reaching zero → show mission failed popup
  useEffect(() => {
    if (timer && timer.secondsLeft === 0) {
      setMissionFailed(true);
      const timeout = setTimeout(() => setMissionFailed(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [timer]);

  // Auto fade out mission complete popup
  useEffect(() => {
    if (!completion) return;
    const timeout = setTimeout(() => {
      // fade out automatically
      const overlay = document.querySelector(".mission-complete");
      if (overlay) (overlay as HTMLElement).style.opacity = "0";
    }, 3000);
    return () => clearTimeout(timeout);
  }, [completion]);

  const shouldRender =
    prompt || active || dialog || completion || missionFailed;
  if (!shouldRender) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 30,
      }}
    >
      {/* PROMPT OVERLAY */}
      {prompt && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              pointerEvents: "auto",
              minWidth: "320px",
              maxWidth: "400px",
              background: "rgba(22, 22, 22, 0.95)",
              borderRadius: "14px",
              padding: "24px",
              boxShadow: "0 18px 36px rgba(0,0,0,0.45)",
              color: "#f5f5f5",
              fontFamily: "Arial, sans-serif",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              Start Mission?
            </div>
            <div style={{ lineHeight: 1.5, marginBottom: "18px" }}>
              Drive the passenger to {prompt.dropoffHint}. Reward: R
              {prompt.reward}.
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={prompt.onDecline}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #555",
                  background: "transparent",
                  color: "#f5f5f5",
                  cursor: "pointer",
                }}
              >
                Not now
              </button>
              <button
                type="button"
                onClick={prompt.onStart}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#2e7d32",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Start mission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE INSTRUCTION */}
      {active && (
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              pointerEvents: "auto",
              padding: "10px 18px",
              borderRadius: "10px",
              background: "rgba(46, 125, 50, 0.85)",
              color: "#fff",
              fontFamily: "Arial, sans-serif",
              fontWeight: 600,
              boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
            }}
          >
            Drop off the passenger at {active.dropoffHint}.
          </div>
        </div>
      )}

      {/* TIMER DISPLAY */}
      {active && timer && timer.secondsLeft > 0 && (
        <div
          style={{
            position: "absolute",
            top: 70,
            right: 24,
            background:
              timer.secondsLeft <= 5
                ? "rgba(183, 28, 28, 0.85)"
                : "rgba(0, 0, 0, 0.65)",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: "10px",
            fontFamily: "Arial, sans-serif",
            fontWeight: 700,
            fontSize: "20px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            transition: "background 0.3s ease",
          }}
        >
          Time left: {timer.secondsLeft}s
        </div>
      )}

      {/* BLOCKING DIALOG MODE */}
      {dialog && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: "80px",
            pointerEvents: "auto",
            zIndex: 40,
          }}
        >
          <div
            style={{
              maxWidth: "640px",
              width: "90%",
              background: "rgba(20,20,20,0.95)",
              padding: "26px 34px 28px",
              borderRadius: "14px",
              color: "#f0f0f0",
              fontFamily: "Arial, sans-serif",
              fontSize: "18px",
              lineHeight: 1.6,
              textAlign: "center",
              boxShadow: "0 16px 30px rgba(0,0,0,0.45)",
            }}
          >
            <div
              style={{
                fontSize: "15px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.65)",
                marginBottom: "12px",
              }}
            >
              {dialog.speakerLabel}
            </div>
            <div style={{ whiteSpace: "pre-wrap" }}>{dialog.text}</div>
            {dialog.options && dialog.options.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                {dialog.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={option.onSelect}
                    style={{
                      padding: "12px 18px",
                      borderRadius: "10px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(60, 68, 82, 0.65)",
                      color: "#f5f5f5",
                      cursor: "pointer",
                      fontSize: "17px",
                      transition: "background 0.15s ease, transform 0.15s ease",
                    }}
                    onMouseDown={(event) => {
                      event.currentTarget.style.transform = "scale(0.97)";
                      event.currentTarget.style.background =
                        "rgba(60, 68, 82, 0.8)";
                    }}
                    onMouseUp={(event) => {
                      event.currentTarget.style.transform = "scale(1)";
                      event.currentTarget.style.background =
                        "rgba(60, 68, 82, 0.65)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform = "scale(1)";
                      event.currentTarget.style.background =
                        "rgba(60, 68, 82, 0.65)";
                    }}
                  >
                    {option.label}
                  </button>
                ))}
                <div
                  style={{
                    marginTop: "4px",
                    fontSize: "13px",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  Choose an option to continue
                </div>
              </div>
            ) : (
              dialog.onContinue && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "14px",
                    marginTop: "26px",
                  }}
                >
                  <button
                    type="button"
                    onClick={dialog.onContinue}
                    style={{
                      padding: "10px 26px",
                      borderRadius: "999px",
                      border: "none",
                      background: "#f5f5f5",
                      color: "#111",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "16px",
                      boxShadow: "0 10px 18px rgba(0,0,0,0.35)",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    }}
                    onMouseDown={(event) => {
                      event.currentTarget.style.transform = "scale(0.97)";
                      event.currentTarget.style.boxShadow =
                        "0 8px 14px rgba(0,0,0,0.4)";
                    }}
                    onMouseUp={(event) => {
                      event.currentTarget.style.transform = "scale(1)";
                      event.currentTarget.style.boxShadow =
                        "0 10px 18px rgba(0,0,0,0.35)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform = "scale(1)";
                      event.currentTarget.style.boxShadow =
                        "0 10px 18px rgba(0,0,0,0.35)";
                    }}
                  >
                    Continue
                  </button>
                  <div
                    style={{
                      fontSize: "13px",
                      opacity: 0.75,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    Press Space or click Continue
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* MISSION COMPLETE (with bonus) */}
      {completion && (
        <div
          className="mission-complete"
          style={{
            position: "absolute",
            bottom: 140,
            left: "50%",
            transform: "translateX(-50%)",
            transition: "opacity 0.5s ease",
            zIndex: 60,
          }}
        >
          <div
            style={{
              pointerEvents: "auto",
              padding: "16px 28px",
              borderRadius: "14px",
              background: "rgba(25, 118, 210, 0.9)",
              color: "#fff",
              fontFamily: "Arial, sans-serif",
              fontWeight: 600,
              boxShadow: "0 10px 20px rgba(0,0,0,0.35)",
              textAlign: "center",
              minWidth: "280px",
            }}
          >
            <div style={{ fontSize: "20px", marginBottom: "6px" }}>
              Mission complete!
            </div>
            <div style={{ fontSize: "18px" }}>Earned R{completion.reward}</div>
            {completion.bonus && completion.bonus > 0 && (
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#ffeb3b",
                }}
              >
                Speed Bonus +R{completion.bonus}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MISSION FAILED POPUP */}
      {missionFailed && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            style={{
              pointerEvents: "auto",
              background: "rgba(183, 28, 28, 0.95)",
              color: "#fff",
              fontFamily: "Arial, sans-serif",
              fontSize: "22px",
              fontWeight: 700,
              padding: "24px 40px",
              borderRadius: "14px",
              boxShadow: "0 18px 36px rgba(0,0,0,0.5)",
            }}
          >
            Mission Failed! Time ran out.
          </div>
        </div>
      )}
    </div>
  );
}
