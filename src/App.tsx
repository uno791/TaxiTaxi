import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useState } from "react";
import RoadCircuit from "./components/Road/RoadCircuit";
import * as THREE from "three";
import { TaxiPhysics } from "./components/Taxi/TaxiPhysics";
import { CameraChase } from "./components/Taxi/CameraChase";
import AllBuildings from "./components/City/AllBuildings";
import Background from "./components/City/Background";

// NEW UI imports
import GameUI from "./components/UI/GameUI";
import GameOverPopup from "./components/UI/GameOverPopup";

import { Physics } from "@react-three/cannon";
import type { ControlMode } from "./components/Taxi/useControls";
import { TaxiControlSettings } from "./components/Taxi/TaxiControlSettings";
import TaxiSpeedometer from "./components/Taxi/TaxiSpeedometer";

export default function App() {
  const chaseRef = useRef<THREE.Object3D | null>(null);
  const [controlMode, setControlMode] = useState<ControlMode>("keyboard");
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas shadows camera={{ position: [0, 5, -10], fov: 50 }}>
        <Physics
          gravity={[0, -9.81, 0]}
          broadphase="SAP"
          allowSleep
          iterations={20}
          tolerance={0.001}
          stepSize={1 / 180}
          maxSubSteps={8}
        >
          <ambientLight intensity={2} />
          <directionalLight position={[10, 5, 2]} castShadow />
          <AllBuildings />
          {/* ROAD */}
          <RoadCircuit position={[0, 0, 0]} />
          <Background position={[0, 0, 0]} />
          <TaxiPhysics
            chaseRef={chaseRef}
            controlMode={controlMode}
            isPaused={isPaused}
          />
          <CameraChase target={chaseRef} />
          <OrbitControls makeDefault />
        </Physics>
      </Canvas>

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
    </div>
  );
}
