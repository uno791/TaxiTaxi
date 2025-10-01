import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import RoadCircuit from "./components/Road/RoadCircuit";
import { TaxiController } from "./components/Taxi/TaxiControls";
import * as THREE from "three";
import { TaxiPhysics } from "./components/Taxi/TaxiPhysics";
import { CameraChase } from "./components/Taxi/CameraChase";
import AllBuildings from "./components/City/AllBuildings";
import Background from "./components/City/Background";
import { Physics } from "@react-three/cannon";

export default function App() {
  const chaseRef = useRef<THREE.Object3D | null>(null);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas shadows camera={{ position: [0, 5, -10], fov: 50 }}>
        <Physics
          gravity={[0, -2.3, 0]}
          broadphase="SAP"
          allowSleep
          iterations={12}
          tolerance={1.005}
          stepSize={1 / 120}
          maxSubSteps={4}
        >
          <ambientLight intensity={2} />
          <directionalLight position={[10, 5, 2]} castShadow />

          {/* BUILDINGS*/}
          {/*<AllBuildings position={[0, 0, 0]} />}

          {/* ROAD */}
          <RoadCircuit position={[0, 0, 0]} />
          <Background position={[0, 0, 0]} />
          {/* TAXI CONTROLLER */}
          <TaxiPhysics chaseRef={chaseRef} />
          <CameraChase target={chaseRef} />
          <OrbitControls makeDefault />
        </Physics>
      </Canvas>
    </div>
  );
}
