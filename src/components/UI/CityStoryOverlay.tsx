import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CityStory } from "../../constants/cities";

type Props = {
  storyId: string | null;
  story: CityStory | null;
  onContinue: () => void;
};

export default function CityStoryOverlay({
  storyId,
  story,
  onContinue,
}: Props) {
  const [displayedText, setDisplayedText] = useState("");
  const [typingComplete, setTypingComplete] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);

  const fullText = useMemo(() => {
    if (!story) return "";
    return story.lines.join("\n\n");
  }, [story]);

  useEffect(() => {
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (!storyId || !story) {
      setDisplayedText("");
      setTypingComplete(false);
      return;
    }

    setDisplayedText("");
    const shouldType = fullText.length > 0;
    setTypingComplete(!shouldType);
  }, [storyId, story, fullText]);

  useEffect(() => {
    if (!storyId || !story) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
        if (!typingComplete) {
          setDisplayedText(fullText);
          setTypingComplete(true);
          if (typingTimeoutRef.current) {
            window.clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
          }
          return;
        }
        onContinue();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [storyId, story, fullText, typingComplete, onContinue]);

  useEffect(() => {
    if (!storyId || !story) return;
    if (typingComplete) return;

    if (displayedText.length >= fullText.length) {
      setDisplayedText(fullText);
      setTypingComplete(true);
      return;
    }

    const nextChar = fullText.charAt(displayedText.length);
    const baseDelay = 34;
    let delay = baseDelay + Math.random() * 12;

    if (".?!".includes(nextChar)) {
      delay = baseDelay * 6;
    } else if (",;:".includes(nextChar)) {
      delay = baseDelay * 3;
    } else if (nextChar === "\n") {
      delay = baseDelay * 4;
    } else if (nextChar === " ") {
      const previousChar = fullText.charAt(displayedText.length - 1);
      if (previousChar === "-" || previousChar === "\u2014") {
        delay = baseDelay * 2.5;
      }
    }

    const timeoutId = window.setTimeout(() => {
      setDisplayedText((prev) => fullText.slice(0, prev.length + 1));
    }, Math.max(delay, 18));

    typingTimeoutRef.current = timeoutId;

    return () => window.clearTimeout(timeoutId);
  }, [storyId, story, fullText, displayedText, typingComplete]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, []);

  const handleContinue = useCallback(() => {
    if (!storyId || !story) return;
    if (!typingComplete) {
      setDisplayedText(fullText);
      setTypingComplete(true);
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      return;
    }
    onContinue();
  }, [storyId, story, typingComplete, fullText, onContinue]);

  if (!storyId || !story) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#000",
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
          background: "#000",
          boxShadow: "none",
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
          whiteSpace: "pre-wrap",
          minHeight: "200px",
          letterSpacing: "0.01em",
          color: "rgba(245,245,245,0.96)",
        }}
      >
        {displayedText}
      </div>
      <button
        type="button"
        onClick={handleContinue}
        style={{
          padding: "12px 28px",
          borderRadius: "999px",
          border: "3px solid #34040a",
          background: typingComplete ? "#c21807" : "rgba(194, 24, 7, 0.6)",
          color: "#f8f5f5",
          fontWeight: 600,
          cursor: "pointer",
          fontSize: "16px",
          boxShadow: typingComplete
            ? "0 16px 28px rgba(0,0,0,0.5)"
            : "0 12px 18px rgba(0,0,0,0.35)",
          transition: "transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
        }}
        onMouseDown={(event) => {
          event.currentTarget.style.transform = "scale(0.97)";
          event.currentTarget.style.boxShadow = "0 10px 16px rgba(0,0,0,0.45)";
        }}
        onMouseUp={(event) => {
          event.currentTarget.style.transform = "scale(1)";
          event.currentTarget.style.boxShadow = typingComplete
            ? "0 16px 28px rgba(0,0,0,0.5)"
            : "0 12px 18px rgba(0,0,0,0.35)";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.transform = "scale(1)";
          event.currentTarget.style.boxShadow = typingComplete
            ? "0 16px 28px rgba(0,0,0,0.5)"
            : "0 12px 18px rgba(0,0,0,0.35)";
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
          {typingComplete
            ? "Press Space or Enter to continue"
            : "Press Space or Enter to reveal"}
        </div>
      </div>
    </div>
  );
}
