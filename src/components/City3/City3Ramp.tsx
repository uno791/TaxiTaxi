import { useEffect, useMemo } from "react";
import type { JSX } from "react/jsx-runtime";
import {
  createRampBufferGeometry,
  createRampGeometryData,
} from "../Taxi/rampGeometry";
import type { RampAxis, RampDirection } from "../Taxi/rampGeometry";

export type City3RampConfig = {
  mapPosition: { x: number; y: number; z: number };
  width: number;
  length: number;
  startHeight: number;
  endHeight: number;
  axis?: RampAxis;
  direction?: RampDirection;
};

export type City3RampProps = City3RampConfig & {
  color?: string;
};

export const CITY3_RAMP_CONFIGS: City3RampConfig[] = [
  {
    mapPosition: { x: 19.78, y: 0, z: -455.197 },
    width: 1.935,
    length: 2.354,
    startHeight: 0,
    endHeight: 1.1,
    axis: "z",
    direction: "negative",
  },
  {
    mapPosition: { x: 19.666, y: 0, z: -489.488 },
    width: 1.935,
    length: 2.354,
    startHeight: 0,
    endHeight: 1.1,
    axis: "z",
    direction: "positive",
  },
];
export function City3Ramp({
  mapPosition,
  width,
  length,
  startHeight,
  endHeight,
  axis,
  direction,
  color = "#666666",
}: City3RampProps): JSX.Element {
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

  const geometry = useMemo(
    () => createRampBufferGeometry(geometryData),
    [geometryData]
  );

  useEffect(
    () => () => {
      geometry.dispose();
    },
    [geometry]
  );

  return (
    <mesh
      position={[x, y + geometryData.centerHeight, z]}
      geometry={geometry}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={color} metalness={0.1} roughness={0.75} />
    </mesh>
  );
}
