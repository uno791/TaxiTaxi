import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import RoadCircuit from "./components/Road/RoadCircuit";
import { TaxiController } from "./components/Taxi/TaxiControls";
import {
  BuildingRowVariant1,
  BuildingRowVariant2,
  BuildingRowVariant3,
} from "./components/City/BuildingRow";

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
        <ambientLight intensity={2} />
        <directionalLight position={[10, 5, 2]} castShadow />

        {/* BUILDINGS */}
        
        <BuildingRowVariant1 position={[1, 0, -10]} angle={0} />
        <BuildingRowVariant2
          position={[10, 0, -9]}
          angle={Math.PI / 6}
          facingOffset={1.67 * Math.PI}
        />
        <BuildingRowVariant3 position={[-4, 0, -6]} angle={Math.PI / 2} /> 
       

        {/* ROAD */}
        <RoadCircuit position={[0, 0, 0]} />

        {/* TAXI CONTROLLER */}
        <TaxiController />

        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}
