import { useBox, useRaycastVehicle } from "@react-three/cannon";
import { useEffect, useMemo, useRef, useCallback } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "./useControls";
import type { ControlMode } from "./useControls";
import { useWheels } from "./useWheels";
import { WheelDebug } from "./WheelDebug";
import * as THREE from "three";
import { useGame } from "../../GameContext";
import { useHitDetection } from "./useHitDetection";
import { useMeta } from "../../context/MetaContext";
import { useGLTF } from "@react-three/drei";
import { cars } from "../../utils/cars";

const BOOST_CHARGE_RATE = 5;
const BOOST_DEPLETION_RATE = 45;
const MIN_SPEED_FOR_CHARGE = 2;
const START_SOUND_SPEED_THRESHOLD = 0.5; // m/s (~1.8 km/h)
const BRAKE_SOUND_SPEED_THRESHOLD = 35; // km/h
const BRAKE_SMOKE_PARTICLE_COUNT = 32;
const BRAKE_SMOKE_SPAWN_INTERVAL = 0.075; // seconds between particles
const BRAKE_SMOKE_MAX_LIFE = 0.65; // seconds
const COLLISION_SOUND_COOLDOWN_MS = 350;
const UI_UPDATE_INTERVAL = 0.12; // seconds between UI state publishes
const DISTANCE_UPDATE_INTERVAL = 0.02; // kilometers aggregated before UI update

type Props = {
  chaseRef?: React.MutableRefObject<THREE.Object3D | null>;
  controlMode: ControlMode;
  isPaused: boolean;
  playerPositionRef: MutableRefObject<THREE.Vector3>;
  spawnPosition: [number, number, number];
};

type BrakeSmokeParticle = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  active: boolean;
};

function GenericCar({
  modelPath,
  scale,
  offset,
}: {
  modelPath: string;
  scale: number;
  offset: [number, number, number];
}) {
  const { scene } = useGLTF(modelPath) as { scene: THREE.Group };
  return (
    <primitive
      object={scene}
      rotation={[0, Math.PI, 0]}
      scale={[scale, scale, scale]}
      position={offset}
    />
  );
}

export function TaxiPhysics({
  chaseRef,
  controlMode,
  isPaused,
  playerPositionRef,
  spawnPosition,
}: Props) {
  const { selectedCar } = useMeta();

  // find config or fallback to Taxi
  const carConfig =
    cars.find((c) => c.modelPath === selectedCar) ||
    cars.find((c) => c.name === "Taxi")!;

  const carStartSoundRef = useRef<HTMLAudioElement | null>(null);
  const engineSoundRef = useRef<HTMLAudioElement | null>(null);
  const boostSoundRef = useRef<HTMLAudioElement | null>(null);
  const brakeSoundRef = useRef<HTMLAudioElement | null>(null);
  const glassBreakSoundRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedStartSoundRef = useRef(false);
  const lastGlassSoundTimeRef = useRef(0);
  const isBoostSoundPlayingRef = useRef(false);
  const wasBrakingRef = useRef(false);
  const brakeSmokeMeshRef = useRef<THREE.InstancedMesh>(null);
  const brakeSmokeSpawnTimerRef = useRef(0);
  const brakeSmokeSpawnIndexRef = useRef(0);
  const initialBrakeSmokeParticles = useMemo(
    () =>
      Array.from({ length: BRAKE_SMOKE_PARTICLE_COUNT }, () => ({
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: 0,
        active: false,
      })),
    []
  );
  const brakeSmokeParticlesRef = useRef<BrakeSmokeParticle[]>(
    initialBrakeSmokeParticles
  );
  const brakeSmokeTempObject = useMemo(() => new THREE.Object3D(), []);

  const startEngineLoop = useCallback(() => {
    const engineAudio = engineSoundRef.current;
    if (!engineAudio) return;
    if (!engineAudio.paused) return;
    engineAudio.currentTime = 0;
    void engineAudio.play().catch(() => undefined);
  }, []);

  const stopEngineLoop = useCallback(() => {
    const engineAudio = engineSoundRef.current;
    if (!engineAudio) return;
    engineAudio.pause();
    engineAudio.currentTime = 0;
  }, []);

  const playCarStartSound = useCallback(() => {
    const audio = carStartSoundRef.current;
    if (!audio) return;
    stopEngineLoop();
    audio.currentTime = 0;
    audio.onended = () => {
      audio.onended = null;
      startEngineLoop();
    };
    void audio.play().catch(() => {
      startEngineLoop();
      return undefined;
    });
  }, [startEngineLoop, stopEngineLoop]);

  const playGlassBreakSound = useCallback(() => {
    const audio = glassBreakSoundRef.current;
    if (!audio) return;

    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    if (now - lastGlassSoundTimeRef.current < COLLISION_SOUND_COOLDOWN_MS) {
      return;
    }

    lastGlassSoundTimeRef.current = now;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }, []);

  const startBoostSound = useCallback(() => {
    const audio = boostSoundRef.current;
    if (!audio) return;
    if (isBoostSoundPlayingRef.current) return;
    audio.currentTime = 0;
    isBoostSoundPlayingRef.current = true;
    void audio.play().catch(() => {
      isBoostSoundPlayingRef.current = false;
      return undefined;
    });
  }, []);

  const stopBoostSound = useCallback(() => {
    const audio = boostSoundRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    isBoostSoundPlayingRef.current = false;
  }, []);

  const playBrakeSound = useCallback(() => {
    const audio = brakeSoundRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }, []);

  const stopBrakeSound = useCallback(() => {
    const audio = brakeSoundRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    wasBrakingRef.current = false;
  }, []);

  useEffect(() => {
    if (typeof Audio === "undefined") return;

    const carStart = new Audio("/sounds/mixkit-car-start-ignition-1559.wav");
    carStart.preload = "auto";
    carStart.volume = 0.7;

    const engineLoop = new Audio("/sounds/diesel-car-engine-sound-111994.mp3");
    engineLoop.preload = "auto";
    engineLoop.loop = true;
    engineLoop.volume = 0.05;

    const boostLoop = new Audio("/sounds/audi-v8-acceleration-sound-6067.mp3");
    boostLoop.preload = "auto";
    boostLoop.loop = true;
    boostLoop.volume = 0.6;

    const brakeSound = new Audio(
      "/sounds/fast-car-braking-sound-effect-3-11000.mp3"
    );
    brakeSound.preload = "auto";
    brakeSound.volume = 0.65;

    const glassBreak = new Audio("/sounds/mixkit-car-window-breaking-1551.wav");
    glassBreak.preload = "auto";
    glassBreak.volume = 0.8;

    carStartSoundRef.current = carStart;
    engineSoundRef.current = engineLoop;
    boostSoundRef.current = boostLoop;
    brakeSoundRef.current = brakeSound;
    glassBreakSoundRef.current = glassBreak;

    return () => {
      carStart.pause();
      carStart.onended = null;
      engineLoop.pause();
      boostLoop.pause();
      brakeSound.pause();
      glassBreak.pause();
      carStartSoundRef.current = null;
      engineSoundRef.current = null;
      boostSoundRef.current = null;
      brakeSoundRef.current = null;
      glassBreakSoundRef.current = null;
    };
  }, []);

  const position = spawnPosition;
  const [initialX, initialY, initialZ] = position;

  const width = 0.5;
  const height = 0.18;
  const front = 0.6;
  const wheelRadius = 0.14;
  const brakeSmokeSpawnOffsets = useMemo(
    () => [
      new THREE.Vector3(-width * 0.32, wheelRadius * 0.65, -front - 0.12),
      new THREE.Vector3(width * 0.32, wheelRadius * 0.65, -front - 0.12),
    ],
    [front, wheelRadius, width]
  );

  // -------------------------
  // Headlights (front, +Z)
  // -------------------------
  const headlightHeight = height * 0.55 + 0.02;
  const headlightLateralOffset = width * 0.42;
  const headlightForwardOffset = front - 0.05; // +Z (front)
  const headlightTargetReach = front - 2.3; // aim forward
  const headlightTargets = useMemo(
    () => [new THREE.Object3D(), new THREE.Object3D()] as const,
    []
  );

  // -------------------------
  // Taillights (rear, -Z) — using your current physics
  // -------------------------
  const tailLightHeight = height * 0.85;
  const tailLightLateralOffset = width * 0.3;
  const tailLightBackwardOffset = headlightForwardOffset + 0.15; // where the taillight sits (Z)

  // --- Direction control (flip here) ---
  const TAIL_AIM: "rear" | "front" = "rear"; // change to "front" to point forward
  const tailAimDistance = -0.1; // how far from the light to place the target
  const tailAimOffsetZ =
    TAIL_AIM === "rear" ? -tailAimDistance : tailAimDistance;

  // Final target Z, relative to the taillight's Z position
  const tailLightTargetReach = tailLightBackwardOffset + tailAimOffsetZ;

  const tailLightTargets = useMemo(
    () => [new THREE.Object3D(), new THREE.Object3D()] as const,
    []
  );

  // Easy-to-tweak lens size
  const tailLensWidth = 0.07; // <-- change this to make the lens wider/narrower
  const tailLensHeight = 0.05; // <-- change this to make the lens taller/shorter

  const chassisBodyArgs: [number, number, number] = [width, height, front * 2];

  const chassisRef = useRef<THREE.Mesh>(null);
  const hitDetection = useHitDetection();

  const {
    setMoney,
    setKilometers,
    setGameOver,
    setSpeed,
    setBoost,
    boost,
    speed,
    gameOver,
  } = useGame();

  useEffect(() => {
    if (gameOver) {
      hasPlayedStartSoundRef.current = false;
      stopEngineLoop();
      stopBoostSound();
      stopBrakeSound();
    }
  }, [gameOver, stopBoostSound, stopBrakeSound, stopEngineLoop]);

  useEffect(() => {
    if (gameOver) return;
    if (isPaused) {
      stopEngineLoop();
      stopBoostSound();
      stopBrakeSound();
      return;
    }
    if (hasPlayedStartSoundRef.current) {
      startEngineLoop();
    }
  }, [
    gameOver,
    isPaused,
    startEngineLoop,
    stopBrakeSound,
    stopBoostSound,
    stopEngineLoop,
  ]);

  const velocityRef = useRef<[number, number, number]>([0, 0, 0]);
  const velocityVector = useRef(new THREE.Vector3());
  const uiTimerRef = useRef(0);
  const lastSpeedBroadcastRef = useRef(0);
  const distanceAccumulatorRef = useRef(0);

  // Add this ABOVE the useBox() call
  const lastCollisionTime = useRef(0);

  const handleMoneyLossOnCollision = useCallback(() => {
    const now = Date.now();
    if (now - lastCollisionTime.current < 1000) return; // 1 second cooldown
    lastCollisionTime.current = now;

    // Get current speed (in km/h from GameContext)
    const carSpeed = velocityVector.current.length() * 3.6; // convert from m/s
    if (carSpeed < 5) return; // ignore light taps

    // Calculate loss based on speed
    const loss = Math.min(carSpeed * 2, 500); // tune multiplier and cap
    setMoney((prev) => Math.max(prev - loss, 0));
  }, [setMoney]);

  const [chassisBoxRef, chassisApi] = useBox(
    () => ({
      args: chassisBodyArgs,
      mass: 220,
      position,
      linearDamping: 0.16,
      angularDamping: 0.32,
      allowSleep: true,
      sleepSpeedLimit: 0.25,
      sleepTimeLimit: 1,
      // onCollide: hitDetection.onCollide,
      onCollide: (e) => {
        hitDetection.onCollide(e);
        const currentSpeedKmh = velocityVector.current.length() * 3.6;
        if (currentSpeedKmh > 10) {
          playGlassBreakSound();
        }
        handleMoneyLossOnCollision();
      },
    }),
    chassisRef
  );

  useEffect(() => {
    if (chaseRef) chaseRef.current = chassisRef.current;
  }, [chaseRef]);

  useEffect(() => {
    if (
      !chassisApi?.position ||
      !chassisApi?.velocity ||
      !chassisApi?.angularVelocity
    )
      return;
    const [x, y, z] = spawnPosition;
    chassisApi.position.set(x, y, z);
    chassisApi.velocity.set(0, 0, 0);
    chassisApi.angularVelocity.set(0, 0, 0);
    if (typeof chassisApi.quaternion?.set === "function") {
      chassisApi.quaternion.set(0, 0, 0, 1);
    }
    velocityRef.current = [0, 0, 0];
    velocityVector.current.set(0, 0, 0);
    playerPositionRef.current.set(x, y, z);
  }, [chassisApi, spawnPosition, playerPositionRef, velocityVector]);

  // Attach headlight targets to the chassis
  useEffect(() => {
    const parent = chassisRef.current;
    if (!parent) return;

    const [leftTarget, rightTarget] = headlightTargets;
    leftTarget.position.set(
      -headlightLateralOffset,
      headlightHeight,
      headlightTargetReach
    );
    rightTarget.position.set(
      headlightLateralOffset,
      headlightHeight,
      headlightTargetReach
    );

    headlightTargets.forEach((target) => parent.add(target));
    return () => {
      headlightTargets.forEach((target) => parent.remove(target));
    };
  }, [
    chassisRef,
    headlightTargets,
    headlightHeight,
    headlightLateralOffset,
    headlightTargetReach,
  ]);

  // Attach taillight targets to the chassis (behind)
  useEffect(() => {
    const parent = chassisRef.current;
    if (!parent) return;

    const [leftTarget, rightTarget] = tailLightTargets;
    leftTarget.position.set(
      -tailLightLateralOffset,
      tailLightHeight,
      tailLightTargetReach
    );
    rightTarget.position.set(
      tailLightLateralOffset,
      tailLightHeight,
      tailLightTargetReach
    );

    tailLightTargets.forEach((target) => parent.add(target));
    return () => {
      tailLightTargets.forEach((target) => parent.remove(target));
    };
  }, [
    chassisRef,
    tailLightTargets,
    tailLightHeight,
    tailLightLateralOffset,
    tailLightTargetReach,
  ]);

  // Update external player position ref
  useEffect(() => {
    playerPositionRef.current.set(initialX, initialY, initialZ);
    const unsub = chassisApi?.position?.subscribe?.((next) => {
      playerPositionRef.current.set(next[0], next[1], next[2]);
    });
    return () => unsub?.();
  }, [chassisApi, playerPositionRef, initialX, initialY, initialZ]);

  const [wheels, wheelInfos] = useWheels(width, height, front, wheelRadius);
  const vehicleRef = useRef<THREE.Group>(null);

  const { maxBoost } = useGame();

  const [rvRef, vehicleApi] = useRaycastVehicle(
    () => ({ chassisBody: chassisBoxRef, wheels, wheelInfos }),
    vehicleRef
  );

  const controlStates = useControls(
    vehicleApi,
    chassisApi,
    controlMode,
    isPaused || gameOver
  );

  const {
    keyboardControls: activeKeyboardControls,
    mouseControls,
    controllerControls,
  } = controlStates;

  const boostRef = useRef(boost);
  const keyboardStateRef = useRef<Record<string, boolean>>({});

  const brakeStrength = useMemo(() => {
    if (isPaused || gameOver) return 0;
    switch (controlMode) {
      case "keyboard":
        return activeKeyboardControls?.s || activeKeyboardControls?.arrowdown
          ? 1
          : 0;
      case "mouse":
        return mouseControls?.brake ? 1 : 0;
      case "controller": {
        const brakeValue = controllerControls?.brake ?? 0;
        return THREE.MathUtils.clamp(brakeValue, 0, 1);
      }
      default:
        return 0;
    }
  }, [
    controlMode,
    activeKeyboardControls,
    mouseControls,
    controllerControls,
    isPaused,
    gameOver,
  ]);

  const brakeStrengthRef = useRef(brakeStrength);

  useEffect(() => {
    brakeStrengthRef.current = brakeStrength;
  }, [brakeStrength]);

  // Tail light brightness/opacities scale with brake
  const tailLightIntensity = useMemo(
    () => 0.25 + brakeStrength * 0.55,
    [brakeStrength]
  );

  const tailLightOpacity = useMemo(
    () => 0.45 + brakeStrength * 0.45,
    [brakeStrength]
  );

  // Lens glow (shape) tracks the same brake signal
  const tailLensEmissive = useMemo(
    () => 0.3 + brakeStrength * 2.0,
    [brakeStrength]
  );

  useEffect(() => {
    const unsub = chassisApi?.velocity?.subscribe?.((next) => {
      velocityRef.current = next;
    });
    return () => unsub?.();
  }, [chassisApi]);

  useEffect(() => {
    boostRef.current = boost;
  }, [boost]);

  useEffect(() => {
    const clamped = Math.min(boostRef.current, maxBoost);
    boostRef.current = clamped;
    setBoost((value) => Math.min(value, maxBoost));
  }, [maxBoost, setBoost]);

  useEffect(() => {
    keyboardStateRef.current = activeKeyboardControls ?? {};
  }, [activeKeyboardControls]);

  useEffect(() => {
    return hitDetection.onHit(() => {
      if (boostRef.current === 0) return;
      boostRef.current = 0;
      setBoost(0);
    });
  }, [hitDetection, setBoost]);

  const flushDistanceAndEconomy = useCallback(
    (kilometers: number) => {
      if (kilometers <= 0) return;
      setKilometers((value) => value + kilometers);
      //const fuelCost = kilometers * 45;
      const fuelCost = kilometers * (40 + speed * 0.3 + (boost > 0 ? 15 : 0));
      if (fuelCost <= 0) return;
      setMoney((value) => {
        if (fuelCost < 1e-6) return value;
        const next = value - fuelCost;
        if (next <= 0 && value > 0) {
          setGameOver(true);
          return 0;
        }
        if (Math.abs(next - value) < 1e-4) {
          return value;
        }
        return next;
      });
    },
    [setKilometers, setMoney, setGameOver]
  );

  useFrame((state, delta) => {
    if (gameOver || isPaused) {
      stopBoostSound();
      stopBrakeSound();
      brakeSmokeSpawnTimerRef.current = 0;
      brakeSmokeSpawnIndexRef.current = 0;
      brakeSmokeParticlesRef.current.forEach((particle) => {
        particle.active = false;
      });
      const smokeMesh = brakeSmokeMeshRef.current;
      if (smokeMesh) {
        smokeMesh.count = 0;
        smokeMesh.visible = false;
        smokeMesh.instanceMatrix.needsUpdate = true;
      }
      if (boostRef.current !== 0) {
        boostRef.current = 0;
        setBoost(0);
      }
      if (distanceAccumulatorRef.current > 0) {
        flushDistanceAndEconomy(distanceAccumulatorRef.current);
        distanceAccumulatorRef.current = 0;
      }
      if (lastSpeedBroadcastRef.current !== 0) {
        lastSpeedBroadcastRef.current = 0;
        setSpeed(0);
      }
      uiTimerRef.current = 0;
      return;
    }

    velocityVector.current.fromArray(velocityRef.current);
    const speed = velocityVector.current.length();

    if (
      !hasPlayedStartSoundRef.current &&
      speed > START_SOUND_SPEED_THRESHOLD
    ) {
      hasPlayedStartSoundRef.current = true;
      playCarStartSound();
    }

    const keyboardControls = keyboardStateRef.current;
    const boostKeyHeld = Boolean(keyboardControls?.space);
    const wantsBoost = boostKeyHeld && boostRef.current > 0.01;
    let nextBoost = boostRef.current;

    if (wantsBoost && nextBoost > 0) {
      nextBoost = Math.max(0, nextBoost - BOOST_DEPLETION_RATE * delta);
    } else if (!boostKeyHeld && speed > MIN_SPEED_FOR_CHARGE) {
      nextBoost = Math.min(maxBoost, nextBoost + BOOST_CHARGE_RATE * delta);
    }

    const capped = Math.min(nextBoost, maxBoost);

    if (Math.abs(capped - boostRef.current) > 0.001) {
      boostRef.current = capped;
      setBoost(capped);
    }

    if (boostKeyHeld && capped > 0.01) {
      startBoostSound();
    } else {
      stopBoostSound();
    }

    if (speed <= 0.0001) {
      if (distanceAccumulatorRef.current > 0) {
        flushDistanceAndEconomy(distanceAccumulatorRef.current);
        distanceAccumulatorRef.current = 0;
      }
      if (lastSpeedBroadcastRef.current !== 0) {
        lastSpeedBroadcastRef.current = 0;
        setSpeed(0);
      }
      uiTimerRef.current = 0;
      return;
    }

    const speedInKmh = speed * 3.6;

    uiTimerRef.current += delta;
    if (
      uiTimerRef.current >= UI_UPDATE_INTERVAL ||
      Math.abs(speedInKmh - lastSpeedBroadcastRef.current) > 3
    ) {
      uiTimerRef.current = 0;
      if (Math.abs(speedInKmh - lastSpeedBroadcastRef.current) > 0.25) {
        lastSpeedBroadcastRef.current = speedInKmh;
        setSpeed(speedInKmh);
      }
    }

    const brakingPressed = brakeStrengthRef.current > 0.2;
    const shouldPlayBrake =
      brakingPressed && speedInKmh > BRAKE_SOUND_SPEED_THRESHOLD;
    if (shouldPlayBrake && !wasBrakingRef.current) {
      playBrakeSound();
    }
    wasBrakingRef.current = shouldPlayBrake;

    const smokeParticles = brakeSmokeParticlesRef.current;
    const smokeMesh = brakeSmokeMeshRef.current;
    if (smokeMesh) {
      if (shouldPlayBrake && chassisRef.current) {
        brakeSmokeSpawnTimerRef.current += delta;
        const offsetsLength = brakeSmokeSpawnOffsets.length;
        while (brakeSmokeSpawnTimerRef.current >= BRAKE_SMOKE_SPAWN_INTERVAL) {
          brakeSmokeSpawnTimerRef.current -= BRAKE_SMOKE_SPAWN_INTERVAL;

          const offset =
            brakeSmokeSpawnOffsets[
              brakeSmokeSpawnIndexRef.current % offsetsLength
            ];
          brakeSmokeSpawnIndexRef.current += 1;

          const spawnPoint = offset.clone();
          chassisRef.current.localToWorld(spawnPoint);

          const backDirection = new THREE.Vector3(0, 0, -1)
            .applyQuaternion(chassisRef.current.quaternion)
            .normalize();
          const lateralDirection = new THREE.Vector3(1, 0, 0)
            .applyQuaternion(chassisRef.current.quaternion)
            .normalize();

          const particle =
            smokeParticles.find((item) => !item.active) ?? smokeParticles[0];
          particle.active = true;
          particle.life = 0;
          particle.maxLife =
            BRAKE_SMOKE_MAX_LIFE * (0.75 + Math.random() * 0.5);
          particle.position.copy(spawnPoint);
          particle.velocity
            .copy(backDirection)
            .multiplyScalar(2.4 + Math.random() * 1.2)
            .addScaledVector(lateralDirection, (Math.random() - 0.5) * 0.8);
          particle.velocity.y += 1.1 + Math.random() * 0.5;
        }
      } else {
        brakeSmokeSpawnTimerRef.current = 0;
        brakeSmokeSpawnIndexRef.current = 0;
      }

      const cameraQuaternion = state.camera.quaternion;
      let activeCount = 0;

      for (let i = 0; i < smokeParticles.length; i += 1) {
        const particle = smokeParticles[i];
        if (!particle.active) continue;

        particle.life += delta;
        if (particle.life >= particle.maxLife) {
          particle.active = false;
          continue;
        }

        particle.position.addScaledVector(particle.velocity, delta);
        particle.velocity.multiplyScalar(0.88);
        particle.velocity.y += 0.55 * delta;

        const lifeRatio = particle.life / particle.maxLife;
        const scale = THREE.MathUtils.lerp(0.05, 0.35, lifeRatio);

        brakeSmokeTempObject.position.copy(particle.position);
        brakeSmokeTempObject.scale.setScalar(scale);
        brakeSmokeTempObject.quaternion.copy(cameraQuaternion);
        brakeSmokeTempObject.updateMatrix();
        smokeMesh.setMatrixAt(activeCount, brakeSmokeTempObject.matrix);
        activeCount += 1;
      }

      smokeMesh.count = activeCount;
      smokeMesh.visible = activeCount > 0;
      smokeMesh.instanceMatrix.needsUpdate = true;
    }

    const kilometers = speed * delta * 0.001;
    if (kilometers > 0) {
      distanceAccumulatorRef.current += kilometers;
      if (distanceAccumulatorRef.current >= DISTANCE_UPDATE_INTERVAL) {
        flushDistanceAndEconomy(distanceAccumulatorRef.current);
        distanceAccumulatorRef.current = 0;
      }
    }
  });

  return (
    <group>
      <instancedMesh
        ref={brakeSmokeMeshRef}
        args={[undefined, undefined, BRAKE_SMOKE_PARTICLE_COUNT]}
        frustumCulled={false}
      >
        <planeGeometry args={[0.32, 0.32]} />
        <meshBasicMaterial
          color="#111111"
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </instancedMesh>
      <group ref={rvRef} name="vehicle">
        <mesh ref={chassisRef} castShadow receiveShadow>
          <boxGeometry args={chassisBodyArgs} />
          <meshBasicMaterial transparent opacity={0} />

          <GenericCar
            modelPath={carConfig.modelPath}
            scale={carConfig.scale}
            offset={carConfig.offset}
          />

          {/* Headlights */}
          <group name="headlights">
            {([-1, 1] as const).map((side, index) => (
              <group
                key={side}
                position={[
                  side * headlightLateralOffset,
                  headlightHeight,
                  headlightForwardOffset,
                ]}
              >
                <mesh position={[0, -0.1, -1.2]} rotation={[0, Math.PI, 0]}>
                  <planeGeometry args={[0.05, 0.01, 1]} />
                  <meshBasicMaterial
                    color="#fff7d1"
                    transparent
                    opacity={0.9}
                    toneMapped={false}
                  />
                </mesh>

                <spotLight
                  color="#fff7e1"
                  intensity={1}
                  angle={0.48}
                  penumbra={0.6}
                  distance={150}
                  decay={0.2}
                  target={headlightTargets[index]}
                  castShadow={false}
                />
              </group>
            ))}
          </group>

          {/* Taillights */}
          <group name="tailLights">
            {([-1, 1] as const).map((side, index) => (
              <group
                key={side}
                position={[
                  side * tailLightLateralOffset,
                  tailLightHeight,
                  tailLightBackwardOffset, // per your setup
                ]}
              >
                {/* The visible lens that glows with brake */}
                <mesh position={[0, -0.05, -0.12]} rotation={[0, Math.PI, 0]}>
                  <planeGeometry args={[tailLensWidth, tailLensHeight, 1]} />
                  <meshStandardMaterial
                    color="#3a0000" // dark red base
                    emissive="#ff2a2a"
                    emissiveIntensity={tailLensEmissive} // glow follows brake
                    transparent
                    opacity={tailLightOpacity} // keep your opacity behavior
                    toneMapped={false}
                    side={THREE.DoubleSide}
                  />
                </mesh>

                {/* The light cast into the world */}
                <spotLight
                  color="#ff5a4d"
                  intensity={tailLightIntensity}
                  angle={0.4}
                  penumbra={0.7}
                  distance={20}
                  decay={1.6}
                  target={tailLightTargets[index]}
                  castShadow={false}
                />
              </group>
            ))}
          </group>
        </mesh>

        <WheelDebug wheelRef={wheels[0]} radius={wheelRadius} />
        <WheelDebug wheelRef={wheels[1]} radius={wheelRadius} />
        <WheelDebug wheelRef={wheels[2]} radius={wheelRadius} />
        <WheelDebug wheelRef={wheels[3]} radius={wheelRadius} />
      </group>
    </group>
  );
}

// Preload taxi as fallback
useGLTF.preload("/models/Taxi.glb");
