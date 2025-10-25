import { useEffect } from "react";
import type { CityId, CityStory } from "../../constants/cities";

type Props = {
  cityId: CityId | null;
  story: CityStory | null;
  onContinue: () => void;
};

export default function CityStoryOverlay({
  cityId,
  story,
  onContinue,
}: Props) {
  useEffect(() => {
    if (!cityId || !story) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
        onContinue();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cityId, story, onContinue]);

  if (!cityId || !story) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0, 0, 0, 0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          maxWidth: "540px",
          width: "90%",
          padding: "36px 40px",
          borderRadius: "16px",
          background: "rgba(16, 18, 24, 0.85)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.65)",
          color: "#f5f5f5",
          fontFamily: "Arial, sans-serif",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "18px",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {story.title}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            lineHeight: 1.6,
            fontSize: "18px",
            marginBottom: "28px",
          }}
        >
          {story.lines.map((line, index) => (
            <span key={`${cityId}-line-${index}`}>{line}</span>
          ))}
        </div>
        <button
          type="button"
          onClick={onContinue}
          style={{
            padding: "12px 28px",
            borderRadius: "999px",
            border: "none",
            background: "#f5f5f5",
            color: "#111",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "16px",
            boxShadow: "0 12px 18px rgba(0,0,0,0.35)",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
          }}
          onMouseDown={(event) => {
            event.currentTarget.style.transform = "scale(0.97)";
            event.currentTarget.style.boxShadow = "0 8px 12px rgba(0,0,0,0.4)";
          }}
          onMouseUp={(event) => {
            event.currentTarget.style.transform = "scale(1)";
            event.currentTarget.style.boxShadow =
              "0 12px 18px rgba(0,0,0,0.35)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.transform = "scale(1)";
            event.currentTarget.style.boxShadow =
              "0 12px 18px rgba(0,0,0,0.35)";
          }}
        >
          {story.continueLabel ?? "Continue"}
        </button>
        <div
          style={{
            marginTop: "16px",
            fontSize: "13px",
            opacity: 0.7,
            letterSpacing: "0.03em",
          }}
        >
          Press Space or Enter to continue
        </div>
      </div>
    </div>
  );
}
