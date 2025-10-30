import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { MutableRefObject } from "react";
import type { Object3D } from "three";
import * as THREE from "three";
import { HorrorDistortionPass } from "./HorrorDistortionPass";

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

type Props = {
  playerRef?: MutableRefObject<Object3D | null>;
  ghostPosition: THREE.Vector3;
  maxRadius?: number;
  minRadius?: number;
};

const INTENSITY_EXPONENT = 0.6;
const MIN_SPAN = 5;

export function HorrorController({
  playerRef,
  ghostPosition,
  maxRadius = 25,
  minRadius = 0,
}: Props) {
  const { camera } = useThree();
  const [intensity, setIntensity] = useState(0);
  const ghostNDC = useMemo(() => new THREE.Vector2(0.5, 0.5), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const last = useRef(0);

  useEffect(() => {
    last.current = 0;
    setIntensity(0);
  }, [ghostPosition]);

  useFrame(() => {
    const player = playerRef?.current;
    if (player) {
      const effectiveMin = Math.max(0, Math.min(minRadius, maxRadius));
      const effectiveMax = Math.max(maxRadius, effectiveMin + 5);
      const span = Math.max(effectiveMax - effectiveMin, MIN_SPAN);
      const distance = player.position.distanceTo(ghostPosition);
      const t = 1 - clamp01((distance - effectiveMin) / span);
      const shaped = Math.min(
        1,
        Math.pow(smoothstep(0.0, 1.0, t), INTENSITY_EXPONENT)
      );
      if (Math.abs(shaped - last.current) > 0.005) {
        last.current = shaped;
        setIntensity(shaped);
      }
    } else if (last.current !== 0) {
      last.current = 0;
      setIntensity(0);
    }

    tmp.copy(ghostPosition).project(camera);
    ghostNDC.set(0.5 * (tmp.x + 1), 0.5 * (1 - tmp.y));
  });

  return <HorrorDistortionPass intensity={intensity} ghostNDC={ghostNDC} />;
}
