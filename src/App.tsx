import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import RoadCircuit from "./components/Road/RoadCircuit";
import { TaxiController } from "./components/Taxi/TaxiControls";
import AllBuildings from "./components/City/AllBuildings";
import Background from "./components/City/Background";

// UI imports
import GameUI from "./components/UI/GameUI";
import GameOverPopup from "./components/UI/GameOverPopup";
import Speedometer from "./components/UI/Speedometer"; // NEW

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas shadows camera={{ position: [0, 5, -10], fov: 50 }}>
        {/* Night sky background + fog */}
        <color attach="background" args={["#0a0a1a"]} />
        <fog attach="fog" args={["#0a0a1a", 10, 100]} />

        {/* Lights for night atmosphere */}
        <ambientLight intensity={0.2} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={0.4}
          color={"#aabbff"} // moonlight tint
          castShadow
        />
        <hemisphereLight args={["#223355", "#000000", 0.2]} />

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
      <Speedometer /> {/* NEW */}
      <GameOverPopup />
    </div>
  );
}
