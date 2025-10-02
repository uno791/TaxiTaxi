import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense } from "react";
import { Group } from "three";
import { cars } from "../../utils/cars";

function CarModel({
  modelPath,
  scale,
  offset,
}: {
  modelPath: string;
  scale: number;
  offset: [number, number, number];
}) {
  const { scene } = useGLTF(modelPath) as { scene: Group };
  return (
    <primitive
      object={scene}
      // Slight showroom angle (-30° around Y axis)
      rotation={[0, -Math.PI / 6, 0]}
      // Scale up only for preview
      scale={[scale * 5.5, scale * 5.5, scale * 5.5]}
      // Nudge downward so centered in camera
      position={[offset[0], offset[1] - 0.2, offset[2]]}
    />
  );
}

export default function CarViewer({ modelPath }: { modelPath: string }) {
  const carConfig =
    cars.find((c) => c.modelPath === modelPath) ||
    cars.find((c) => c.name === "Taxi")!;

  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} />
      <Suspense fallback={null}>
        <CarModel
          modelPath={carConfig.modelPath}
          scale={carConfig.scale}
          offset={carConfig.offset}
        />
      </Suspense>
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
