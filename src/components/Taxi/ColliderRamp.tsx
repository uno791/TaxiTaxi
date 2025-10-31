import { useEffect, useMemo } from "react";
import { useTrimesh } from "@react-three/cannon";
import {
  createRampBufferGeometry,
  createRampGeometryData,
} from "./rampGeometry";
import type { RampAxis, RampDirection } from "./rampGeometry";

const DEBUG_VISUALIZATION = false;

type Vector3Tuple = [number, number, number];

export interface ColliderRampProps {
  mapPosition: { x: number; y: number; z: number };
  width: number;
  length: number;
  startHeight: number;
  endHeight: number;
  axis?: RampAxis;
  direction?: RampDirection;
  debug?: boolean;
  renderOffset?: { x: number; y: number; z: number };
}

export function ColliderRamp({
  mapPosition,
  width,
  length,
  startHeight,
  endHeight,
  axis,
  direction,
  debug,
  renderOffset,
}: ColliderRampProps) {
  const { x, y, z } = mapPosition;
  const geometryData = useMemo(
    () =>
      createRampGeometryData({
        width,
        length,
        startHeight,
        endHeight,
        axis,
        direction,
      }),
    [width, length, startHeight, endHeight, axis, direction]
  );

  const position = useMemo<Vector3Tuple>(
    () => [
      x,
      y + geometryData.centerHeight,
      z,
    ],
    [x, y, z, geometryData.centerHeight]
  );
  const showDebug = debug ?? DEBUG_VISUALIZATION;
  const offset = renderOffset ?? { x: 0, y: 0, z: 0 };
  const renderPosition: Vector3Tuple = [
    position[0] - offset.x,
    position[1] - offset.y,
    position[2] - offset.z,
  ];

  useTrimesh(
    () => ({
      args: [geometryData.vertices, geometryData.indices],
      position,
      type: "Static",
    }),
    undefined,
    [geometryData, position]
  );

  const debugGeometry = useMemo(() => {
    if (!showDebug) return null;
    return createRampBufferGeometry(geometryData);
  }, [geometryData, showDebug]);

  useEffect(
    () => () => {
      debugGeometry?.dispose();
    },
    [debugGeometry]
  );

  if (!showDebug || !debugGeometry) {
    return null;
  }

  return (
    <mesh position={renderPosition} geometry={debugGeometry}>
      <meshBasicMaterial color="orange" transparent opacity={0.5} />
    </mesh>
  );
}
