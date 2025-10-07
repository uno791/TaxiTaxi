import type { JSX } from "react/jsx-runtime";

export type StreetLightEmitterProps = JSX.IntrinsicElements["group"] & {
  color?: string;
  intensity?: number;
  distance?: number;
  decay?: number;
  radius?: number;
  castShadow?: boolean;
  glowOpacity?: number;
  lightEnabled?: boolean;
};

export function StreetLightEmitter({
  color = "#f5d7a5",
  intensity = 3.2,
  distance = 24,
  decay = 1.5,
  radius = 0.12,
  castShadow = false,
  glowOpacity,
  lightEnabled = true,
  ...groupProps
}: StreetLightEmitterProps) {
  const resolvedGlowOpacity =
    glowOpacity ?? Math.min(0.95, 0.6 + Math.max(0, intensity) * 0.08);

  return (
    <group {...groupProps}>
      {lightEnabled ? (
        <pointLight
          castShadow={castShadow}
          color={color}
          intensity={intensity}
          distance={distance}
          decay={decay}
        />
      ) : null}
      <mesh castShadow={false} receiveShadow={false}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshBasicMaterial
          color={color}
          toneMapped={false}
          transparent
          opacity={resolvedGlowOpacity}
        />
      </mesh>
    </group>
  );
}
