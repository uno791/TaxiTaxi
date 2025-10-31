import { useEffect, type FC } from "react";

interface CreditsModalProps {
  onClose: () => void;
}

const CreditsModal: FC<CreditsModalProps> = ({ onClose }) => {
  // Auto-scroll effect for credits
  useEffect(() => {
    const container = document.getElementById("credits-scroll");
    if (!container) return;
    container.scrollTop = 0;
    let scrollInterval: number;
    scrollInterval = window.setInterval(() => {
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight
      ) {
        clearInterval(scrollInterval);
      } else {
        container.scrollTop += 0.5; // Adjust for faster/slower scroll
      }
    }, 16); // ~60fps
    return () => clearInterval(scrollInterval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backdropFilter: "blur(6px)",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        zIndex: 1000,
        animation: "fadeIn 0.3s ease",
        fontFamily: "'Poppins', sans-serif",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "rgba(15, 15, 15, 0.9)",
          border: "1px solid rgba(255, 204, 0, 0.2)",
          borderRadius: "14px",
          width: "80%",
          maxWidth: "700px",
          height: "80vh",
          boxShadow: "0 0 30px rgba(0,0,0,0.8)",
          overflow: "hidden",
          color: "#f5f5f5",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          animation: "scaleIn 0.35s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 14,
            background: "none",
            border: "none",
            color: "#ffcc00",
            fontSize: "24px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          ×
        </button>

        {/* Header */}
        <h2
          style={{
            textAlign: "center",
            color: "#ffcc00",
            fontSize: "2rem",
            letterSpacing: "2px",
            margin: "20px 0 10px 0",
          }}
        >
          CREDITS
        </h2>

        {/* Scrollable content */}
        <div
          id="credits-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            textAlign: "center",
            padding: "0 30px 30px",
            scrollbarWidth: "thin",
          }}
        >
          <h3 style={{ color: "#ffcc00", marginTop: "20px" }}>Tenko Studios</h3>
          <p style={{ lineHeight: 1.8, marginBottom: "25px" }}>
            Harshil Vallabh – 2656158
            <br />
            Kamal Lalloo – 2652159
            <br />
            Matthew Purkiss – 2697424
            <br />
            Sunay Master – 2677874
            <br />
            Yabsira Gebremichael – 2661262
          </p>

          <h3 style={{ color: "#ffcc00", marginTop: "10px" }}>Models Used</h3>

          <div
            style={{
              textAlign: "left",
              display: "inline-block",
              lineHeight: 1.8,
              fontSize: "0.95rem",
            }}
          >
            <p>
              • Adventurer — Quaternius
              <br />
              <a
                href="https://poly.pizza/m/5EGWBMpuXq"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#ffcc00", textDecoration: "none" }}
              >
                https://poly.pizza/m/5EGWBMpuXq
              </a>
            </p>

            <p>
              • Animated Woman — Quaternius
              <br />
              <a
                href="https://poly.pizza/m/9kF7eTDbhO"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#ffcc00", textDecoration: "none" }}
              >
                https://poly.pizza/m/9kF7eTDbhO
              </a>
            </p>

            <p>
              • Barrier Large — Quaternius
              <br />
              <a
                href="https://poly.pizza/m/gLbBiYwt7l"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#ffcc00", textDecoration: "none" }}
              >
                https://poly.pizza/m/gLbBiYwt7l
              </a>
            </p>

            <p>
              • Basketball court — Poly by Google
              <br />
              <a
                href="https://poly.pizza/m/85FpUr2fHkH"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#ffcc00", textDecoration: "none" }}
              >
                https://poly.pizza/m/85FpUr2fHkH
              </a>
            </p>

            <p>
              • Bench — Ev Amitay
              <br />
              <a
                href="https://poly.pizza/m/dOSjmdmKaxi"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#ffcc00", textDecoration: "none" }}
              >
                https://poly.pizza/m/dOSjmdmKaxi
              </a>
            </p>

            <p>
              • Bicycle — Poly by Google
              <br />
              <a
                href="https://poly.pizza/m/19VoUuA2pcN"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#ffcc00", textDecoration: "none" }}
              >
                https://poly.pizza/m/19VoUuA2pcN
              </a>
            </p>

            <p>
              • Big Building — Quaternius
              <br />
              <a
                href="https://poly.pizza/m/AVCS8jUd2l"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#ffcc00", textDecoration: "none" }}
              >
                https://poly.pizza/m/AVCS8jUd2l
              </a>
            </p>

            <p>
              • Billboard — Poly by Google
              <br />
              <a
                href="https://poly.pizza/m/e5jmUgocmaT"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#ffcc00", textDecoration: "none" }}
              >
                https://poly.pizza/m/e5jmUgocmaT
              </a>
            </p>
          </div>

          <p
            style={{
              marginTop: "40px",
              fontStyle: "italic",
              fontSize: "1.1rem",
              color: "#ffcc00",
            }}
          >
            Thanks for playing!
          </p>
        </div>
      </div>

      {/* Animations and font import */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default CreditsModal;
