import { useCallback, useEffect, useRef, useState } from "react";
import { useMeta } from "../../context/MetaContext";

const FADE_DURATION_MS = 800;

export default function IntroCinematic() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasCompletedRef = useRef(false);
  const { setAppStage } = useMeta();
  const [isFading, setIsFading] = useState(false);

  const transitionToLevel = useCallback(() => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    setIsFading(true);

    window.setTimeout(() => {
      setAppStage("level");
    }, FADE_DURATION_MS);
  }, [setAppStage]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => transitionToLevel();
    video.addEventListener("ended", handleEnded);

    const tryPlay = async () => {
      try {
        await video.play();
      } catch {
        // If autoplay with audio is blocked, fall back to muted playback.
        video.muted = true;
        video.play().catch(() => {
          /* ignored */
        });
      }
    };

    tryPlay();

    return () => {
      video.removeEventListener("ended", handleEnded);
    };
  }, [transitionToLevel]);

  const handleSkip = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
    transitionToLevel();
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <video
        ref={videoRef}
        src="/videos/intro-cinematic.mp4"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: isFading ? 0 : 1,
          transition: `opacity ${FADE_DURATION_MS}ms ease`,
        }}
        playsInline
        autoPlay
      />

      <button
        onClick={handleSkip}
        style={{
          position: "absolute",
          bottom: "40px",
          right: "40px",
          padding: "12px 24px",
          backgroundColor: "rgba(0,0,0,0.6)",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
          letterSpacing: "0.5px",
          transition: "background-color 0.2s ease, transform 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.6)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        Skip
      </button>

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "black",
          pointerEvents: "none",
          opacity: isFading ? 1 : 0,
          transition: `opacity ${FADE_DURATION_MS}ms ease`,
        }}
      />
    </div>
  );
}
