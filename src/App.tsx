import { useRef, useState } from "react";
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

const DEFAULT_DESTINATION = new THREE.Vector3(48, 0, -46);

import Mission from "./components/Missions/Mission";
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

function GameWorld() {
  const chaseRef = useRef<THREE.Object3D | null>(null);
  const [controlMode, setControlMode] = useState<ControlMode>("keyboard");
  const [isPaused, setIsPaused] = useState(false);

  const playerPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const destinationRef = useRef(DEFAULT_DESTINATION.clone());
  const [miniMapCanvas, setMiniMapCanvas] = useState<HTMLCanvasElement | null>(
    null
  );

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
              isPaused={isPaused}
              playerPositionRef={playerPositionRef}
            />
            <Mission position={[0, 0, 0]} taxiRef={chaseRef} />
            <DestinationMarker destinationRef={destinationRef} />
            <NavigationSystem
              playerRef={playerPositionRef}
              destinationRef={destinationRef}
              onMiniMapCanvasChange={setMiniMapCanvas}
            />
            {/* Camera */}
            {<CameraChase target={chaseRef} />}
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
        <MiniMapOverlay canvas={miniMapCanvas} />
        <MissionOverlay />
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
