import { useMissionUI } from "./MissionUIContext";

export default function MissionOverlay() {
  const { prompt, active, dialog, completion } = useMissionUI();

  const shouldRender = prompt || active || dialog || completion;
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
              Drive the passenger to {prompt.dropoffHint}. Reward: R{prompt.reward}.
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
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

      {dialog && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <div
            style={{
              pointerEvents: "auto",
              maxWidth: "480px",
              background: "rgba(30, 30, 30, 0.9)",
              padding: "14px 18px",
              borderRadius: "12px",
              color: "#f0f0f0",
              fontFamily: "Arial, sans-serif",
              fontSize: "16px",
              lineHeight: 1.5,
              boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
            }}
          >
            {dialog.text}
          </div>
        </div>
      )}

      {completion && (
        <div
          style={{
            position: "absolute",
            bottom: 140,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <div
            style={{
              pointerEvents: "auto",
              padding: "12px 22px",
              borderRadius: "12px",
              background: "rgba(25, 118, 210, 0.88)",
              color: "#fff",
              fontFamily: "Arial, sans-serif",
              fontWeight: 600,
              boxShadow: "0 10px 20px rgba(0,0,0,0.35)",
            }}
          >
            Mission complete! Earned R{completion.reward}.
          </div>
        </div>
      )}
    </div>
  );
}
