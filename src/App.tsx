import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import RoadCircuit from "./components/Road/RoadCircuit";
import { TaxiController } from "./components/Taxi/TaxiControls";
import AllBuildings from "./components/City/AllBuildings";
import Background from "./components/City/Background";

// NEW UI imports
import GameUI from "./components/UI/GameUI";
import GameOverPopup from "./components/UI/GameOverPopup";

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas shadows camera={{ position: [0, 5, -10], fov: 50 }}>
        <ambientLight intensity={2} />
        <directionalLight position={[10, 5, 2]} castShadow />

        {/* BUILDINGS */}
        <AllBuildings position={[0, 0, 0]} />

        {/* ROAD */}
        <RoadCircuit position={[0, 0, 0]} />
        <Background position={[0, 0, 0]} />

        {/* TAXI CONTROLLER */}
        <TaxiController />

        <OrbitControls makeDefault />
      </Canvas>

      {/* UI overlay */}
      <GameUI />
      <GameOverPopup />
    </div>
  );
}
