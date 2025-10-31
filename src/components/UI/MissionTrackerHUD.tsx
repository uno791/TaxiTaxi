import React from "react";

type MissionTrackerHUDProps = {
  remaining: number;
  nextMission: string | null;
  onFindMission?: () => void;
};

export default function MissionTrackerHUD({
  remaining,
  nextMission,
  onFindMission,
}: MissionTrackerHUDProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 280,
        right: 24,
        background: "rgba(0, 0, 0, 0.6)",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: "8px",
        fontFamily: "sans-serif",
        fontWeight: 400,
        fontSize: "0.95rem",
        zIndex: 50,
        backdropFilter: "blur(4px)",
        lineHeight: "1.4em",
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        alignItems: "flex-start",
      }}
    >
      <div>
        <strong>Missions Left:</strong> {remaining}
      </div>
      {nextMission && (
        <div>
          <strong>Next:</strong> {nextMission}
        </div>
      )}

      {onFindMission && nextMission && (
        <button
          onClick={onFindMission}
          style={{
            marginTop: 4,
            padding: "6px 10px",
            border: "none",
            borderRadius: 6,
            background: "#007bff",
            color: "white",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: 500,
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLButtonElement).style.background = "#0056b3")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLButtonElement).style.background = "#007bff")
          }
        >
          Find Mission
        </button>
      )}
    </div>
  );
}
