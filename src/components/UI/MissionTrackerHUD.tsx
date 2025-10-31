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
        background: "rgba(0, 10, 20, 0.7)",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 0 20px rgba(255,255,255,0.08)",
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
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            width: "100%",
            textAlign: "center",
          }}
        >
          <button
            type="button"
            onClick={handleClick}
            disabled={findDisabled}
            style={{
              marginTop: 6,
              padding: "10px 18px",
              border: "none",
              borderRadius: 999,
              background: findDisabled
                ? "rgba(255, 255, 255, 0.18)"
                : "linear-gradient(145deg, #ffffff, #e8e8e8)",
              color: findDisabled ? "rgba(255,255,255,0.6)" : "#000",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: findDisabled ? "not-allowed" : "pointer",
              boxShadow: findDisabled
                ? "none"
                : "0 0 16px rgba(255, 255, 255, 0.6), 0 0 32px rgba(255, 255, 255, 0.3)",
              textShadow: findDisabled
                ? "none"
                : "0 0 4px rgba(255,255,255,0.7)",
              transition: "all 0.2s ease",
              alignSelf: "center",
            }}
            onMouseEnter={(event) => {
              if (findDisabled) return;
              (event.target as HTMLButtonElement).style.boxShadow =
                "0 0 24px rgba(255, 255, 255, 0.9), 0 0 48px rgba(255, 255, 255, 0.5)";
            }}
            onMouseLeave={(event) => {
              if (findDisabled) return;
              (event.target as HTMLButtonElement).style.boxShadow =
                "0 0 16px rgba(255, 255, 255, 0.6), 0 0 32px rgba(255, 255, 255, 0.3)";
            }}
          >
            Find Mission
          </button>
          <span
            style={{
              fontSize: "0.8rem",
              color: "rgba(255,255,255,0.75)",
              paddingLeft: 2,
              textAlign: "center",
            }}
          >
            {missionFinderCharges} left
          </span>
        </div>
      ) : null}
    </div>
  );
}
