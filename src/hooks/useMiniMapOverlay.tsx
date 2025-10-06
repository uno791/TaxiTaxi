import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type { Vector3 } from "three";
import type { MissionTargetInfo } from "../components/Missions/Mission";

type MiniMapOverlayProps = {
  canvas: HTMLCanvasElement | null;
  missions: MissionTargetInfo[];
  playerRef: MutableRefObject<Vector3>;
  size?: number;
};

const DEFAULT_SIZE = 220;
const EDGE_PADDING = 18;

export function MiniMapOverlay({
  canvas,
  missions,
  playerRef,
  size = DEFAULT_SIZE,
}: MiniMapOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef(new Map<string, HTMLDivElement>());
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;

    while (host.firstChild) host.removeChild(host.firstChild);
    if (canvas) host.appendChild(canvas);

    return () => {
      if (canvas && canvas.parentElement === host) host.removeChild(canvas);
    };
  }, [canvas]);

  useEffect(() => {
    const markers = markerRefs.current;
    let disposed = false;
    const center = size / 2;
    const radius = Math.max(center - EDGE_PADDING, 0);

    const update = () => {
      if (disposed) return;
      const playerPosition = playerRef.current;
      if (!playerPosition) {
        markers.forEach((m) => (m.style.opacity = "0"));
        animationFrameRef.current = requestAnimationFrame(update);
        return;
      }

      const active = new Set<string>();

      for (let index = 0; index < missions.length; index++) {
        const mission = missions[index];
        const marker = markers.get(mission.id);
        if (!marker) continue;

        const dx = mission.position[0] - playerPosition.x;
        const dz = mission.position[2] - playerPosition.z;

        if (!Number.isFinite(dx) || !Number.isFinite(dz)) {
          marker.style.opacity = "0";
          continue;
        }

        const lengthSq = dx * dx + dz * dz;
        if (lengthSq < 1e-6) {
          marker.style.opacity = "0";
          continue;
        }

        const angle = Math.atan2(dz, dx);
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;

        marker.style.left = `${x}px`;
        marker.style.top = `${y}px`;
        marker.style.transform = `translate(-50%, -50%)`;
        marker.style.opacity = "1";
        active.add(mission.id);
      }

      markers.forEach((marker, id) => {
        if (!active.has(id)) marker.style.opacity = "0";
      });

      animationFrameRef.current = requestAnimationFrame(update);
    };

    animationFrameRef.current = requestAnimationFrame(update);

    return () => {
      disposed = true;
      const frameId = animationFrameRef.current;
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [missions, playerRef, size]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        bottom: 24,
        right: 24,
        width: size,
        height: size,
        borderRadius: 12,
        overflow: "hidden",
        background: "rgba(20, 24, 32, 0.6)",
        border: "2px solid rgba(255, 255, 255, 0.3)",
        boxShadow: "0 12px 20px rgba(0, 0, 0, 0.35)",
        pointerEvents: "none",
      }}
    >
      <div
        ref={canvasHostRef}
        style={{
          position: "absolute",
          inset: 0,
        }}
      />
      {missions.map((mission) => (
        <div
          key={mission.id}
          ref={(node) => {
            const map = markerRefs.current;
            if (node) {
              node.style.opacity = "0";
              map.set(mission.id, node);
            } else {
              map.delete(mission.id);
            }
          }}
          style={{
            position: "absolute",
            width: 22,
            height: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "900",
            fontSize: "16px",
            color: "#001B66", // dark blue
            background: "rgba(255, 255, 255, 0.8)",
            borderRadius: "50%",
            boxShadow: "0 0 6px rgba(0, 0, 0, 0.4)",
            transform: "translate(-50%, -50%)",
            opacity: 0,
            transition: "opacity 0.2s ease",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          M
        </div>
      ))}
    </div>
  );
}
