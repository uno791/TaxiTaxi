import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Taxi } from "./Taxi";

interface TaxiControllerProps {
  positionRef?: MutableRefObject<THREE.Vector3>;
}

export function TaxiController({ positionRef }: TaxiControllerProps) {
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

    if (positionRef) {
      positionRef.current.copy(taxi.position);
    }

    // --- Camera follow (centered & closer) ---
    // Behind-offset: no lateral (x) offset, closer Z, slightly above Y.
    const behindOffset = new THREE.Vector3(0, 1.6, -3).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      angle
    );

    // Desired camera position = taxi position + behind-offset
    const desiredPos = new THREE.Vector3()
      .copy(taxi.position)
      .add(behindOffset);

    // Smooth follow (time-independent-ish damping)
    const followLerp = 1 - Math.exp(-8 * delta); // snappier follow
    camera.position.lerp(desiredPos, followLerp);

    // Look slightly ahead in the taxi's forward direction to keep the angle centered
    const forward = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
    const lookAhead = 1.8; // how far ahead to look
    const target = new THREE.Vector3()
      .copy(taxi.position)
      .addScaledVector(forward, lookAhead)
      .add(new THREE.Vector3(0, 0.5, 0)); // small upward bias

    camera.lookAt(target);
  });

  useEffect(() => {
    const taxi = taxiRef.current;
    if (taxi && positionRef) {
      positionRef.current.copy(taxi.position);
    }
  }, [positionRef]);

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
