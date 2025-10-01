import { useGame } from "../../GameContext";

export default function Speedometer() {
  const { speed } = useGame();

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        right: "30px",
        background: "rgba(0,0,0,0.7)",
        color: "white",
        padding: "12px 18px",
        borderRadius: "10px",
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        fontWeight: "bold",
        textAlign: "center",
        minWidth: "100px",
      }}
    >
      <div style={{ fontSize: "14px", opacity: 0.8 }}>Speed</div>
      {Math.round(speed)} km/h
    </div>
  );
}
