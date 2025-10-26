import { useBox } from "@react-three/cannon";

const DEBUG_VISUALIZATION = false;

type Vector3Tuple = [number, number, number];

export interface ColliderBoxProps {
  mapPosition: { x: number; y: number; z: number };
  width: number;
  height: number;
  length: number;
  debug?: boolean;
  renderOffset?: { x: number; y: number; z: number };
}

export function ColliderBox({
  mapPosition,
  width,
  height,
  length,
  debug,
  renderOffset,
}: ColliderBoxProps) {
  const position: Vector3Tuple = [mapPosition.x, mapPosition.y, mapPosition.z];
  const size: Vector3Tuple = [width, height, length];
  const showDebug = debug ?? DEBUG_VISUALIZATION;
  const offset = renderOffset ?? { x: 0, y: 0, z: 0 };
  const renderPosition: Vector3Tuple = [
    mapPosition.x - offset.x,
    mapPosition.y - offset.y,
    mapPosition.z - offset.z,
  ];

  useBox(() => ({
    args: size,
    position,
    type: "Static",
  }));

  return (
    showDebug && (
      <mesh position={renderPosition}>
        <boxGeometry args={size} />
        <meshBasicMaterial color="orange" transparent opacity={0.5} />
      </mesh>
    )
  );
}
