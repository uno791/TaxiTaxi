import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Taxi } from "./Taxi";

export function TaxiController() {
  const taxiRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  // Taxi state
  let speed = 10;
  let angle = 0;

  useFrame((_, delta) => {
    const taxi = taxiRef.current;
    if (!taxi) return;

    // --- Controls ---
    const keys = (window as any).keys || {};
    const accel = 3;
    const decel = 10;
    const turnSpeed = 1.8;

    if (keys["w"] || keys["ArrowUp"])
      speed = Math.min(10, speed + accel * delta);
    else speed = Math.max(0, speed - decel * delta);

    if (keys["a"] || keys["ArrowLeft"]) angle += turnSpeed * delta;
    if (keys["d"] || keys["ArrowRight"]) angle -= turnSpeed * delta;

    // --- Movement ---
    taxi.rotation.y = angle;
    taxi.position.x += Math.sin(angle) * speed * delta;
    taxi.position.z += Math.cos(angle) * speed * delta;

    // --- Camera follow ---
    const offset = new THREE.Vector3(0, 7, -10)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), angle)
      .add(taxi.position);
    camera.position.lerp(offset, 0.1);
    camera.lookAt(taxi.position.x, taxi.position.y + 0.6, taxi.position.z + 2);
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
