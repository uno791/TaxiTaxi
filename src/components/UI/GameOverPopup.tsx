import { useGame, useGameLifecycle } from "../../GameContext";

export default function GameOverPopup() {
  const { gameOver } = useGame();
  const { restartGame } = useGameLifecycle();

  if (!gameOver) return null;

  const handleRestart = () => {
    restartGame();
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        flexDirection: "column",
      }}
    >
      <h1>Out of Fuel!</h1>
      <button
        onClick={handleRestart}
        style={{ fontSize: "20px", padding: "10px 20px", marginTop: "20px" }}
      >
        Restart (Shift+R / Options)
      </button>
    </div>
  );
}
