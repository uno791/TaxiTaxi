import { useMemo, useRef, useState } from "react";
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

  useFrame(() => {
    const player = playerRef?.current;
    if (player) {
      const distance = player.position.distanceTo(ghostPosition);
      const t =
        1 - clamp01((distance - minRadius) / Math.max(maxRadius - minRadius, 0.0001));
      const eased = smoothstep(0.0, 1.0, t);
      if (Math.abs(eased - last.current) > 0.01) {
        last.current = eased;
        setIntensity(eased);
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
