import { useGame } from "../../GameContext";

export default function GameUI() {
  const { money, kilometers } = useGame();

  // Format values
  const moneyDisplay = money.toFixed(2);
  const kmDisplay = kilometers.toFixed(2);

  // Percentages for bars
  const moneyPercent = Math.max(0, (money / 1000) * 100);
  const kmPercent = Math.min(100, (kilometers / 100) * 100);

  return (
    <div
      style={{
        position: "absolute",
        top: "15px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "40px",
        fontFamily: "Arial, sans-serif",
        fontSize: "16px",
        fontWeight: "bold",
        color: "#919191ff",
      }}
    >
      {/* Fuel Money */}
      <div style={{ width: "220px" }}>
        <div style={{ marginBottom: "4px" }}>Fuel Money: R{moneyDisplay}</div>
        <div
          style={{
            width: "100%",
            height: "18px",
            background: "#222",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "inset 0 0 4px rgba(0,0,0,0.6)",
          }}
        >
          <div
            style={{
              width: `${moneyPercent}%`,
              height: "100%",
              background:
                moneyPercent > 30
                  ? "linear-gradient(90deg, #4caf50, #2e7d32)" // green shades
                  : "linear-gradient(90deg, #ff5722, #b71c1c)", // red shades when low
              transition: "width 0.2s ease",
            }}
          />
        </div>
      </div>

      {/* Kilometers */}
      <div style={{ width: "220px" }}>
        <div style={{ marginBottom: "4px" }}>Kilometers: {kmDisplay} km</div>
        <div
          style={{
            width: "100%",
            height: "18px",
            background: "#222",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "inset 0 0 4px rgba(0,0,0,0.6)",
          }}
        >
          <div
            style={{
              width: `${kmPercent}%`,
              height: "100%",
              background: "linear-gradient(90deg, #2196f3, #0d47a1)", // blue shades
              transition: "width 0.2s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}
