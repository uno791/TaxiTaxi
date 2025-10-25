import { useBox } from "@react-three/cannon";

const DEBUG_VISUALIZATION = true;

type Vector3Tuple = [number, number, number];

export interface ColliderBoxProps {
  mapPosition: { x: number; y: number; z: number };
  width: number;
  height: number;
  length: number;
  debug?: boolean;
}

export function ColliderBox({
  mapPosition,
  width,
  height,
  length,
  debug,
}: ColliderBoxProps) {
  const position: Vector3Tuple = [mapPosition.x, mapPosition.y, mapPosition.z];
  const size: Vector3Tuple = [width, height, length];
  const showDebug = debug ?? DEBUG_VISUALIZATION;

  useBox(() => ({
    args: size,
    position,
    type: "Static",
  }));

  return (
    showDebug && (
      <mesh position={position}>
        <boxGeometry args={size} />
        <meshBasicMaterial color="orange" transparent opacity={0.5} />
      </mesh>
    )
  );
}
