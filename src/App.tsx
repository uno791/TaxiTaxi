import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import RoadCircuit from "./components/Road/RoadCircuit";
import { TaxiController } from "./components/Taxi/TaxiControls";
import AllBuildings from "./components/City/AllBuildings";
import Background from "./components/City/Background";
import { NavigationSystem } from "./components/Navigation/NavigationSystem";
import { DestinationMarker } from "./components/Navigation/DestinationMarker";

function MiniMapOverlay({ canvas }: { canvas: HTMLCanvasElement | null }) {
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

const DEFAULT_DESTINATION = new THREE.Vector3(48, 0, -46);

export default function App() {
  const playerPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const destinationRef = useRef(DEFAULT_DESTINATION.clone());
  const [miniMapCanvas, setMiniMapCanvas] = useState<HTMLCanvasElement | null>(null);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas shadows camera={{ position: [0, 5, -10], fov: 50 }}>
        <ambientLight intensity={2} />
        <directionalLight position={[10, 5, 2]} castShadow />

        {/* BUILDINGS*/}
        <AllBuildings position={[0, 0, 0]} />

        {/* ROAD */}
        <RoadCircuit position={[0, 0, 0]} />
        <Background position={[0, 0, 0]} />

        <DestinationMarker destinationRef={destinationRef} />
        <TaxiController positionRef={playerPositionRef} />
        <NavigationSystem
          playerRef={playerPositionRef}
          destinationRef={destinationRef}
          onMiniMapCanvasChange={setMiniMapCanvas}
        />

        <OrbitControls makeDefault />
      </Canvas>
      <MiniMapOverlay canvas={miniMapCanvas} />
    </div>
  );
}
