import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JSX } from "react/jsx-runtime";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Clone, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Group, PointLight, Object3D } from "three";
import { createPortal } from "react-dom";
import { HorrorController } from "../Effects/HorrorController";
import { useGame } from "../../GameContext";

export type MissionEventProps = {
  position: [number, number, number];
  taxiRef?: MutableRefObject<Object3D | null>;
  active: boolean;
};

export type MissionEventComponent = (
  props: MissionEventProps
) => JSX.Element | null;

const BOB_SPEED = 0.8;
const BASE_SCALE = 0.32;
const SCARE_SCALE = 0.56;

const DISTORTION_MIN_RADIUS = 8;
const DISTORTION_MAX_RADIUS = 32;
const CRY_RADIUS = 28;
const JUMPSCARE_RADIUS = 5;
const RESET_RADIUS = 20;
const BLACKOUT_DURATION_MS = 3000;

const childModelPath = "models/The Child.glb";

type GLTFResult = {
  scene: Group;
};

const clamp = THREE.MathUtils.clamp;

const TheChildEvent: MissionEventComponent = ({
  position,
  taxiRef,
  active,
}) => {
  const { setGameOver } = useGame();
  const groupRef = useRef<Group>(null);
  const lightRef = useRef<PointLight>(null);
  const scareActiveRef = useRef(false);
  const scareTimerRef = useRef(0);
  const scaleRef = useRef(BASE_SCALE);
  const bobPhaseRef = useRef(Math.random() * Math.PI * 2);
  const flickerRef = useRef(0);
  const cryingAudioRef = useRef<HTMLAudioElement | null>(null);
  const cryingTargetVolumeRef = useRef(0);
  const screamAudioRef = useRef<HTMLAudioElement | null>(null);
  const jumpscareTriggeredRef = useRef(false);
  const blackoutTimeoutRef = useRef<number | null>(null);
  const [blackout, setBlackout] = useState(false);

  const { scene } = useGLTF(childModelPath) as GLTFResult;
  const ghostPosition = useMemo(
    () => new THREE.Vector3(position[0], position[1], position[2]),
    [position]
  );
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (typeof Audio === "undefined") return;

    const crying = new Audio("sounds/cryingchild.mp3");
    crying.loop = true;
    crying.volume = 0;
    cryingAudioRef.current = crying;

    const scream = new Audio("sounds/jumpscare.mp3");
    scream.volume = 1;
    screamAudioRef.current = scream;

    return () => {
      if (cryingAudioRef.current) {
        cryingAudioRef.current.pause();
        cryingAudioRef.current.currentTime = 0;
      }
      if (screamAudioRef.current) {
        screamAudioRef.current.pause();
        screamAudioRef.current.currentTime = 0;
      }
      if (blackoutTimeoutRef.current !== null) {
        window.clearTimeout(blackoutTimeoutRef.current);
        blackoutTimeoutRef.current = null;
      }
      cryingAudioRef.current = null;
      screamAudioRef.current = null;
    };
  }, []);

  const stopCrying = useCallback(() => {
    const crying = cryingAudioRef.current;
    cryingTargetVolumeRef.current = 0;
    if (!crying) return;
    crying.volume = 0;
    crying.pause();
    crying.currentTime = 0;
  }, []);

  const resetState = useCallback(() => {
    jumpscareTriggeredRef.current = false;
    scareActiveRef.current = false;
    scareTimerRef.current = 0;
    scaleRef.current = BASE_SCALE;
    flickerRef.current = 0;
    setBlackout(false);
    if (blackoutTimeoutRef.current !== null) {
      window.clearTimeout(blackoutTimeoutRef.current);
      blackoutTimeoutRef.current = null;
    }
    stopCrying();
    const scream = screamAudioRef.current;
    if (scream) {
      scream.pause();
      scream.currentTime = 0;
    }
  }, [stopCrying]);

  useEffect(() => {
    if (!active) {
      resetState();
    }
    scareActiveRef.current = false;
    scareTimerRef.current = 0;
    scaleRef.current = BASE_SCALE;
    if (groupRef.current) {
      groupRef.current.scale.setScalar(BASE_SCALE);
      groupRef.current.position.set(position[0], position[1], position[2]);
    }
    if (lightRef.current) {
      lightRef.current.intensity = 0.6;
    }
  }, [active, position, resetState]);

  const triggerJumpscare = useCallback(() => {
    if (jumpscareTriggeredRef.current) return;
    jumpscareTriggeredRef.current = true;
    cryingTargetVolumeRef.current = 0;
    const crying = cryingAudioRef.current;
    if (crying) {
      crying.volume = 0;
      crying.pause();
      crying.currentTime = 0;
    }
    const scream = screamAudioRef.current;
    if (scream) {
      scream.currentTime = 0;
      scream.volume = 1;
      void scream.play().catch(() => undefined);
    }
    setBlackout(true);
    if (blackoutTimeoutRef.current !== null) {
      window.clearTimeout(blackoutTimeoutRef.current);
    }
    blackoutTimeoutRef.current = window.setTimeout(() => {
      setBlackout(false);
      if (scream) {
        scream.pause();
        scream.currentTime = 0;
      }
      stopCrying();
      setGameOver(true);
    }, BLACKOUT_DURATION_MS);
  }, [setGameOver, stopCrying]);

  useFrame((_, delta) => {
    if (!active || !groupRef.current) return;

    const taxi = taxiRef?.current;
    if (!taxi) return;

    lookTarget.copy(taxi.position);
    groupRef.current.lookAt(lookTarget.x, ghostPosition.y, lookTarget.z);

    bobPhaseRef.current += delta * BOB_SPEED;
    const bobOffset = Math.sin(bobPhaseRef.current) * 0.1;
    groupRef.current.position.set(
      ghostPosition.x,
      ghostPosition.y + 0.25 + bobOffset,
      ghostPosition.z
    );

    const distance = taxi.position.distanceTo(ghostPosition);

    if (distance < JUMPSCARE_RADIUS) {
      scareActiveRef.current = true;
      scareTimerRef.current = 1.5;
      triggerJumpscare();
    } else if (scareActiveRef.current) {
      scareTimerRef.current -= delta;
      if (scareTimerRef.current <= 0 || distance > RESET_RADIUS) {
        scareActiveRef.current = false;
      }
    }

    const targetScale = scareActiveRef.current ? SCARE_SCALE : BASE_SCALE;
    scaleRef.current = THREE.MathUtils.lerp(
      scaleRef.current,
      targetScale,
      0.18
    );
    const scale = scaleRef.current;
    groupRef.current.scale.set(scale, scale, scale);

    const baseFlicker = clamp(1 - distance / 30, 0, 1);
    const targetFlicker = scareActiveRef.current ? 1 : baseFlicker * 0.6;
    flickerRef.current = THREE.MathUtils.lerp(
      flickerRef.current,
      targetFlicker,
      scareActiveRef.current ? 0.45 : 0.1
    );

    if (lightRef.current) {
      const flicker = 1.2 + flickerRef.current * 4;
      lightRef.current.intensity = flicker;
      lightRef.current.distance = 7 + flickerRef.current * 3;
    }

    const crying = cryingAudioRef.current;
    const shouldCry =
      !jumpscareTriggeredRef.current && distance <= CRY_RADIUS && active;
    const targetVolume = shouldCry
      ? clamp(1 - distance / CRY_RADIUS, 0, 1)
      : 0;
    cryingTargetVolumeRef.current = targetVolume;

    if (crying) {
      const lerpFactor = Math.min(1, delta * 6);
      const nextVolume = THREE.MathUtils.lerp(
        crying.volume,
        cryingTargetVolumeRef.current,
        lerpFactor
      );
      crying.volume = nextVolume;

      if (crying.volume > 0.02 && crying.paused) {
        const duration = Number.isFinite(crying.duration)
          ? crying.duration
          : 0.1;
        crying.currentTime %= Math.max(duration, 0.1);
        void crying.play().catch(() => undefined);
      }

      if (crying.volume <= 0.01 && !shouldCry && !crying.paused) {
        crying.pause();
        crying.currentTime = 0;
      }
    }
  });

  const blackoutOverlay =
    blackout && typeof document !== "undefined"
      ? createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "black",
              pointerEvents: "none",
              opacity: blackout ? 1 : 0,
              transition: "opacity 0.2s ease",
              zIndex: 2000,
            }}
          />,
          document.body
        )
      : null;

  return (
    <>
      <group ref={groupRef} position={position}>
        <Clone object={scene} />
        <pointLight
          ref={lightRef}
          color="#ff9eb1"
          intensity={0.6}
          distance={6}
          decay={2.2}
        />
      </group>
      {active ? (
        <HorrorController
          playerRef={taxiRef}
          ghostPosition={ghostPosition}
          maxRadius={DISTORTION_MAX_RADIUS}
          minRadius={DISTORTION_MIN_RADIUS}
        />
      ) : null}
      {blackoutOverlay}
    </>
  );
};

useGLTF.preload(childModelPath);

export const missionEventRegistry = {
  "the-child-apparition": TheChildEvent,
} as const;

export type MissionEventId = keyof typeof missionEventRegistry;

export const getMissionEventComponent = (
  id: MissionEventId
): MissionEventComponent => missionEventRegistry[id];

export type MissionEventPlacement = {
  missionId: string;
  event: MissionEventId;
  position: [number, number, number];
};
