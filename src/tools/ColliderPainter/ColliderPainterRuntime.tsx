import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useColliderPainter } from "./ColliderPainterContext";
import type { ColliderPreview } from "./types";

const DEFAULT_COLLIDER_HEIGHT = 10;
const MIN_SIZE = 0.5;
const DEFAULT_SEGMENTS = 32;

type Props = {
  playerPositionRef: MutableRefObject<THREE.Vector3>;
};

type DragState = {
  start: THREE.Vector3;
  current: THREE.Vector3;
};

export function ColliderPainterRuntime({ playerPositionRef }: Props) {
  const {
    enabled,
    shape,
    setShape,
    adjustCameraHeight,
    cameraHeight,
    addCollider,
    activeCity,
  } = useColliderPainter();
  const { camera, gl } = useThree();

  const savedCamera = useRef<
    | {
        position: THREE.Vector3;
        quaternion: THREE.Quaternion;
        up: THREE.Vector3;
      }
    | null
  >(null);

  const cameraPositionRef = useRef(new THREE.Vector3());
  const lookTargetRef = useRef(new THREE.Vector3());
  const dragStateRef = useRef<DragState | null>(null);
  const [preview, setPreview] = useState<ColliderPreview | null>(null);

  const pointer = useMemo(() => new THREE.Vector2(), []);
  const plane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    []
  );
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const intersection = useMemo(() => new THREE.Vector3(), []);

  const projectPointer = useCallback(
    (event: PointerEvent) => {
      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.ray.intersectPlane(plane, intersection);
      if (!hit) return null;
      return hit.clone();
    },
    [camera, gl, intersection, plane, pointer, raycaster]
  );

  const updatePreview = useCallback(
    (start: THREE.Vector3, end: THREE.Vector3) => {
      if (
        !Number.isFinite(start.x) ||
        !Number.isFinite(start.z) ||
        !Number.isFinite(end.x) ||
        !Number.isFinite(end.z)
      ) {
        return;
      }

      const centerX = (start.x + end.x) / 2;
      const centerZ = (start.z + end.z) / 2;
      const width = Math.abs(end.x - start.x);
      const length = Math.abs(end.z - start.z);

      if (shape === "box") {
        setPreview({
          shape: "box",
          mapPosition: { x: centerX, y: 0, z: centerZ },
          width,
          length,
          height: DEFAULT_COLLIDER_HEIGHT,
        });
      } else {
        setPreview({
          shape: "cylinder",
          mapPosition: { x: centerX, y: 0, z: centerZ },
          radiusX: width / 2,
          radiusZ: length / 2,
          height: DEFAULT_COLLIDER_HEIGHT,
          segments: DEFAULT_SEGMENTS,
        });
      }
    },
    [shape]
  );

  const applyCollider = useCallback(
    (start: THREE.Vector3, end: THREE.Vector3) => {
      if (
        !Number.isFinite(start.x) ||
        !Number.isFinite(start.z) ||
        !Number.isFinite(end.x) ||
        !Number.isFinite(end.z)
      ) {
        return;
      }

      const centerX = (start.x + end.x) / 2;
      const centerZ = (start.z + end.z) / 2;
      const width = Math.abs(end.x - start.x);
      const length = Math.abs(end.z - start.z);

      if (!Number.isFinite(width) || !Number.isFinite(length)) {
        return;
      }

      if (shape === "box") {
        if (width < MIN_SIZE || length < MIN_SIZE) return;
        addCollider({
          cityId: activeCity,
          shape: "box",
          mapPosition: { x: centerX, y: 0, z: centerZ },
          width,
          length,
          height: DEFAULT_COLLIDER_HEIGHT,
        });
      } else {
        const radiusX = Math.abs(end.x - start.x) / 2;
        const radiusZ = Math.abs(end.z - start.z) / 2;
        if (!Number.isFinite(radiusX) || !Number.isFinite(radiusZ)) return;
        if (radiusX < MIN_SIZE / 2 && radiusZ < MIN_SIZE / 2) return;
        addCollider({
          cityId: activeCity,
          shape: "cylinder",
          mapPosition: { x: centerX, y: 0, z: centerZ },
          radiusX: Math.max(radiusX, MIN_SIZE / 2),
          radiusZ: Math.max(radiusZ, MIN_SIZE / 2),
          height: DEFAULT_COLLIDER_HEIGHT,
          segments: DEFAULT_SEGMENTS,
        });
      }
    },
    [activeCity, addCollider, shape]
  );

  useEffect(() => {
    if (!enabled) return undefined;

    savedCamera.current = {
      position: camera.position.clone(),
      quaternion: camera.quaternion.clone(),
      up: camera.up.clone(),
    };

    const playerPosition = playerPositionRef.current;

    cameraPositionRef.current.set(
      playerPosition.x,
      cameraHeight,
      playerPosition.z
    );

    camera.position.copy(cameraPositionRef.current);
    camera.up.set(0, 1, 0);
    lookTargetRef.current.set(playerPosition.x, 0, playerPosition.z);
    camera.lookAt(lookTargetRef.current);
    camera.updateProjectionMatrix();

    const previousCursor = gl.domElement.style.cursor;
    gl.domElement.style.cursor = "crosshair";

    return () => {
      gl.domElement.style.cursor = previousCursor;
      if (savedCamera.current) {
        camera.position.copy(savedCamera.current.position);
        camera.quaternion.copy(savedCamera.current.quaternion);
        camera.up.copy(savedCamera.current.up);
      }
      camera.updateProjectionMatrix();
      setPreview(null);
      dragStateRef.current = null;
    };
  }, [enabled, camera, gl, cameraHeight, playerPositionRef]);

  useEffect(() => {
    if (!enabled) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey) return;

      if (event.key === "1") {
        event.preventDefault();
        adjustCameraHeight(-5);
      } else if (event.key === "2") {
        event.preventDefault();
        adjustCameraHeight(5);
      } else if (event.key === "3") {
        event.preventDefault();
        setShape("box");
      } else if (event.key === "4") {
        event.preventDefault();
        setShape("cylinder");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, adjustCameraHeight, setShape]);

  useEffect(() => {
    if (!enabled) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!enabled || event.button !== 0) return;
      event.preventDefault();
      event.stopImmediatePropagation();

      const start = projectPointer(event);
      if (!start) return;

      dragStateRef.current = {
        start: start.clone(),
        current: start.clone(),
      };
      setPreview({
        shape,
        mapPosition: { x: start.x, y: 0, z: start.z },
        width: 0,
        length: 0,
        radiusX: 0,
        radiusZ: 0,
        height: DEFAULT_COLLIDER_HEIGHT,
        segments: DEFAULT_SEGMENTS,
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!enabled) return;
      const dragState = dragStateRef.current;
      if (!dragState) return;

      const point = projectPointer(event);
      if (!point) return;

      dragState.current.copy(point);
      updatePreview(dragState.start, dragState.current);
    };

    const finishDrag = (event?: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState) return;

      const finalPoint =
        event?.type && event instanceof PointerEvent
          ? projectPointer(event) ?? dragState.current.clone()
          : dragState.current.clone();

      applyCollider(dragState.start, finalPoint);
      dragStateRef.current = null;
      setPreview(null);
    };

    const canvas = gl.domElement;
    canvas.addEventListener("pointerdown", handlePointerDown, {
      capture: true,
    });
    canvas.addEventListener("pointermove", handlePointerMove, {
      capture: true,
    });
    window.addEventListener("pointerup", finishDrag, true);
    window.addEventListener("pointercancel", finishDrag, true);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown, {
        capture: true,
      } as any);
      canvas.removeEventListener("pointermove", handlePointerMove, {
        capture: true,
      } as any);
      window.removeEventListener("pointerup", finishDrag, true);
      window.removeEventListener("pointercancel", finishDrag, true);
    };
  }, [enabled, shape, gl, projectPointer, updatePreview, applyCollider]);

  const movementRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    fast: false,
  });

  useEffect(() => {
    if (!enabled) return undefined;

    movementRef.current = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      fast: false,
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.altKey) return;

      const key = event.key.toLowerCase();
      const originalKey = event.key;

      const prevent = () => {
        if (
          originalKey.startsWith("Arrow") ||
          [" ", "spacebar"].includes(originalKey)
        ) {
          event.preventDefault();
        }
      };

      switch (key) {
        case "arrowup":
        case "w":
          movementRef.current.forward = true;
          prevent();
          break;
        case "arrowdown":
        case "s":
          movementRef.current.backward = true;
          prevent();
          break;
        case "arrowleft":
        case "a":
          movementRef.current.left = true;
          prevent();
          break;
        case "arrowright":
        case "d":
          movementRef.current.right = true;
          prevent();
          break;
        case "shift":
          movementRef.current.fast = true;
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      switch (key) {
        case "arrowup":
        case "w":
          movementRef.current.forward = false;
          break;
        case "arrowdown":
        case "s":
          movementRef.current.backward = false;
          break;
        case "arrowleft":
        case "a":
          movementRef.current.left = false;
          break;
        case "arrowright":
        case "d":
          movementRef.current.right = false;
          break;
        case "shift":
          movementRef.current.fast = false;
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("keyup", handleKeyUp, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true } as any);
      window.removeEventListener("keyup", handleKeyUp, { capture: true } as any);
      movementRef.current = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        fast: false,
      };
    };
  }, [enabled]);

  useFrame((_, delta) => {
    if (!enabled) return;

    const { forward, backward, left, right, fast } = movementRef.current;
    const speed = fast ? 150 : 90;
    const distance = speed * delta;

    if (forward) cameraPositionRef.current.z -= distance;
    if (backward) cameraPositionRef.current.z += distance;
    if (left) cameraPositionRef.current.x -= distance;
    if (right) cameraPositionRef.current.x += distance;

    cameraPositionRef.current.y = cameraHeight;

    camera.position.copy(cameraPositionRef.current);
    lookTargetRef.current.set(
      cameraPositionRef.current.x,
      0,
      cameraPositionRef.current.z
    );
    camera.lookAt(lookTargetRef.current);
  });

  if (!enabled || !preview) return null;

  if (preview.shape === "box") {
    return (
      <mesh
        position={[
          preview.mapPosition.x,
          preview.mapPosition.y,
          preview.mapPosition.z,
        ]}
      >
        <boxGeometry
          args={[
            Math.max(preview.width ?? MIN_SIZE, MIN_SIZE),
            preview.height,
            Math.max(preview.length ?? MIN_SIZE, MIN_SIZE),
          ]}
        />
        <meshBasicMaterial color="#00c8ff" transparent opacity={0.35} />
      </mesh>
    );
  }

  const scaleX = Math.max(preview.radiusX ?? MIN_SIZE / 2, MIN_SIZE / 2);
  const scaleZ = Math.max(preview.radiusZ ?? MIN_SIZE / 2, MIN_SIZE / 2);

  return (
    <mesh
      position={[
        preview.mapPosition.x,
        preview.mapPosition.y,
        preview.mapPosition.z,
      ]}
      scale={[scaleX, preview.height, scaleZ]}
    >
      <cylinderGeometry args={[1, 1, 1, preview.segments ?? DEFAULT_SEGMENTS]} />
      <meshBasicMaterial color="#ff6bcb" transparent opacity={0.35} />
    </mesh>
  );
}
