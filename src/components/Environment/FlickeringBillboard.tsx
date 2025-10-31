import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, useTexture } from "@react-three/drei";
import * as THREE from "three";

type BillboardProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
};

export default function FlickeringBillboard({
  position = [0, 2, 0],
  rotation = [0, 0, 0],
}: BillboardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const mainTextRef = useRef<THREE.Mesh>(null);
  const redRef = useRef<THREE.Mesh>(null);
  const cyanRef = useRef<THREE.Mesh>(null);
  const billboardTexture = useTexture("models/SexyMan.jpg");

  useMemo(() => {
    if (!billboardTexture) return;
    billboardTexture.wrapS = THREE.ClampToEdgeWrapping;
    billboardTexture.wrapT = THREE.ClampToEdgeWrapping;
    billboardTexture.anisotropy = 8;
  }, [billboardTexture]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    const flicker = 0.8 + Math.sin(t * 50.0) * 0.2 + Math.random() * 0.2;

    // Main text opacity flicker
    if (mainTextRef.current) {
      const mat = mainTextRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = flicker;
    }

    // RGB offset flicker bursts
    const burst = Math.random() > 0.96;
    const offset = burst
      ? (Math.random() - 0.5) * 0.8
      : Math.sin(t * 70.0) * 0.1;

    if (redRef.current) {
      const mat = redRef.current.material as THREE.MeshBasicMaterial;
      redRef.current.position.x = offset + 0.05;
      mat.opacity = 0.6 + Math.random() * 0.3;
    }

    if (cyanRef.current) {
      const mat = cyanRef.current.material as THREE.MeshBasicMaterial;
      cyanRef.current.position.x = -offset - 0.05;
      mat.opacity = 0.6 + Math.random() * 0.3;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Billboard Face */}
      <mesh ref={meshRef} position={[0, 3.2, 0]}>
        <planeGeometry args={[8, 4]} />
        <meshBasicMaterial
          map={billboardTexture}
          toneMapped={false}
          transparent={false}
        />
      </mesh>

      {/* Frame / Back */}
      <mesh position={[0, 3.2, -0.12]}>
        <boxGeometry args={[8, 4, 0.24]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Pole */}
      <mesh position={[0, 1.2, -0.6]}>
        <cylinderGeometry args={[0.1, 0.15, 2.4, 12]} />
        <meshStandardMaterial color="#333" metalness={0.4} roughness={0.7} />
      </mesh>

      {/* Main text */}
      <Text
        ref={mainTextRef}
        position={[0, 3.4, 0.12]}
        fontSize={0.55}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        material-transparent
        maxWidth={6.5}
        textAlign="center"
        lineHeight={1.1}
      >
        Hot singles in your area ....... 6 Dead
      </Text>

      {/* Red RGB Split */}
      <Text
        ref={redRef}
        position={[0.05, 3.4, 0.11]}
        fontSize={0.55}
        color="#ff0033"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        material-transparent
        maxWidth={6.5}
        textAlign="center"
        lineHeight={1.1}
      >
        Hot singles in your area ....... 6 Dead
      </Text>

      {/* Cyan RGB Split */}
      <Text
        ref={cyanRef}
        position={[-0.05, 3.4, 0.11]}
        fontSize={0.55}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        material-transparent
        maxWidth={6.5}
        textAlign="center"
        lineHeight={1.1}
      >
        Hot singles in your area ....... 6 Dead
      </Text>
    </group>
  );
}
