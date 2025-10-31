import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JSX } from "react/jsx-runtime";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, PointLight, Object3D } from "three";
import { HorrorController } from "../Effects/HorrorController";

export type MissionEventProps = {
  position: [number, number, number];
  taxiRef?: MutableRefObject<Object3D | null>;
  active: boolean;
  onMissionFailed?: (options?: { message?: string }) => void;
};

export type MissionEventComponent = (
  props: MissionEventProps
) => JSX.Element | null;

const BOB_SPEED = 0.6;
const BASE_SCALE = 0.9;
const SCARE_SCALE = 1.45;
const CRY_RADIUS = 15;
const JUMPSCARE_RADIUS = 5;
const DISTORTION_INTENSITY = 0.18;
const BLACKOUT_DURATION_MS = 3000;
const GLOW_HEIGHT = 6;
const GLOW_WIDTH = 6;

const glowVertexShader = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    float wobble = sin(uTime * 2.4 + position.y * 3.1) * 0.12 * uIntensity;
    transformed.x += wobble;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const glowFragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uBaseColor;

  void main() {
    vec2 centered = vUv - 0.5;
    float dist = length(centered);
    float halo = exp(-dist * 7.0);
    float pulse = 0.65 + 0.35 * sin(uTime * 5.0);
    float flicker = 0.85 + 0.25 * sin(uTime * 11.0 + dist * 12.0);
    float alpha = clamp(halo * (0.9 + pulse * 0.4) * uIntensity, 0.0, 1.0);
    vec3 color = uBaseColor * (halo * (1.2 + pulse * 0.6) * flicker);
    gl_FragColor = vec4(color, alpha);
  }
`;

const clamp = THREE.MathUtils.clamp;

type SpiritEventConfig = {
  baseColor: number | string;
  lightColor: string;
  overlayColor: string;
  cryingSound: string;
};

const createSpiritApparition = ({
  baseColor,
  lightColor,
  overlayColor,
  cryingSound,
}: SpiritEventConfig): MissionEventComponent => {
  const Apparition: MissionEventComponent = ({
    position,
    taxiRef,
    active,
    onMissionFailed,
  }) => {
    const groupRef = useRef<Group>(null);
    const lightRef = useRef<PointLight>(null);
    const bobPhaseRef = useRef(Math.random() * Math.PI * 2);
    const scaleRef = useRef(BASE_SCALE);
    const cryingAudioRef = useRef<HTMLAudioElement | null>(null);
    const screamAudioRef = useRef<HTMLAudioElement | null>(null);
    const blackoutTimeoutRef = useRef<number | null>(null);
    const jumpscareTriggeredRef = useRef(false);
    const cryPlayingRef = useRef(false);
    const insideJumpscareRef = useRef(false);
    const [blackout, setBlackout] = useState(false);
    const overlayElementRef = useRef<HTMLDivElement | null>(null);
    const glowUniforms = useMemo(
      () => ({
        uTime: { value: 0 },
        uIntensity: { value: 0 },
        uBaseColor: { value: new THREE.Color(baseColor) },
      }),
      []
    );

    const ghostPosition = useMemo(
      () => new THREE.Vector3(position[0], position[1], position[2]),
      [position]
    );
    const lookTarget = useMemo(() => new THREE.Vector3(), []);
    const taxiWorldPosition = useMemo(() => new THREE.Vector3(), []);
    const horizontalGhostPosition = useMemo(
      () => new THREE.Vector3(position[0], 0, position[2]),
      [position]
    );

    useEffect(() => {
      if (typeof Audio === "undefined") return;

      const crying = new Audio(cryingSound);
      crying.loop = true;
      crying.volume = 1;
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
        cryingAudioRef.current = null;
        screamAudioRef.current = null;
      };
    }, [cryingSound]);

    const clearBlackoutTimeout = useCallback(() => {
      if (blackoutTimeoutRef.current !== null) {
        window.clearTimeout(blackoutTimeoutRef.current);
        blackoutTimeoutRef.current = null;
      }
    }, []);

    useEffect(() => {
      if (typeof document === "undefined") return;
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.backgroundColor = overlayColor;
      overlay.style.opacity = "0";
      overlay.style.pointerEvents = "none";
      overlay.style.transition = "opacity 0.2s ease";
      overlay.style.zIndex = "1000";
      document.body.appendChild(overlay);
      overlayElementRef.current = overlay;
      return () => {
        overlay.remove();
        overlayElementRef.current = null;
      };
    }, [overlayColor]);

    useEffect(() => {
      const overlay = overlayElementRef.current;
      if (!overlay) return;
      overlay.style.opacity = blackout ? "0.95" : "0";
    }, [blackout]);

    useEffect(() => {
      if (groupRef.current) {
        groupRef.current.visible = active;
      }
      if (!active) {
        glowUniforms.uIntensity.value = 0;
      }
    }, [active, glowUniforms]);

    const stopAllAudio = useCallback(() => {
      const crying = cryingAudioRef.current;
      if (crying) {
        crying.pause();
        crying.currentTime = 0;
        cryPlayingRef.current = false;
      }

      const scream = screamAudioRef.current;
      if (scream) {
        scream.pause();
        scream.currentTime = 0;
      }
    }, []);

    const startCrying = useCallback(() => {
      const crying = cryingAudioRef.current;
      if (!crying || cryPlayingRef.current) return;
      cryPlayingRef.current = true;
      crying.currentTime = 0;
      void crying.play().catch(() => undefined);
    }, []);

    const stopCrying = useCallback(() => {
      const crying = cryingAudioRef.current;
      if (!crying || !cryPlayingRef.current) return;
      cryPlayingRef.current = false;
      crying.pause();
      crying.currentTime = 0;
    }, []);

    const resetVisuals = useCallback(() => {
      scaleRef.current = BASE_SCALE;
      if (groupRef.current) {
        groupRef.current.scale.setScalar(BASE_SCALE);
      }
      if (lightRef.current) {
        lightRef.current.intensity = 0.6;
      }
      setBlackout(false);
      jumpscareTriggeredRef.current = false;
      insideJumpscareRef.current = false;
    }, []);

    const cleanupState = useCallback(() => {
      clearBlackoutTimeout();
      stopAllAudio();
      resetVisuals();
    }, [clearBlackoutTimeout, resetVisuals, stopAllAudio]);

    const triggerJumpscare = useCallback(() => {
      if (jumpscareTriggeredRef.current) return;
      jumpscareTriggeredRef.current = true;
      stopCrying();

      const crying = cryingAudioRef.current;
      if (crying) {
        crying.pause();
        crying.currentTime = 0;
      }

      const scream = screamAudioRef.current;
      if (scream) {
        scream.currentTime = 0;
        void scream.play().catch(() => undefined);
      }

      setBlackout(true);
      clearBlackoutTimeout();
      blackoutTimeoutRef.current = window.setTimeout(() => {
        setBlackout(false);
        if (scream) {
          scream.pause();
          scream.currentTime = 0;
        }
        onMissionFailed?.({ message: "The spirits have consumed you." });
      }, BLACKOUT_DURATION_MS);
    }, [clearBlackoutTimeout, onMissionFailed]);

    useEffect(() => {
      if (!active) {
        cleanupState();
        return;
      }

      cleanupState();
      startCrying();

      return () => {
        cleanupState();
      };
    }, [active, cleanupState, startCrying]);

    useFrame((_, delta) => {
      if (!active || !groupRef.current) return;

      const taxi = taxiRef?.current;
      if (taxi) {
        taxi.getWorldPosition(taxiWorldPosition);
        lookTarget.set(
          taxiWorldPosition.x,
          ghostPosition.y,
          taxiWorldPosition.z
        );
        groupRef.current.lookAt(lookTarget);
      }

      bobPhaseRef.current += delta * BOB_SPEED;
      const bobOffset = Math.sin(bobPhaseRef.current) * 0.1;
      groupRef.current.position.set(
        ghostPosition.x,
        ghostPosition.y + 0.25 + bobOffset,
        ghostPosition.z
      );

      const distance = taxi
        ? (() => {
            taxi.getWorldPosition(taxiWorldPosition);
            const horizontalTaxiPos = taxiWorldPosition.setY(0);
            return horizontalTaxiPos.distanceTo(horizontalGhostPosition);
          })()
        : Number.POSITIVE_INFINITY;

      if (!jumpscareTriggeredRef.current) {
        if (distance <= CRY_RADIUS) {
          startCrying();
          const crying = cryingAudioRef.current;
          if (crying) {
            const targetVolume = clamp(1 - distance / CRY_RADIUS, 0.35, 1);
            crying.volume = THREE.MathUtils.lerp(
              crying.volume,
              targetVolume,
              clamp(delta * 6, 0, 1)
            );
          }
        } else {
          stopCrying();
        }
      }

      const withinJumpscare = distance <= JUMPSCARE_RADIUS;
      if (withinJumpscare && !insideJumpscareRef.current) {
        triggerJumpscare();
      }
      insideJumpscareRef.current = withinJumpscare;

      const targetIntensity = jumpscareTriggeredRef.current
        ? 1.6
        : clamp(1 - distance / CRY_RADIUS, 0, 1);
      const lerpFactor = clamp(delta * 4, 0, 1);
      glowUniforms.uIntensity.value = THREE.MathUtils.lerp(
        glowUniforms.uIntensity.value,
        targetIntensity,
        lerpFactor
      );
      glowUniforms.uTime.value += delta;

      const targetScale = jumpscareTriggeredRef.current
        ? SCARE_SCALE
        : BASE_SCALE;
      scaleRef.current = THREE.MathUtils.lerp(
        scaleRef.current,
        targetScale,
        0.18
      );
      groupRef.current.scale.set(
        scaleRef.current,
        scaleRef.current,
        scaleRef.current
      );

      if (lightRef.current) {
        const targetIntensity = jumpscareTriggeredRef.current ? 6 : 0.6;
        lightRef.current.intensity = THREE.MathUtils.lerp(
          lightRef.current.intensity,
          targetIntensity,
          0.12
        );
      }
    });

    return (
      <>
        <group ref={groupRef} position={position}>
          <mesh>
            <planeGeometry args={[GLOW_WIDTH, GLOW_HEIGHT, 1, 1]} />
            <shaderMaterial
              uniforms={glowUniforms}
              vertexShader={glowVertexShader}
              fragmentShader={glowFragmentShader}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <pointLight
            ref={lightRef}
            color={lightColor}
            intensity={0.6}
            distance={6}
            decay={2.2}
          />
        </group>
        {active ? (
          <HorrorController
            ghostPosition={ghostPosition}
            intensity={DISTORTION_INTENSITY}
          />
        ) : null}
      </>
    );
  };

  return Apparition;
};

const TheChildEvent = createSpiritApparition({
  baseColor: 0xf7b0ff,
  lightColor: "#ff9eb1",
  overlayColor: "white",
  cryingSound: "sounds/cryingchild.mp3",
});

const WeepingSpiritEvent = createSpiritApparition({
  baseColor: 0x7abfff,
  lightColor: "#6bc2ff",
  overlayColor: "rgba(40, 94, 188, 0.94)",
  cryingSound: "sounds/girlcrying.mp3",
});

export const missionEventRegistry = {
  "the-child-apparition": TheChildEvent,
  "the-weeping-spirit": WeepingSpiritEvent,
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
