import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DestinationMarkerProps {
  destinationRef: MutableRefObject<THREE.Vector3>;
}

export function DestinationMarker({ destinationRef }: DestinationMarkerProps) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.userData.keepOriginalForMinimap = true;
      groupRef.current.visible = false;
    }
  }, []);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    const destination = destinationRef.current;
    const hasDestination = Number.isFinite(destination.x) && Number.isFinite(destination.z);
    group.visible = hasDestination;
    if (!hasDestination) {
      return;
    }
    group.position.set(destination.x, 0, destination.z);
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.6, 1.3, 24]} />
        <meshStandardMaterial color={0xff4d4d} emissive={0xff4d4d} emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[0.5, 24]} />
        <meshBasicMaterial color={0xffa24d} toneMapped={false} />
      </mesh>
    </group>
  );
}
