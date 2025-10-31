import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls } from "three-stdlib";

export type FreeFlightControlsProps = {
  /** Toggle the flight controller on/off without unmounting the component. */
  enabled?: boolean;
  /** Base cruising speed in world units per second. */
  speed?: number;
  /** Multiplies speed while the Shift key is held. */
  boostMultiplier?: number;
  /** Multiplies speed while Alt is held for precision adjustments. */
  slowMultiplier?: number;
  /** Higher values snap to target velocity faster, lower values feel floatier. */
  responsiveness?: number;
  /** Mouse look sensitivity while flight mode is active. */
  lookSensitivity?: number;
};

const WORLD_UP = new THREE.Vector3(0, 1, 0);
const DEFAULT_FORWARD = new THREE.Vector3(0, 0, -1);
const MIN_PITCH = THREE.MathUtils.degToRad(-89);
const MAX_PITCH = THREE.MathUtils.degToRad(89);

const HANDLED_KEYS = new Set([
  "w",
  "a",
  "s",
  "d",
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "space",
  "shift",
  "alt",
  "control",
  "q",
  "e",
]);

function normalizeKey(key: string): string {
  switch (key) {
    case " ":
      return "space";
    case "Shift":
    case "ShiftLeft":
    case "ShiftRight":
      return "shift";
    case "Control":
    case "ControlLeft":
    case "ControlRight":
      return "control";
    case "Alt":
    case "AltLeft":
    case "AltRight":
      return "alt";
    default:
      return key.toLowerCase();
  }
}

export function FreeFlightControls({
  enabled = true,
  speed = 14,
  boostMultiplier = 1.75,
  slowMultiplier = 0.2,
  responsiveness = 12,
  lookSensitivity = 0.0025,
}: FreeFlightControlsProps) {
  const { camera, controls, gl } = useThree((state) => ({
    camera: state.camera,
    controls: state.controls as OrbitControls | null,
    gl: state.gl,
  }));

  const keysRef = useRef<Record<string, boolean>>({});
  const velocityRef = useRef(new THREE.Vector3());
  const targetVelocityRef = useRef(new THREE.Vector3());
  const forwardRef = useRef(new THREE.Vector3());
  const rightRef = useRef(new THREE.Vector3());
  const moveRef = useRef(new THREE.Vector3());
  const frameMoveRef = useRef(new THREE.Vector3());
  const pointerLockedRef = useRef(false);
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const eulerRef = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const lookDirRef = useRef(new THREE.Vector3());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.metaKey) return;
      const normalizedKey = normalizeKey(event.key);

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      ) {
        return;
      }

      if (HANDLED_KEYS.has(normalizedKey)) {
        event.preventDefault();
      }

      keysRef.current[normalizedKey] = true;
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const normalizedKey = normalizeKey(event.key);
      keysRef.current[normalizedKey] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (enabled) return;
    velocityRef.current.set(0, 0, 0);
    targetVelocityRef.current.set(0, 0, 0);
  }, [enabled]);

  useEffect(() => {
    const canvas = gl?.domElement;
    if (!canvas) return;

    const updateAnglesFromCamera = () => {
      const euler = eulerRef.current;
      euler.setFromQuaternion(camera.quaternion, "YXZ");
      yawRef.current = euler.y;
      pitchRef.current = THREE.MathUtils.clamp(euler.x, MIN_PITCH, MAX_PITCH);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!enabled) return;
      if (event.button !== 0) return;
      if (document.pointerLockElement === canvas) return;
      canvas.requestPointerLock?.();
    };

    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === canvas;
      pointerLockedRef.current = locked;
      if (locked) {
        updateAnglesFromCamera();
      }
    };

    const handlePointerLockError = () => {
      pointerLockedRef.current = false;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!enabled) return;
      if (!pointerLockedRef.current) return;

      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;

      const nextYaw = yawRef.current - movementX * lookSensitivity;
      const nextPitch = THREE.MathUtils.clamp(
        pitchRef.current - movementY * lookSensitivity,
        MIN_PITCH,
        MAX_PITCH
      );

      yawRef.current = nextYaw;
      pitchRef.current = nextPitch;

      const euler = eulerRef.current;
      euler.set(nextPitch, nextYaw, 0, "YXZ");
      camera.quaternion.setFromEuler(euler);

      if (controls) {
        const lookDir = lookDirRef.current;
        lookDir.copy(DEFAULT_FORWARD).applyQuaternion(camera.quaternion);
        controls.target.copy(camera.position).add(lookDir);
        controls.update?.();
      }
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    document.addEventListener("pointerlockerror", handlePointerLockError);
    window.addEventListener("pointermove", handlePointerMove);

    updateAnglesFromCamera();

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
      document.removeEventListener("pointerlockerror", handlePointerLockError);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [camera, controls, enabled, gl, lookSensitivity]);

  useEffect(() => {
    if (enabled) return;
    const canvas = gl?.domElement;
    if (pointerLockedRef.current && canvas && document.pointerLockElement === canvas) {
      document.exitPointerLock?.();
    }
    pointerLockedRef.current = false;
  }, [enabled, gl]);

  useFrame((_, delta) => {
    const velocity = velocityRef.current;
    const targetVelocity = targetVelocityRef.current;
    const move = moveRef.current;
    const frameMove = frameMoveRef.current;

    if (!enabled) {
      if (velocity.lengthSq() > 1e-6) {
        velocity.multiplyScalar(Math.max(0, 1 - delta * responsiveness));
      }
      return;
    }

    const keyState = keysRef.current;
    move.set(0, 0, 0);

    if (keyState["w"] || keyState["arrowup"]) move.z -= 1;
    if (keyState["s"] || keyState["arrowdown"]) move.z += 1;
    if (keyState["a"] || keyState["arrowleft"]) move.x -= 1;
    if (keyState["d"] || keyState["arrowright"]) move.x += 1;

    // Vertical movement using Q/E or Space/Ctrl for preference.
    if (keyState["e"] || keyState["space"]) move.y += 1;
    if (keyState["q"] || keyState["control"]) move.y -= 1;

    if (move.lengthSq() > 1e-6) {
      move.normalize();
    }

    const forward = forwardRef.current;
    forward.copy(camera.getWorldDirection(forward));

    const right = rightRef.current;
    right.copy(forward).cross(WORLD_UP);

    if (right.lengthSq() < 1e-6) {
      right.set(1, 0, 0);
    } else {
      right.normalize();
    }

    targetVelocity
      .set(0, 0, 0)
      .addScaledVector(forward, move.z)
      .addScaledVector(right, move.x)
      .addScaledVector(WORLD_UP, move.y);

    if (targetVelocity.lengthSq() > 1e-6) {
      targetVelocity.normalize();

      let currentSpeed = speed;
      if (keyState["shift"]) currentSpeed *= boostMultiplier;
      if (keyState["alt"]) currentSpeed *= slowMultiplier;

      targetVelocity.multiplyScalar(currentSpeed);
    } else {
      targetVelocity.set(0, 0, 0);
    }

    const smoothing = 1 - Math.exp(-responsiveness * delta);
    velocity.lerp(targetVelocity, smoothing);

    if (velocity.lengthSq() < 1e-8) {
      velocity.set(0, 0, 0);
      return;
    }

    frameMove.copy(velocity).multiplyScalar(delta);
    camera.position.add(frameMove);

    if (controls) {
      controls.target.add(frameMove);
      controls.update?.();
    }
  });

  return null;
}

export default FreeFlightControls;
