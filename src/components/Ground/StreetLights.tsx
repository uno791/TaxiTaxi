import type { JSX } from "react/jsx-runtime";
import { GroundGlowDecals } from "./GroundGlowDecals";
import { StreetLight } from "./SceneObjects/StreetLight";

type Vec3 = [number, number, number];

interface StreetLightConfig {
  position: Vec3;
  rotation: Vec3;
  scale: number;
}

const STREET_LIGHTS: ReadonlyArray<StreetLightConfig> = [
  { position: [0, 0, -13.1], scale: 2.3, rotation: [0, Math.PI / 2, 0] },
  { position: [-13.4, 0, -13.1], scale: 2.3, rotation: [0, Math.PI / 2, 0] },
  { position: [-26.8, 0, -12.8], scale: 2.3, rotation: [0, Math.PI * 2.7, 0] },
  { position: [-15.2, 0, -6.8], scale: 2.3, rotation: [0, Math.PI * 1.3, 0] },
  { position: [-30.8, 0, -6.8], scale: 2.3, rotation: [0, Math.PI * 1.75, 0] },
  { position: [-30.8, 0, 10.8], scale: 2.3, rotation: [0, Math.PI * 2.2, 0] },
  { position: [-15.2, 0, 10.8], scale: 2.3, rotation: [0, Math.PI * 2.7, 0] },
  { position: [-6, 0, 2.9], scale: 2.3, rotation: [0, Math.PI / 2, 0] },
  { position: [9, 0, 2.9], scale: 2.3, rotation: [0, Math.PI / 2, 0] },
  { position: [17.8, 0, 2.9], scale: 2.3, rotation: [0, Math.PI / 2, 0] },
  { position: [10.9, 0, -4], scale: 2.3, rotation: [0, Math.PI, 0] },
  { position: [10.9, 0, -34], scale: 2.3, rotation: [0, Math.PI, 0] },
  { position: [4, 0, -38.9], scale: 2.3, rotation: [0, Math.PI * 1.5, 0] },
  { position: [9, 0, -43], scale: 2.3, rotation: [0, Math.PI * 1.77, 0] },
  { position: [9.1, 0, -54.9], scale: 2.3, rotation: [0, Math.PI * 1.77, 0] },
  { position: [10.9, 0, -54.9], scale: 2.3, rotation: [0, Math.PI * 1.33, 0] },
  { position: [6.9, 0, -60.9], scale: 2.3, rotation: [0, Math.PI * 1.33, 0] },
  { position: [-10.9, 0, -60.9], scale: 2.3, rotation: [0, Math.PI * 1.77, 0] },
  { position: [-10.9, 0, -45.1], scale: 2.3, rotation: [0, Math.PI * 2.33, 0] },
  { position: [18.5, 0, -55.1], scale: 2.3, rotation: [0, Math.PI / 2, 0] },
  { position: [35, 0, -55.1], scale: 2.3, rotation: [0, Math.PI / 2, 0] },
  { position: [50, 0, -55.1], scale: 2.3, rotation: [0, Math.PI / 2, 0] },
  { position: [50, 0, -60.9], scale: 2.3, rotation: [0, Math.PI * 1.5, 0] },
  { position: [54.9, 0, -58], scale: 2.3, rotation: [0, Math.PI, 0] },
  { position: [63.1, 0, -58], scale: 2.3, rotation: [0, Math.PI * 2, 0] },
  { position: [63.1, 0, -50], scale: 2.3, rotation: [0, Math.PI * 2, 0] },
  { position: [63.1, 0, -40.9], scale: 2.3, rotation: [0, Math.PI * 1.77, 0] },
  { position: [57, 0, -35], scale: 2.3, rotation: [0, Math.PI * 1.77, 0] },
  { position: [50, 0, -34.9], scale: 2.3, rotation: [0, Math.PI * 1.5, 0] },
  { position: [50, 0, -40.9], scale: 2.3, rotation: [0, Math.PI * 1.5, 0] },
  { position: [42.9, 0, -40.9], scale: 2.3, rotation: [0, Math.PI * 1.33, 0] },
  { position: [41, 0, -17], scale: 2.3, rotation: [0, Math.PI * 2, 0] },
  { position: [27, 0, -17], scale: 2.3, rotation: [0, Math.PI * 2.77, 0] },
  { position: [29.1, 0, 0.9], scale: 2.3, rotation: [0, Math.PI * 2.33, 0] },
  { position: [38, 0, 0.9], scale: 2.3, rotation: [0, Math.PI / 2, 0] },
  { position: [46.9, 0, 0.9], scale: 2.3, rotation: [0, Math.PI / 1.33, 0] },
  { position: [46.9, 0, -14.9], scale: 2.3, rotation: [0, Math.PI * 1.33, 0] },
  { position: [30, 0, -18.9], scale: 2.3, rotation: [0, Math.PI * 1.5, 0] },
];

const GLOW_LIFT = 0.05;

const GLOW_POSITIONS: Vec3[] = STREET_LIGHTS.map(({ position }) => [
  position[0],
  GLOW_LIFT,
  position[2],
]);

export default function StreetLights(props: JSX.IntrinsicElements["group"]) {
  return (
    <group {...props}>
      <GroundGlowDecals positions={GLOW_POSITIONS} radius={3.2} intensity={1} />
      {STREET_LIGHTS.map((config) => (
        <StreetLight
          key={`${config.position.join(",")}`}
          position={config.position}
          rotation={config.rotation}
          scale={config.scale}
        />
      ))}
    </group>
  );
}
