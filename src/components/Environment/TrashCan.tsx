import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type TrashCanProps = {
  position?: [number, number, number];
  scale?: number;
};

export default function TrashCan({
  position = [0, 0, 0],
  scale = 1,
}: TrashCanProps) {
  const lidGroup = useRef<THREE.Group>(null);

  // Animate lid + handle spinning upright
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (lidGroup.current) {
      lidGroup.current.rotation.z = t * 10; // spin around Z
      lidGroup.current.rotation.x = Math.PI / 2; // upright vertical
    }
  });

  const radius = 0.4;
  const height = 0.9;
  const ridgeCount = 10;
  const ridges = [];

  // Create raised ridges around can body
  for (let i = 0; i < ridgeCount; i++) {
    const angle = (i / ridgeCount) * Math.PI * 2;
    ridges.push(
      <mesh
        key={i}
        position={[
          Math.cos(angle) * radius * 0.98,
          height / 2,
          Math.sin(angle) * radius * 0.98,
        ]}
        rotation={[0, -angle, 0]}
      >
        <boxGeometry args={[0.03, height * 0.7, 0.02]} />
        <meshStandardMaterial color="#444" roughness={0.6} metalness={0.5} />
      </mesh>
    );
  }

  return (
    <group
      position={position}
      scale={[scale, scale, scale]}
      rotation={[0, Math.PI / 2, 0]}
    >
      {/* Can body */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius, radius * 0.9, height, 32, 1, true]} />
        <meshStandardMaterial
          color="#777"
          roughness={0.5}
          metalness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner dark lining (creates real hollow interior) */}
      <mesh position={[0, height / 2, 0]} scale={[0.85, 1, 0.85]}>
        <cylinderGeometry args={[radius, radius * 0.9, height, 32, 1, true]} />
        <meshStandardMaterial
          color="#111"
          roughness={1.0}
          metalness={0.0}
          side={THREE.BackSide} // visible only from inside
        />
      </mesh>

      {/* Top rim */}
      <mesh position={[0, height, 0]}>
        <cylinderGeometry args={[radius * 1.05, radius, 0.05, 32]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Bottom base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[radius, radius * 0.9, 0.05, 32]} />
        <meshStandardMaterial color="#666" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Ridges */}
      {ridges}

      {/* Lid group (lid + handle) */}
      <group
        ref={lidGroup}
        position={[0.9, 0.25, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        {/* Lid plate */}
        <mesh>
          <cylinderGeometry args={[radius * 1.05, radius * 1.05, 0.05, 32]} />
          <meshStandardMaterial color="#777" roughness={0.4} metalness={0.5} />
        </mesh>

        {/* Handle (small curved bar) */}
        <mesh position={[0, 0.05, 0]}>
          <torusGeometry args={[0.12, 0.025, 8, 32, Math.PI]} />
          <meshStandardMaterial color="#666" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
}
