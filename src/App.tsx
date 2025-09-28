import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import RoadCircuit from "./components/Road/RoadCircuit";
import { TaxiController } from "./components/Taxi/TaxiControls"; // ✅ use controller, not raw Taxi

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
        {/* Lights */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 5, 2]} castShadow />
        {/* Scene objects */}
        <RoadCircuit position={[0, 0, 0]} />
        <TaxiController /> {/* 🚖 Handles movement + camera follow */}
        {/* Controls (optional — remove if you want camera to only follow taxi) */}
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}
