import { useEffect, useMemo, useRef } from "react";
import type { JSX } from "react/jsx-runtime";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Clone, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Group, PointLight, Object3D } from "three";
import { HorrorController } from "../Effects/HorrorController";

export type MissionEventProps = {
  position: [number, number, number];
  taxiRef?: MutableRefObject<Object3D | null>;
  active: boolean;
};

export type MissionEventComponent = (props: MissionEventProps) => JSX.Element | null;

const BOB_SPEED = 0.8;
const BASE_SCALE = 0.32;
const SCARE_SCALE = 0.56;
const JUMPSCARE_RADIUS = 6;
const RESET_RADIUS = 18;

const childModelPath = "models/The Child.glb";

type GLTFResult = {
  scene: Group;
};

const clamp = THREE.MathUtils.clamp;

const TheChildEvent: MissionEventComponent = ({ position, taxiRef, active }) => {
  const groupRef = useRef<Group>(null);
  const lightRef = useRef<PointLight>(null);
  const scareActiveRef = useRef(false);
  const scareTimerRef = useRef(0);
  const scaleRef = useRef(BASE_SCALE);
  const bobPhaseRef = useRef(Math.random() * Math.PI * 2);
  const flickerRef = useRef(0);

  const { scene } = useGLTF(childModelPath) as GLTFResult;
  const ghostPosition = useMemo(
    () => new THREE.Vector3(position[0], position[1], position[2]),
    [position]
  );
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
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
  }, [active, position]);

  useFrame((_, delta) => {
    if (!active || !groupRef.current) return;

    const taxi = taxiRef?.current;
    if (!taxi) return;

    // Keep the model facing the player
    lookTarget.copy(taxi.position);
    groupRef.current.lookAt(lookTarget.x, ghostPosition.y, lookTarget.z);

    // Light bobbing animation
    bobPhaseRef.current += delta * BOB_SPEED;
    const bobOffset = Math.sin(bobPhaseRef.current) * 0.1;
    groupRef.current.position.set(
      ghostPosition.x,
      ghostPosition.y + 0.25 + bobOffset,
      ghostPosition.z
    );

    const distance = taxi.position.distanceTo(ghostPosition);

    if (!scareActiveRef.current && distance < JUMPSCARE_RADIUS) {
      scareActiveRef.current = true;
      scareTimerRef.current = 1.5; // seconds of elevated scare
    }

    if (scareActiveRef.current) {
      scareTimerRef.current -= delta;
      if (scareTimerRef.current <= 0 || distance > RESET_RADIUS) {
        scareActiveRef.current = false;
      }
    }

    const targetScale = scareActiveRef.current ? SCARE_SCALE : BASE_SCALE;
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale, 0.18);
    const scale = scaleRef.current;
    groupRef.current.scale.set(scale, scale, scale);

    // Light flicker ramps with proximity and spikes during scare
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
  });

  return (
    <>
      <group ref={groupRef} position={position}>
        <Clone object={scene} />
        <pointLight ref={lightRef} color="#ff9eb1" intensity={0.6} distance={6} decay={2.2} />
      </group>
      {active ? (
        <HorrorController
          playerRef={taxiRef}
          ghostPosition={ghostPosition}
          maxRadius={32}
          minRadius={4}
        />
      ) : null}
    </>
  );
};

useGLTF.preload(childModelPath);

export const missionEventRegistry = {
  "the-child-apparition": TheChildEvent,
} as const;

export type MissionEventId = keyof typeof missionEventRegistry;

export const getMissionEventComponent = (id: MissionEventId): MissionEventComponent =>
  missionEventRegistry[id];

export type MissionEventPlacement = {
  missionId: string;
  event: MissionEventId;
  position: [number, number, number];
};
