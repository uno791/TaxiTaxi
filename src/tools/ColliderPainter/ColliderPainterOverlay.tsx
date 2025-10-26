import { useMemo } from "react";
import { useColliderPainter } from "./ColliderPainterContext";

export function ColliderPainterOverlay() {
  const {
    enabled,
    shape,
    cameraHeight,
    activeCity,
    getCollidersForCity,
    copyCityToClipboard,
    clearCity,
  } = useColliderPainter();

  const modeLabel = shape === "box" ? "Box Colliders" : "Cylinder Colliders";
  const collidersCount = getCollidersForCity(activeCity).length;

  const info = useMemo(
    () => ({
      modeLabel,
      collidersCount,
      cameraHeight,
      activeCity,
    }),
    [modeLabel, collidersCount, cameraHeight, activeCity]
  );

  if (!enabled) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        padding: "14px 18px",
        borderRadius: 12,
        background: "rgba(12, 18, 28, 0.85)",
        color: "#f0f6ff",
        fontSize: 14,
        lineHeight: 1.4,
        maxWidth: 320,
        zIndex: 50,
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <strong style={{ fontSize: 15 }}>Collider Painter</strong>
        <span
          style={{
            padding: "4px 8px",
            borderRadius: 6,
            background: "rgba(49, 121, 255, 0.23)",
            fontSize: 12,
          }}
        >
          {info.modeLabel}
        </span>
      </div>
      <div style={{ marginBottom: 8 }}>
        City: <strong>{info.activeCity.toUpperCase()}</strong>
      </div>
      <div style={{ marginBottom: 8 }}>
        Colliders placed: <strong>{info.collidersCount}</strong>
      </div>
      <div style={{ marginBottom: 12 }}>
        Camera height: <strong>{info.cameraHeight.toFixed(1)}</strong>
      </div>
      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 12 }}>
        WASD: pan • 1/2: move down/up • 3/4: switch box/circle • Left click +
        drag: drop collider • ’: exit
      </div>
      <button
        type="button"
        onClick={() => void copyCityToClipboard(activeCity)}
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(44, 95, 255, 0.28)",
          color: "#f0f6ff",
          cursor: "pointer",
          fontSize: 13,
        }}
      >
        Copy {activeCity} data
      </button>
      <button
        type="button"
        onClick={() => {
          const allow =
            typeof window !== "undefined"
              ? window.confirm(
                  `Remove all temporary colliders for ${activeCity.toUpperCase()}?`
                )
              : true;
          if (allow) clearCity(activeCity);
        }}
        style={{
          width: "100%",
          marginTop: 8,
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.18)",
          background: "rgba(255, 82, 82, 0.25)",
          color: "#ffeaea",
          cursor: "pointer",
          fontSize: 13,
        }}
      >
        Clear drawn colliders
      </button>
    </div>
  );
}
