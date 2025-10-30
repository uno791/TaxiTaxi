import { useState } from "react";
import { useMeta } from "../../context/MetaContext";
import { useGameLifecycle } from "../../GameContext";
import { cars } from "../../utils/cars";
import CarViewer from "./CarViewer";

export default function CarSelector() {
  const { currentUser, setAppStage, setSelectedCar } = useMeta();
  const { isFreeRoam } = useGameLifecycle();
  const [index, setIndex] = useState(0);

  if (!currentUser) return null;

  // find highest unlocked level
  let unlockedLevel = 0;
  for (let i = currentUser.levels.length - 1; i >= 0; i--) {
    if (currentUser.levels[i] === 1) {
      unlockedLevel = i + 1;
      break;
    }
  }

  const car = cars[index];
  const isUnlocked = isFreeRoam || unlockedLevel >= car.requiredLevel;

  const handleNext = () => setIndex((i) => (i + 1) % cars.length);
  const handlePrev = () => setIndex((i) => (i - 1 + cars.length) % cars.length);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "radial-gradient(circle at top, #1b1b1b, #0a0a0a)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "30px",
        fontFamily: "sans-serif",
      }}
    >
      {/* Title */}
      <h1
        style={{
          marginTop: "20px",
          fontSize: "42px",
          fontWeight: "bold",
          letterSpacing: "2px",
          textTransform: "uppercase",
          textShadow: "0 0 15px rgba(255, 255, 255, 0.6)",
        }}
      >
        Select Your Car
      </h1>

      {/* Car showcase frame */}
      <div
        style={{
          flex: 1,
          width: "70%",
          maxWidth: "900px",
          height: "60%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "12px",
          boxShadow:
            "0 0 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.05)",
          background: "rgba(20,20,20,0.8)",
          overflow: "hidden",
        }}
      >
        <CarViewer modelPath={car.modelPath} />

        {!isUnlocked && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              fontWeight: "bold",
              color: "#ff5555",
              letterSpacing: "1px",
              backdropFilter: "blur(2px)",
            }}
          >
            Locked — Requires Level {car.requiredLevel}
          </div>
        )}
      </div>

      {/* Car name */}
      <h2
        style={{
          margin: "20px 0 10px 0",
          fontSize: "28px",
          fontWeight: "600",
          textShadow: "0 0 12px rgba(255,255,255,0.4)",
        }}
      >
        {car.name}
      </h2>

      {/* Controls */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "40px" }}>
        <button
          onClick={handlePrev}
          style={{
            padding: "14px 24px",
            fontSize: "20px",
            borderRadius: "6px",
            border: "none",
            background: "linear-gradient(135deg, #444, #222)",
            color: "white",
            cursor: "pointer",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 0 12px rgba(255,255,255,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          ◀
        </button>

        <button
          onClick={() => {
            if (isUnlocked) {
              setSelectedCar(car.modelPath); // store chosen car
              setAppStage("level"); // move to level select
            }
          }}
          disabled={!isUnlocked}
          style={{
            padding: "14px 36px",
            fontSize: "20px",
            fontWeight: "bold",
            borderRadius: "6px",
            border: "none",
            background: isUnlocked
              ? "linear-gradient(135deg, #00c853, #009624)"
              : "linear-gradient(135deg, #333, #111)",
            color: isUnlocked ? "#fff" : "#777",
            cursor: isUnlocked ? "pointer" : "not-allowed",
            boxShadow: isUnlocked ? "0 0 20px rgba(0,200,83,0.6)" : "none",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (isUnlocked) {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 0 25px rgba(0,200,83,0.8)";
            }
          }}
          onMouseLeave={(e) => {
            if (isUnlocked) {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(0,200,83,0.6)";
            }
          }}
        >
          {isUnlocked ? "Select" : "Locked"}
        </button>

        <button
          onClick={handleNext}
          style={{
            padding: "14px 24px",
            fontSize: "20px",
            borderRadius: "6px",
            border: "none",
            background: "linear-gradient(135deg, #444, #222)",
            color: "white",
            cursor: "pointer",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 0 12px rgba(255,255,255,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          ▶
        </button>
      </div>
    </div>
  );
}
