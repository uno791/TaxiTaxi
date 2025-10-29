import { memo, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BackSide, Color, FogExp2 as ThreeFogExp2, Mesh, MeshBasicMaterial } from "three";
import { useGame } from "../GameContext";
import { useMissionUI } from "./Missions/MissionUIContext";

type FogEffectProps = {
  color?: string;
  density?: number;
};

function FogEffectComponent({
  color = "#4c565fff",
  density = 0.035,
}: FogEffectProps) {
  const { scene, camera } = useThree();
  const { speed } = useGame();
  const { timer, missionFailureActive } = useMissionUI();
  const fogShellRef = useRef<Mesh>(null);
  const shellMaterialRef = useRef<MeshBasicMaterial | null>(null);
  const fogRef = useRef<ThreeFogExp2 | null>(null);
  const currentColorRef = useRef(new Color(color));
  const tempColor = useMemo(() => new Color(color), [color]);
  const densityRef = useRef(density);

  const baseColor = useMemo(() => new Color("#1e273a"), []);
  const speedTint = useMemo(() => new Color("#30406b"), []);
  const panicTint = useMemo(() => new Color("#551c1c"), []);
  const lerp = (from: number, to: number, alpha: number) =>
    from + (to - from) * alpha;

  useEffect(() => {
    const previousFog = scene.fog;
    const fogInstance = new ThreeFogExp2(color, density);
    fogRef.current = fogInstance;
    currentColorRef.current.set(color);
    densityRef.current = density;
    scene.fog = fogInstance;
    const previousBackground = scene.background;
    scene.background = new Color("#000000");

    return () => {
      fogRef.current = null;
      scene.fog = previousFog ?? null;
      scene.background = previousBackground ?? null;
    };
  }, [scene, color, density]);

  useFrame(() => {
    if (fogShellRef.current) {
      fogShellRef.current.position.copy(camera.position);
    }
  });

  useFrame((_, delta) => {
    const PANIC_THRESHOLD = 10;
    const timeUrgency =
      timer && timer.secondsLeft > 0 && timer.secondsLeft <= PANIC_THRESHOLD
        ? 1 - Math.max(timer.secondsLeft, 0) / PANIC_THRESHOLD
        : 0;
    const urgency = missionFailureActive ? 1 : timeUrgency;
    const normalizedSpeed = Math.min(speed / 140, 1);

    const targetDensity =
      0.018 +
      (1 - normalizedSpeed) * 0.02 +
      urgency * 0.03;

    densityRef.current = lerp(
      densityRef.current,
      targetDensity,
      1 - Math.exp(-4 * delta)
    );

    tempColor.copy(baseColor);
    tempColor.lerp(speedTint, normalizedSpeed * 0.6);
    tempColor.lerp(panicTint, urgency);

    currentColorRef.current.lerp(tempColor, 1 - Math.exp(-3 * delta));

    const fog = fogRef.current;
    if (fog) {
      fog.color.copy(currentColorRef.current);
      fog.density = densityRef.current;
    }

    const material = shellMaterialRef.current;
    if (material) {
      material.color.copy(currentColorRef.current);
      const opacity = Math.min(
        0.92,
        Math.max(0.08, densityRef.current * 6.5)
      );
      material.opacity = opacity;
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
        ref={shellMaterialRef}
        color={color}
        transparent
        opacity={Math.min(0.9, Math.max(0.05, density * 5))}
        depthWrite={false}
        depthTest={false}
        side={BackSide}
      />
    </mesh>
  );
}

export const FogEffect = memo(FogEffectComponent);

export default FogEffect;
