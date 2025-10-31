import { useState } from "react";
import { useMeta } from "../../context/MetaContext";
import { useGameLifecycle } from "../../GameContext";
import { CITY_SEQUENCE } from "../../constants/cities";
import entranceBackground from "../../assets/entrance.png";
import { clearGameProgress, loadGameProgress } from "../../utils/storage";
import "./EntranceScreen.css";

export default function EntranceScreen() {
  const { currentUser, setAppStage, logout, setSelectedCar } = useMeta();
  const { restartGame, setActiveCity } = useGameLifecycle();
  const defaultCity = CITY_SEQUENCE[0] ?? "city1";
  const [savedProgress, setSavedProgress] = useState(() => loadGameProgress());
  const [isConfirmingNewGame, setIsConfirmingNewGame] = useState(false);
  const hasSavedGame = Boolean(savedProgress);

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
        justifyContent: "space-between",
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
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 0,
        }}
      />

      {/* 🔹 Sign out button (top right) */}
      <button
        onClick={logout}
        className="entrance-button entrance-button--light"
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 2,
        }}
      >
        Sign Out
      </button>

      {/* 🔹 Content container */}
      <div
        style={{
          zIndex: 1,
          textAlign: "center",
          marginTop: "60px",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            marginBottom: "10px",
            textShadow: "3px 3px 10px black",
          }}
        >
          Welcome back,{" "}
          <span style={{ color: "#ffcc00" }}>{currentUser?.username}</span>
        </h1>
        <p style={{ fontSize: "18px", opacity: 0.9 }}>
          Ready for your next ride?
        </p>
      </div>

      {/* 🔹 Start buttons */}
      <div
        style={{
          zIndex: 1,
          marginBottom: "80px",
          display: "flex",
          gap: "20px",
        }}
      >
        <button
          className="entrance-button entrance-button--primary"
          onClick={handleStartNewGame}
        >
          Start New Game
        </button>

        <button
          className="entrance-button entrance-button--success"
          disabled={!hasSavedGame}
          onClick={handleContinueGame}
        >
          Continue Game
        </button>

        <button
          className="entrance-button entrance-button--secondary"
          onClick={handleStartFreeRoam}
        >
          Free Roam
        </button>
      </div>

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
    </div>
  );
}
