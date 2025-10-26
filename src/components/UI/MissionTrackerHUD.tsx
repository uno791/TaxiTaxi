import React from "react";

type MissionTrackerHUDProps = {
  remaining: number;
  nextMission: string | null;
};

export default function MissionTrackerHUD({
  remaining,
  nextMission,
}: MissionTrackerHUDProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: "auto", // ✅ remove top alignment
        bottom: 280, // ✅ move it down (adjust as needed)
        right: 24, // ✅ add spacing from right
        background: "rgba(0, 0, 0, 0.6)",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: "8px",
        fontFamily: "sans-serif", // ✅ normal clean UI font
        fontWeight: 400, // ✅ normal weight
        fontSize: "0.95rem",
        zIndex: 50,
        backdropFilter: "blur(4px)",
        lineHeight: "1.4em",
        pointerEvents: "none", // ✅ lets you still click game buttons underneath
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
    </div>
  );
}
