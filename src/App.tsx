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
import { MissionUIProvider } from "./components/Missions/MissionUIContext";
import MissionOverlay from "./components/Missions/MissionOverlay";

import LoginScreen from "./components/UI/LoginScreen";
import EntranceScreen from "./components/UI/EntranceScreen";
import CarSelector from "./components/CarSelector/CarSelector";

import { MetaProvider, useMeta } from "./context/MetaContext";
import { useFlightMode } from "./tools/FlightTool";

function GameWorld() {
  const chaseRef = useRef<THREE.Object3D | null>(null);
  const [controlMode, setControlMode] = useState<ControlMode>("keyboard");
  const [isPaused, setIsPaused] = useState(false);

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

  return (
    <MissionUIProvider>
      <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
        <Canvas shadows camera={{ position: [0, 5, -10], fov: 50 }}>
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
            <ambientLight intensity={2} />
            <directionalLight position={[10, 5, 2]} castShadow />

            {/* World */}
            <AllBuildings />
            <RoadCircuit position={[0, 0, 0]} />
            <Background position={[0, 0, 0]} />

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
        <MiniMapOverlay
          canvas={miniMapCanvas}
          missions={availableMissionTargets}
          playerRef={playerPositionRef}
          size={220}
        />
        <MissionOverlay />
        {flightOverlay}
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
