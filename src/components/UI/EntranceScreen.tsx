import { useState } from "react";
import { useMeta } from "../../context/MetaContext";
import { useGameLifecycle } from "../../GameContext";
import { CITY_SEQUENCE } from "../../constants/cities";
import entranceBackground from "../../assets/entrance.png";
import CreditsModal from "./CreditsModal";

export default function EntranceScreen() {
  const { currentUser, setAppStage, logout } = useMeta();
  const { restartGame, setActiveCity } = useGameLifecycle();
  const defaultCity = CITY_SEQUENCE[0] ?? "city1";
  const [showCredits, setShowCredits] = useState(false);

  const handleStartCampaign = () => {
    setActiveCity(defaultCity);
    restartGame({ mode: "campaign" });
    setAppStage("car");
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
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          padding: "8px 16px",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          color: "#000",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "14px",
          zIndex: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "rgba(255,255,255,1)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.85)")
        }
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
          style={{
            padding: "14px 36px",
            fontSize: "20px",
            fontWeight: "bold",
            backgroundColor: "#ffcc00",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            transition: "transform 0.2s ease, background-color 0.2s ease",
          }}
          onClick={handleStartCampaign}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#ffd633")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#ffcc00")
          }
        >
          Start Game
        </button>

        <button
          style={{
            padding: "14px 36px",
            fontSize: "20px",
            fontWeight: "bold",
            background:
              "linear-gradient(135deg, rgba(57, 73, 171, 0.95), rgba(33, 150, 243, 0.95))",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(33, 150, 243, 0.45)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onClick={handleStartFreeRoam}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.04)";
            e.currentTarget.style.boxShadow =
              "0 6px 20px rgba(33, 150, 243, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow =
              "0 4px 16px rgba(33, 150, 243, 0.45)";
          }}
        >
          Free Roam
        </button>

        {/* 🔹 Credits button */}
        <button
          style={{
            padding: "14px 36px",
            fontSize: "20px",
            fontWeight: "bold",
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.85), rgba(70,70,70,0.9))",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onClick={() => setShowCredits(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.04)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.5)";
          }}
        >
          Credits
        </button>
      </div>

      {/* 🔹 Credits Modal */}
      {showCredits && <CreditsModal onClose={() => setShowCredits(false)} />}
    </div>
  );
}
