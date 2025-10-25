import { useMemo } from "react";
import { useTrimesh } from "@react-three/cannon";
import { CylinderGeometry } from "three";

const DEBUG_VISUALIZATION = false;

type Vector3Tuple = [number, number, number];

export interface ColliderCylinderProps {
  mapPosition: { x: number; y: number; z: number };
  radiusX: number;
  radiusZ: number;
  height: number;
  segments?: number;
  debug?: boolean;
}

export function ColliderCylinder({
  mapPosition,
  radiusX,
  radiusZ,
  height,
  segments = 16,
  debug,
}: ColliderCylinderProps) {
  const position: Vector3Tuple = [mapPosition.x, mapPosition.y, mapPosition.z];
  const showDebug = debug ?? DEBUG_VISUALIZATION;

  const { vertices, indices } = useMemo(() => {
    const geometry = new CylinderGeometry(1, 1, 1, segments, 1);
    geometry.scale(radiusX, height, radiusZ);

    const positionAttr = geometry.getAttribute("position");
    const indexAttr = geometry.getIndex();

    const verts = new Float32Array(
      Array.from(positionAttr.array as ArrayLike<number>)
    );
    const inds = indexAttr
      ? new Uint32Array(Array.from(indexAttr.array as ArrayLike<number>))
      : undefined;

    geometry.dispose();

    return { vertices: verts, indices: inds };
  }, [radiusX, radiusZ, height, segments]);

  const colliderArgs = useMemo(() => {
    if (indices) {
      return { vertices, indices };
    }

    const fallback = new Uint32Array(vertices.length / 3);
    for (let i = 0; i < fallback.length; i += 1) {
      fallback[i] = i;
    }

    return { vertices, indices: fallback };
  }, [vertices, indices]);

  useTrimesh(() => ({
    args: [colliderArgs.vertices, colliderArgs.indices],
    position,
    type: "Static",
  }));

  return (
    showDebug && (
      <mesh position={position} scale={[radiusX, height, radiusZ]}>
        <cylinderGeometry args={[1, 1, 1, segments]} />
        <meshBasicMaterial color="orange" transparent opacity={0.5} />
      </mesh>
    )
  );
}
