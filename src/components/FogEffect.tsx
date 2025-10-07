import { memo, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BackSide,
  Color,
  FogExp2 as ThreeFogExp2,
  Mesh,
} from "three";

type FogEffectProps = {
  color?: string;
  density?: number;
};

function FogEffectComponent({
  color = "#7a8a99",
  density = 0.035,
}: FogEffectProps) {
  const { scene, camera } = useThree();
  const fogShellRef = useRef<Mesh>(null);
  const shellOpacity = useMemo(() => {
    const scaled = Math.min(0.9, Math.max(0.05, density * 10));
    return Number.isFinite(scaled) ? scaled : 0.35;
  }, [density]);

  useEffect(() => {
    const previousFog = scene.fog;
    const fogInstance = new ThreeFogExp2(color, density);
    scene.fog = fogInstance;
    const previousBackground = scene.background;
    scene.background = new Color("#000000");

    return () => {
      scene.fog = previousFog ?? null;
      scene.background = previousBackground ?? null;
    };
  }, [scene, color, density]);

  useFrame(() => {
    if (fogShellRef.current) {
      fogShellRef.current.position.copy(camera.position);
    }
  });

  return (
    <mesh
      ref={fogShellRef}
      renderOrder={999}
      frustumCulled={false}
      scale={[500, 500, 500]}
    >
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={shellOpacity}
        depthWrite={false}
        depthTest={false}
        side={BackSide}
      />
    </mesh>
  );
}

export const FogEffect = memo(FogEffectComponent);

export default FogEffect;
