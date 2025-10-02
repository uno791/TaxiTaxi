import { useMeta } from "../../context/MetaContext";
import entranceBackground from "../../assets/entrance.png";

export default function EntranceScreen() {
  const { currentUser, setAppStage } = useMeta();

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
      {/* 🔹 Overlay to make text pop */}
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

      {/* 🔹 Button */}
      <button
        style={{
          zIndex: 1,
          marginBottom: "80px",
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
        onClick={() => setAppStage("car")}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#ffd633")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#ffcc00")
        }
      >
        Start Game
      </button>
    </div>
  );
}
