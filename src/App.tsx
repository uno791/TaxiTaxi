import { useCallback, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import RoadCircuit from "./components/Road/RoadCircuit";
import { TaxiPhysics } from "./components/Taxi/TaxiPhysics";
import { CameraChase } from "./components/Taxi/CameraChase";
import AllBuildings from "./components/City/AllBuildings";
import Background from "./components/City/Background";
import { NavigationSystem } from "./components/Navigation/NavigationSystem";
import { DestinationMarker } from "./components/Navigation/DestinationMarker";
import { MiniMapOverlay } from "./hooks/useMiniMapOverlay";

import Mission, { type MissionTargetInfo } from "./components/Missions/Mission";
import GameUI from "./components/UI/GameUI";
import GameOverPopup from "./components/UI/GameOverPopup";
import { Physics } from "@react-three/cannon";
import type { ControlMode } from "./components/Taxi/useControls";
import { TaxiControlSettings } from "./components/Taxi/TaxiControlSettings";
import TaxiSpeedometer from "./components/Taxi/TaxiSpeedometer";
import UpgradeMenu from "./components/UI/UpgradeMenu";
import { MissionUIProvider } from "./components/Missions/MissionUIContext";
import MissionOverlay from "./components/Missions/MissionOverlay";
import FogEffect from "./components/FogEffect";

import LoginScreen from "./components/UI/LoginScreen";
import EntranceScreen from "./components/UI/EntranceScreen";
import CarSelector from "./components/CarSelector/CarSelector";

import { MetaProvider, useMeta } from "./context/MetaContext";
import { useFlightMode } from "./tools/FlightTool";
import NewCityRoad from "./components/Ground/NewCityRoad";
import Level2 from "./components/City2/Level2";

function GameWorld() {
  const chaseRef = useRef<THREE.Object3D | null>(null);
  const [controlMode, setControlMode] = useState<ControlMode>("keyboard");
  const [isPaused, setIsPaused] = useState(false);
  const [lightingMode, setLightingMode] = useState<"fake" | "fill">("fake");

  const playerPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const destinationRef = useRef(
    new THREE.Vector3(Number.NaN, Number.NaN, Number.NaN)
  );
  const [miniMapCanvas, setMiniMapCanvas] = useState<HTMLCanvasElement | null>(
    null
  );
  const [availableMissionTargets, setAvailableMissionTargets] = useState<
    MissionTargetInfo[]
  >([]);
  const updateDestination = useCallback(
    (position: [number, number, number] | null) => {
      if (position) {
        destinationRef.current.set(
          position[0],
          Number.isFinite(position[1]) ? position[1] : 0,
          position[2]
        );
      } else {
        destinationRef.current.set(Number.NaN, Number.NaN, Number.NaN);
      }
    },
    [destinationRef]
  );
  const handleAvailableMissionTargetsChange = useCallback(
    (targets: MissionTargetInfo[]) => {
      setAvailableMissionTargets((previous) => {
        if (previous.length === targets.length) {
          let identical = true;
          for (let index = 0; index < targets.length; index += 1) {
            const next = targets[index];
            const prev = previous[index];
            if (!prev || prev.id !== next.id) {
              identical = false;
              break;
            }
            if (
              prev.position[0] !== next.position[0] ||
              prev.position[1] !== next.position[1] ||
              prev.position[2] !== next.position[2]
            ) {
              identical = false;
              break;
            }
          }
          if (identical) {
            return previous;
          }
        }
        return targets;
      });
    },
    []
  );

  const {
    enabled: flightEnabled,
    overlay: flightOverlay,
    flightControls,
  } = useFlightMode({
    onEnable: () => setIsPaused(false),
  });

  const toggleLightingMode = useCallback(() => {
    setLightingMode((previous) => (previous === "fake" ? "fill" : "fake"));
  }, []);

  return (
    <MissionUIProvider>
      <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
        <Canvas shadows camera={{ position: [0, 5, -10], fov: 50 }}>
          <FogEffect />
          <Physics
            gravity={[0, -9.81, 0]}
            broadphase="SAP"
            allowSleep
            iterations={18}
            tolerance={1e-5}
            stepSize={1 / 120}
            maxSubSteps={6}
          >
            {/* Lighting */}
            {lightingMode === "fill" ? (
              <hemisphereLight args={["#8aa6ff", "#1b1e25", 0.35]} />
            ) : null}

            {/* World */}
            <AllBuildings />
            <RoadCircuit position={[0, 0, 0]} />
            <NewCityRoad />
            <Background position={[0, 0, 0]} />

            <Level2/>

            {/* Taxi — unchanged from original */}
            <TaxiPhysics
              chaseRef={chaseRef}
              controlMode={controlMode}
              isPaused={isPaused || flightEnabled}
              playerPositionRef={playerPositionRef}
            />
            <Mission
              position={[0, 0, 0]}
              taxiRef={chaseRef}
              onDestinationChange={updateDestination}
              onAvailableMissionTargetsChange={
                handleAvailableMissionTargetsChange
              }
            />
            <DestinationMarker destinationRef={destinationRef} />
            <NavigationSystem
              playerRef={playerPositionRef}
              destinationRef={destinationRef}
              onMiniMapCanvasChange={setMiniMapCanvas}
            />
            {/* Camera */}
            {!flightEnabled && <CameraChase target={chaseRef} />}
            {flightControls}
            <OrbitControls makeDefault />
          </Physics>
        </Canvas>

        {/* Controls */}
        <TaxiControlSettings
          controlMode={controlMode}
          onControlModeChange={setControlMode}
          isPaused={isPaused}
          onPauseChange={setIsPaused}
        />

        {/* UI overlay */}
        <TaxiSpeedometer />
        <GameUI />
        <GameOverPopup />
        <UpgradeMenu />
        <MiniMapOverlay
          canvas={miniMapCanvas}
          missions={availableMissionTargets}
          playerRef={playerPositionRef}
          size={220}
        />
        <MissionOverlay />
        {flightOverlay}
        <button
          type="button"
          onClick={toggleLightingMode}
          style={{
            position: "absolute",
            top: 16,
            left: 84,
            zIndex: 30,
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 8,
            background: "rgba(24, 28, 35, 0.8)",
            color: "#f5f5f5",
            padding: "6px 12px",
            fontSize: "0.85rem",
            cursor: "pointer",
            backdropFilter: "blur(2px)",
          }}
          title="Toggle between fake decal lighting and a global fill light."
        >
          {lightingMode === "fake"
            ? "Lighting: Decals Only"
            : "Lighting: Global Fill"}
        </button>
      </div>
    </MissionUIProvider>
    
  );
}

function AppContent() {
  const { appStage } = useMeta();

  if (appStage === "login") return <LoginScreen />;
  if (appStage === "entrance") return <EntranceScreen />;
  if (appStage === "car") return <CarSelector />;

  // Game stage → identical GameWorld
  return <GameWorld />;
}

export default function App() {
  return (
    <MetaProvider>
      <AppContent />
    </MetaProvider>
  );
}
