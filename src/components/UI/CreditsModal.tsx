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
              textAlign: "center",
              display: "inline-block",
              lineHeight: 1.8,
              fontSize: "0.95rem",
            }}
          >
            {[
              ["Adventurer", "https://poly.pizza/m/5EGWBMpuXq", "Quaternius"],
              [
                "Animated Woman",
                "https://poly.pizza/m/9kF7eTDbhO",
                "Quaternius",
              ],
              [
                "Barrier Large",
                "https://poly.pizza/m/gLbBiYwt7l",
                "Quaternius",
              ],
              [
                "Basketball court",
                "https://poly.pizza/m/85FpUr2fHkH",
                "Poly by Google",
              ],
              ["Bench", "https://poly.pizza/m/dOSjmdmKaxi", "Ev Amitay"],
              ["Bicycle", "https://poly.pizza/m/19VoUuA2pcN", "Poly by Google"],
              ["Big Building", "https://poly.pizza/m/AVCS8jUd2l", "Quaternius"],
              [
                "Billboard",
                "https://poly.pizza/m/e5jmUgocmaT",
                "Poly by Google",
              ],
              ["Box", "https://poly.pizza/m/HvjissDrdr", "Kenny"],
              ["Brits House", "https://poly.pizza/m/2K3bGB-w2qa", "Anonymous"],
              [
                "Brown Building",
                "https://poly.pizza/m/fGKIlWGDNH",
                "J-Toastie",
              ],
              [
                "Building Green",
                "https://poly.pizza/m/FmjsfA1eHY",
                "J-Toastie",
              ],
              [
                "Building Red Corner",
                "https://poly.pizza/m/9JuFwnivP0",
                "J-Toastie",
              ],
              ["Building Red", "https://poly.pizza/m/lbNz2dClar", "J-Toastie"],
              ["Bush", "https://poly.pizza/m/d6STyhH76Qe", "Jarlan Perez"],
              ["Camaro ZL1", "https://poly.pizza/m/7bF7UVAoYRG", "Kris Tong"],
              ["Cone", "https://poly.pizza/m/WoXpAJT0oD", "J-Toastie"],
              [
                "Convertible",
                "https://poly.pizza/m/dggOiBLYyuR",
                "Poly by Google",
              ],
              [
                "Debris Papers",
                "https://poly.pizza/m/MujITy1NRR",
                "Quaternius",
              ],
              ["Dumpster", "https://poly.pizza/m/PKsbolkZSr", "Quaternius"],
              [
                "Farm house",
                "https://poly.pizza/m/bHyQe5jzdiQ",
                "Poly by Google",
              ],
              ["Fence", "https://poly.pizza/m/ZSQMyIqPTz", "J-Toastie"],
              ["Ferrari F40", "https://poly.pizza/m/RTwim9bhNd", "PuKkBuMXDD"],
              [
                "Fire hydrant",
                "https://poly.pizza/m/eNPaSEPrst8",
                "Poly by Google",
              ],
              ["Floor Hole", "https://poly.pizza/m/FbJAtOQ8pb", "J-Toastie"],
              ["Flower Pot", "https://poly.pizza/m/u0CrZnpykb", "Zsky"],
              ["Gazebo", "https://poly.pizza/m/b_p530Qy_-t", "Poly by Google"],
              ["Glass", "https://poly.pizza/m/3v7i0dz7Vg", "MilkandBanana"],
              [
                "Grass Tile",
                "https://poly.pizza/m/achm-Cr9Rr3",
                "Adam Tomkins",
              ],
              ["Hedge", "https://poly.pizza/m/So5EAOMoNy", "Isa Lousberg"],
              [
                "Hooded Figure",
                "https://poly.pizza/m/0domsLgwnKq",
                "Thomas DR",
              ],
              [
                "Hospital",
                "https://poly.pizza/m/asNvyjkcSG1",
                "Poly by Google",
              ],
              [
                "House with driveway",
                "https://poly.pizza/m/bnZkUs4qEdG",
                "Poly by Google",
              ],
              ["House", "https://poly.pizza/m/roqiHdrpgc", "Quaternius"],
              [
                "Lamborghini",
                "https://poly.pizza/m/5zUWP5UsLg-",
                "Ignition Labs",
              ],
              ["Mailbox", "https://poly.pizza/m/9gbHlg1IlY", "J-Toastie"],
              [
                "Man hole cover",
                "https://poly.pizza/m/S6aGVNF1Iz",
                "J-Toastie",
              ],
              [
                "Nissan GTR",
                "https://poly.pizza/m/a_HKCtYAv2W",
                "David Sirera",
              ],
              [
                "Path Straight",
                "https://poly.pizza/m/ZuRHRsKWoz",
                "Quaternius",
              ],
              [
                "Planter and Bushes",
                "https://poly.pizza/m/wn85Xr9lM3",
                "J-Toastie",
              ],
              [
                "Play structure",
                "https://poly.pizza/m/ee0cso-KZnC",
                "Emmett “TawpShelf” Baber",
              ],
              ["Power Box", "https://poly.pizza/m/WFVjj4vnGg", "J-Toastie"],
              [
                "Rolls Royce",
                "https://poly.pizza/m/3DtJTlxgO_U",
                "David Sirera",
              ],
              ["Slide", "https://poly.pizza/m/dDe3njWPbg0", "Poly by Google"],
              [
                "Stop sign",
                "https://poly.pizza/m/60GyU9CdZ9r",
                "Poly by Google",
              ],
              ["Streetlight", "https://poly.pizza/m/nFwrlcLvM5", "Quaternius"],
              [
                "Swing set",
                "https://poly.pizza/m/e-IJdcqZH4p",
                "Poly by Google",
              ],
              ["Taxi", "https://poly.pizza/m/x43lOScTpN", "Quaternius"],
              [
                "Tennis court",
                "https://poly.pizza/m/7cVH1Xt-LYy",
                "Poly by Google",
              ],
              ["Blind woman", "https://poly.pizza/m/qJ2gsTUBHL", "Quaternius"],
              ["Tree", "https://poly.pizza/m/cRipmFHCEVU", "Marc Solà"],
            ].map(([name, link, author]) => (
              <p key={name}>
                {name} — {author}
                <br />
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#ffcc00",
                    textDecoration: "none",
                  }}
                >
                  {link}
                </a>
              </p>
            ))}
          </div>
          <h3 style={{ color: "#ffcc00", marginTop: "30px" }}>
            Music & Sounds
          </h3>

          <div
            style={{
              textAlign: "center",
              display: "inline-block",
              lineHeight: 1.8,
              fontSize: "0.95rem",
              marginBottom: "20px",
            }}
          >
            <p>
              ふわっと — 2 8 1 4
              <br />
              <a
                href="https://www.youtube.com/watch?v=8nUDTwTWF5Q"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#ffcc00", textDecoration: "none" }}
              >
                https://www.youtube.com/watch?v=8nUDTwTWF5Q
              </a>
            </p>
            <p>
              A Bad Dream — EarthBound OST
              <br />
              <a
                href="https://www.youtube.com/watch?v=cPfmpoXQC4U"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#ffcc00", textDecoration: "none" }}
              >
                https://www.youtube.com/watch?v=cPfmpoXQC4U
              </a>
            </p>
          </div>

          <h3 style={{ color: "#ffcc00", marginTop: "10px" }}>Intro Video</h3>
          <p style={{ marginBottom: "20px" }}>Used Veo 3</p>

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
