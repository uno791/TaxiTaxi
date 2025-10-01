import * as THREE from "three";

const debug = false;

interface WheelDebugProps {
  radius: number;
  wheelRef: React.RefObject<THREE.Group>;
}

export const WheelDebug: React.FC<WheelDebugProps> = ({ radius, wheelRef }) => {
  return (
    debug && (
      <group ref={wheelRef}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[radius, radius, 0.07, 16]} />
          <meshNormalMaterial transparent={true} opacity={0.25} />
        </mesh>
      </group>
    )
  );
};
