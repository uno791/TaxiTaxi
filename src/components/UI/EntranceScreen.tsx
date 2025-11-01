import { useState } from "react";
import { useMeta } from "../../context/MetaContext";
import { useGameLifecycle } from "../../GameContext";
import { CITY_SEQUENCE } from "../../constants/cities";
import entranceBackground from "../../assets/entrance.png";
import CreditsModal from "./CreditsModal";
import { clearGameProgress, loadGameProgress } from "../../utils/storage";
import "./EntranceScreen.css";

export default function EntranceScreen() {
  const { currentUser, setAppStage, logout, setSelectedCar } = useMeta();
  const { restartGame, setActiveCity } = useGameLifecycle();
  const defaultCity = CITY_SEQUENCE[0] ?? "city1";
  const [savedProgress, setSavedProgress] = useState(() => loadGameProgress());
  const [isConfirmingNewGame, setIsConfirmingNewGame] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

  // ✅ Continue Game only if there's actual progress
  const hasSavedGame =
    savedProgress &&
    Array.isArray(savedProgress.completedMissionIds) &&
    savedProgress.completedMissionIds.length > 0;

  const startCampaignFlow = () => {
    setActiveCity(defaultCity);
    restartGame({ mode: "campaign" });
    setSelectedCar(null);
    setAppStage("cinematic");
  };

  const handleStartNewGame = () => {
    if (hasSavedGame) {
      setIsConfirmingNewGame(true);
      return;
    }

    clearGameProgress();
    setSavedProgress(null);
    startCampaignFlow();
  };

  const handleConfirmNewGame = () => {
    clearGameProgress();
    setSavedProgress(null);
    setIsConfirmingNewGame(false);
    startCampaignFlow();
  };

  const handleCancelNewGame = () => {
    setIsConfirmingNewGame(false);
  };

  const handleContinueGame = () => {
    if (!savedProgress) return;
    setActiveCity(savedProgress.cityId);
    restartGame({ mode: "campaign" });
    setSelectedCar(null);
    setAppStage("level");
  };

  const handleStartFreeRoam = () => {
    setActiveCity(defaultCity);
    restartGame({ mode: "freeRoam" });
    setAppStage("car");
  };

  return (
    <div
      style={{
        backgroundImage: `url(${entranceBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        color: "white",
        fontFamily: "sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 🔹 Overlay for text readability */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0)",
          zIndex: 0,
        }}
      />

      {/* 🔹 Sign out button (top right, horror style) */}
      <button
        onClick={logout}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 2,
          padding: "10px 22px",
          fontSize: "16px",
          fontWeight: "bold",
          color: "#ffcc00",
          background: "rgba(0,0,0,0.7)",
          border: "2px solid rgba(255, 204, 0, 0.4)",
          borderRadius: "8px",
          cursor: "pointer",
          boxShadow: "0 0 15px rgba(255, 204, 0, 0.2)",
          textTransform: "uppercase",
          letterSpacing: "1px",
          transition:
            "all 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 0 25px rgba(255, 204, 0, 0.6)";
          e.currentTarget.style.background = "rgba(0,0,0,0.9)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 0 15px rgba(255, 204, 0, 0.2)";
          e.currentTarget.style.background = "rgba(0,0,0,0.7)";
        }}
      >
        Sign Out
      </button>

      {/* 🔹 Title Text (top left corner) */}
      <div
        style={{
          position: "absolute",
          top: "30px",
          left: "80px",
          zIndex: 2,
          textAlign: "left",
        }}
      >
        <h1
          style={{
            fontSize: "180px",
            margin: 0,
            color: "#ffcc00",
            fontFamily: '"Bebas Neue", "Impact", sans-serif',
            textTransform: "uppercase",
            letterSpacing: "3px",
            lineHeight: 1.0,
            textShadow:
              "0 0 10px rgba(255, 204, 0, 0.6), 0 0 30px rgba(255, 204, 0, 0.4)",
          }}
        >
          Ride or Die
        </h1>
        <p
          style={{
            fontSize: "32px",
            marginTop: "14px",
            color: "#f0f0f0",
            textShadow: "0 0 12px rgba(0,0,0,0.9)",
            letterSpacing: "1px",
          }}
        >
          Ready for your next ride,{" "}
          <span style={{ color: "#ffcc00" }}>{currentUser?.username}</span>?
        </p>
      </div>

      {/* 🔹 Start buttons (bottom center, lowered slightly) */}
      <div
        style={{
          position: "absolute",
          bottom: "40px", // lowered from 80px
          zIndex: 2,
          display: "flex",
          justifyContent: "center",
          gap: "25px",
        }}
      >
        {[
          // 🎃 Shared horror-style button base
          {
            label: "Start New Game",
            onClick: handleStartNewGame,
            color: "#ffcc00",
          },
          {
            label: "Continue Game",
            onClick: handleContinueGame,
            color: "#4caf50",
            disabled: !hasSavedGame,
          },
          {
            label: "Free Roam",
            onClick: handleStartFreeRoam,
            color: "#2196f3",
          },
          {
            label: "Credits",
            onClick: () => setShowCredits(true),
            color: "#777777",
          },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={btn.onClick}
            disabled={btn.disabled}
            style={{
              padding: "16px 42px",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#f5f5f5",
              background: `radial-gradient(circle at top, ${btn.color}33, rgba(0,0,0,0.8))`,
              border: "2px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              textTransform: "uppercase",
              letterSpacing: "1px",
              cursor: btn.disabled ? "not-allowed" : "pointer",
              opacity: btn.disabled ? 0.4 : 1,
              boxShadow: `0 0 25px ${btn.color}33`,
              transition:
                "all 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease",
            }}
            onMouseEnter={(e) => {
              if (btn.disabled) return;
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = `0 0 35px ${btn.color}99`;
              e.currentTarget.style.background = `radial-gradient(circle at top, ${btn.color}55, rgba(0,0,0,0.9))`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = `0 0 25px ${btn.color}33`;
              e.currentTarget.style.background = `radial-gradient(circle at top, ${btn.color}33, rgba(0,0,0,0.8))`;
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* 🔹 Confirmation Overlay */}
      {isConfirmingNewGame && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              borderRadius: "12px",
              padding: "28px 32px",
              width: "100%",
              maxWidth: "420px",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                marginBottom: "12px",
                color: "#ffcc00",
              }}
            >
              Start Fresh?
            </h2>
            <p
              style={{
                fontSize: "16px",
                lineHeight: 1.5,
                marginBottom: "24px",
              }}
            >
              Starting a new game will erase your current progress. Are you sure
              you want to continue?
            </p>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "16px" }}
            >
              <button
                onClick={handleConfirmNewGame}
                className="entrance-button entrance-button--danger"
              >
                Yes, start over
              </button>
              <button
                onClick={handleCancelNewGame}
                className="entrance-button entrance-button--ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Credits Modal */}
      {showCredits && <CreditsModal onClose={() => setShowCredits(false)} />}
    </div>
  );
}
