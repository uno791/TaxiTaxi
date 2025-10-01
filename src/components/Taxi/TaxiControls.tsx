import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Taxi } from "./Taxi";
import { useGame } from "../../GameContext";

export function TaxiController() {
  const taxiRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const { setMoney, setKilometers, gameOver, setGameOver } = useGame();

  // Taxi state (persist across renders using refs)
  const speedRef = useRef(0); // Start at 0 so the car doesn’t auto-drive
  const angleRef = useRef(0);

  useFrame((_, delta) => {
    if (gameOver) return; // Stop movement if out of fuel

    const taxi = taxiRef.current;
    if (!taxi) return;

    // --- Controls ---
    const keys = (window as any).keys || {};
    const accel = 3;
    const decel = 10;
    const turnSpeed = 1.8;

    if (keys["w"] || keys["ArrowUp"]) {
      speedRef.current = Math.min(10, speedRef.current + accel * delta);
    } else {
      speedRef.current = Math.max(0, speedRef.current - decel * delta);
    }

    if (keys["a"] || keys["ArrowLeft"]) angleRef.current += turnSpeed * delta;
    if (keys["d"] || keys["ArrowRight"]) angleRef.current -= turnSpeed * delta;

    // --- Movement ---
    taxi.rotation.y = angleRef.current;
    taxi.position.x += Math.sin(angleRef.current) * speedRef.current * delta;
    taxi.position.z += Math.cos(angleRef.current) * speedRef.current * delta;

    // --- Track kilometers ---
    const distanceTraveled = speedRef.current * delta * 0.1; // scale factor for km
    setKilometers((k) => k + distanceTraveled);

    // --- Fuel (money decreases with distance) ---
    setMoney((m) => {
      const newMoney = m - distanceTraveled * 20; // cost per km
      if (newMoney <= 0) {
        setGameOver(true);
        return 0;
      }
      return newMoney;
    });

    // --- Camera follow (third-person chase view) ---
    const behindOffset = new THREE.Vector3(0, 1.6, -3).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      angleRef.current
    );

    const desiredPos = new THREE.Vector3()
      .copy(taxi.position)
      .add(behindOffset);
    const followLerp = 1 - Math.exp(-8 * delta); // smooth follow
    camera.position.lerp(desiredPos, followLerp);

    const forward = new THREE.Vector3(
      Math.sin(angleRef.current),
      0,
      Math.cos(angleRef.current)
    );
    const target = new THREE.Vector3()
      .copy(taxi.position)
      .addScaledVector(forward, 1.8)
      .add(new THREE.Vector3(0, 0.5, 0)); // slight upward bias
    camera.lookAt(target);
  });

  return <Taxi scale={0.27} ref={taxiRef} />;
}

// Simple global key handler
if (!(window as any).keys) {
  (window as any).keys = {};
  window.addEventListener(
    "keydown",
    (e) => ((window as any).keys[e.key] = true)
  );
  window.addEventListener(
    "keyup",
    (e) => ((window as any).keys[e.key] = false)
  );
}
