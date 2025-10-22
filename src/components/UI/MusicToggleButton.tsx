import type { CSSProperties } from "react";
import musicIcon from "../../assets/music-note-svgrepo-com.svg";
import musicMuteIcon from "../../assets/music-note-slash-svgrepo-com.svg";
import { useMusic } from "../../context/MusicContext";

type ButtonStyle = CSSProperties;

const baseButtonStyle: ButtonStyle = {
  width: 44,
  height: 44,
  borderRadius: "50%",
  border: "none",
  padding: 8,
  background: "rgba(255, 255, 255, 0.85)",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export function MusicToggleButton() {
  const { isMuted, toggleMuted } = useMusic();

  return (
    <button
      type="button"
      onClick={toggleMuted}
      style={baseButtonStyle}
      aria-pressed={!isMuted}
      aria-label={isMuted ? "Unmute music" : "Mute music"}
    >
      <img
        src={isMuted ? musicMuteIcon : musicIcon}
        alt=""
        aria-hidden="true"
        style={{ width: "100%", height: "100%" }}
      />
    </button>
  );
}
