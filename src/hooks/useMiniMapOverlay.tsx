import { useEffect, useRef } from "react";

export function MiniMapOverlay({
  canvas,
}: {
  canvas: HTMLCanvasElement | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    container.innerHTML = "";
    if (canvas) {
      container.appendChild(canvas);
    }
    return () => {
      if (canvas && canvas.parentElement === container) {
        container.removeChild(canvas);
      }
    };
  }, [canvas]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        bottom: 24,
        right: 24,
        width: 220,
        height: 220,
        borderRadius: 12,
        overflow: "hidden",
        background: "rgba(20, 24, 32, 0.6)",
        border: "2px solid rgba(255, 255, 255, 0.3)",
        boxShadow: "0 12px 20px rgba(0, 0, 0, 0.35)",
        pointerEvents: "none",
      }}
    />
  );
}
