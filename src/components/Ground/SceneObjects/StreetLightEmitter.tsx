import type { JSX } from "react/jsx-runtime";

export type StreetLightEmitterProps = JSX.IntrinsicElements["group"] & {
  color?: string;
  intensity?: number;
  distance?: number;
  decay?: number;
  radius?: number;
  emissiveIntensity?: number;
  castShadow?: boolean;
};

export function StreetLightEmitter({
  color = "#f5d7a5",
  intensity = 2.8,
  distance = 18,
  decay = 1.8,
  radius = 0.02,
  emissiveIntensity = 2.2,
  castShadow = false,
  ...groupProps
}: StreetLightEmitterProps) {
  return (
    <group {...groupProps}>
      <pointLight
        castShadow={castShadow}
        color={color}
        intensity={intensity}
        distance={distance}
        decay={decay}
      />
      <mesh castShadow={false} receiveShadow={false}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshStandardMaterial
          color="#000000"
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          toneMapped={false}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}
