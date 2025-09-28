import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import RoadCircuit from './components/RoadCircuit'
export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0.15,1 ], fov: 50 }}>
        <ambientLight intensity={0.005} />
        <directionalLight position={[10, 5, 2]} />

        <RoadCircuit position={[0,0,0]}/>

        <OrbitControls makeDefault />
      </Canvas>
    </div>
  )
}
//City Pack by J-Toastie [CC-BY] via Poly Pizza