import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { MutableRefObject } from "react";
import type { Object3D } from "three";
import * as THREE from "three";
import { HorrorDistortionPass } from "./HorrorDistortionPass";

type Props = {
  playerRef?: MutableRefObject<Object3D | null>;
  ghostPosition: THREE.Vector3;
  intensity?: number;
};

export function HorrorController({ ghostPosition, intensity = 0.35 }: Props) {
  const { camera } = useThree();
  const ghostNDC = useMemo(() => new THREE.Vector2(0.5, 0.5), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    tmp.copy(ghostPosition).project(camera);

    const ndcDepth = tmp.z;
    const ndcX = 0.5 * (tmp.x + 1);
    const ndcY = 0.5 * (1 - tmp.y);

    if (ndcDepth < -1 || ndcDepth > 1) {
      ghostNDC.set(0.5, 0.5);
      return;
    }

    ghostNDC.set(
      THREE.MathUtils.clamp(ndcX, 0.2, 0.8),
      THREE.MathUtils.clamp(ndcY, 0.2, 0.8)
    );
  });

  return (
    <HorrorDistortionPass
      intensity={Math.max(0, Math.min(1, intensity))}
      ghostNDC={ghostNDC}
    />
  );
}
