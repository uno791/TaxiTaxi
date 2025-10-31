import { useCallback, useMemo } from "react";
import { useGame } from "../../GameContext";

type MissionTrackerHUDProps = {
  remaining: number;
  nextMission: string | null;
  onFindMission?: () => boolean;
};

export default function MissionTrackerHUD({
  remaining,
  nextMission,
  onFindMission,
}: MissionTrackerHUDProps) {
  const { missionFinderCharges, consumeMissionFinderCharge } = useGame();

  const canAttemptFind = useMemo(
    () => typeof onFindMission === "function" && nextMission !== null,
    [onFindMission, nextMission]
  );

  const findDisabled = !canAttemptFind || missionFinderCharges <= 0;

  const handleClick = useCallback(() => {
    if (!onFindMission || findDisabled) return;
    const didSetDestination = onFindMission();
    if (!didSetDestination) return;
    void consumeMissionFinderCharge();
  }, [onFindMission, consumeMissionFinderCharge, findDisabled]);

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

      {canAttemptFind && nextMission ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 4,
            width: "100%",
          }}
        >
          <button
            type="button"
            onClick={handleClick}
            disabled={findDisabled}
            style={{
              marginTop: 4,
              padding: "6px 10px",
              border: "none",
              borderRadius: 6,
              background: findDisabled ? "rgba(255, 255, 255, 0.18)" : "#007bff",
              color: findDisabled ? "rgba(255, 255, 255, 0.6)" : "white",
              cursor: findDisabled ? "default" : "pointer",
              fontSize: "0.9rem",
              fontWeight: 500,
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(event) => {
              if (findDisabled) return;
              (event.target as HTMLButtonElement).style.background = "#0056b3";
            }}
            onMouseLeave={(event) => {
              if (findDisabled) return;
              (event.target as HTMLButtonElement).style.background = "#007bff";
            }}
          >
            Find Mission
          </button>
          <span
            style={{
              fontSize: "0.8rem",
              color: "rgba(255,255,255,0.75)",
              paddingLeft: 2,
            }}
          >
            {missionFinderCharges} left
          </span>
        </div>
      ) : null}
    </div>
  );
}
