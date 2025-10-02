// TaxiPhysics.tsx
import { useBox, useRaycastVehicle } from "@react-three/cannon";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "./useControls";
import type { ControlMode } from "./useControls";
import { useWheels } from "./useWheels";
import { WheelDebug } from "./WheelDebug";
import { Taxi } from "./Taxi";
import * as THREE from "three";
import { useGame } from "../../GameContext";
import { useHitDetection } from "./useHitDetection";

const MAX_BOOST = 100;
const BOOST_CHARGE_RATE = 5; // units per second when driving
const BOOST_DEPLETION_RATE = 45; // units per second while boosting
const MIN_SPEED_FOR_CHARGE = 2; // m/s threshold to start charging boost

type Props = {
  /** Optional: expose the chassis ref so the camera can follow it */
  chaseRef?: React.MutableRefObject<THREE.Object3D | null>;
  controlMode: ControlMode;
  isPaused: boolean;
};

export function TaxiPhysics({ chaseRef, controlMode, isPaused }: Props) {
  const position: [number, number, number] = [-3, 0.5, -2];
  const width = 0.5;
  const height = 0.18;
  const front = 0.6;
  const wheelRadius = 0.14;

  const chassisBodyArgs: [number, number, number] = [width, height, front * 2];

  const chassisRef = useRef<THREE.Mesh>(null);
  const hitDetection = useHitDetection();
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
      onCollide: hitDetection.onCollide,
    }),
    chassisRef
  );

  // Expose the chassis to the outside for camera following
  useEffect(() => {
    if (chaseRef) chaseRef.current = chassisRef.current;
  }, [chaseRef]);

  const [wheels, wheelInfos] = useWheels(width, height, front, wheelRadius);
  const vehicleRef = useRef<THREE.Group>(null);
  const {
    setMoney,
    setKilometers,
    setGameOver,
    setSpeed,
    setBoost,
    boost,
    gameOver,
  } = useGame();
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
  const velocityRef = useRef<[number, number, number]>([0, 0, 0]);
  const velocityVector = useRef(new THREE.Vector3());
  const boostRef = useRef(boost);
  const keyboardStateRef = useRef<Record<string, boolean>>({});

  const taxiScale = 0.22;
  const taxiOffset: [number, number, number] = [0, -0.11, 0.02];

  useEffect(() => {
    const unsubscribeVelocity = chassisApi?.velocity?.subscribe?.((next) => {
      velocityRef.current = next;
    });

    return () => {
      unsubscribeVelocity?.();
    };
  }, [chassisApi]);

  useEffect(() => {
    boostRef.current = boost;
  }, [boost]);

  useEffect(() => {
    keyboardStateRef.current = controlStates.keyboardControls;
  }, [controlStates.keyboardControls]);

  useEffect(() => {
    return hitDetection.onHit(() => {
      if (boostRef.current === 0) return;
      boostRef.current = 0;
      setBoost(0);
    });
  }, [hitDetection, setBoost]);

  useFrame((_, delta) => {
    if (gameOver || isPaused) {
      if (boostRef.current !== 0) {
        boostRef.current = 0;
        setBoost(0);
      }
      setSpeed(0);
      return;
    }

    velocityVector.current.fromArray(velocityRef.current);
    const speed = velocityVector.current.length();

    const keyboardControls = keyboardStateRef.current;
    const boostKeyHeld = Boolean(keyboardControls?.space);
    const wantsBoost = boostKeyHeld && boostRef.current > 0.01;
    let nextBoost = boostRef.current;

    if (wantsBoost && nextBoost > 0) {
      nextBoost = Math.max(0, nextBoost - BOOST_DEPLETION_RATE * delta);
    } else if (!boostKeyHeld && speed > MIN_SPEED_FOR_CHARGE) {
      nextBoost = Math.min(MAX_BOOST, nextBoost + BOOST_CHARGE_RATE * delta);
    }

    if (Math.abs(nextBoost - boostRef.current) > 0.001) {
      boostRef.current = nextBoost;
      setBoost(nextBoost);
    }

    if (speed <= 0.0001) {
      setSpeed(0);
      return;
    }

    const speedInKmh = speed * 3.6;
    setSpeed(speedInKmh);

    const metersTravelled = speed * delta;
    const kilometers = metersTravelled * 0.1;

    if (kilometers <= 0) return;

    setKilometers((value) => value + kilometers);
    setMoney((value) => {
      const fuelCost = kilometers * 20;
      const remaining = value - fuelCost;
      if (remaining <= 0) {
        setGameOver(true);
        return 0;
      }
      return remaining;
    });
  });

  return (
    <group ref={rvRef} name="vehicle">
      <mesh ref={chassisRef} castShadow receiveShadow>
        <boxGeometry args={chassisBodyArgs} />
        <meshBasicMaterial transparent opacity={0} />
        <Taxi
          rotation={[0, Math.PI, 0]}
          scale={[taxiScale, taxiScale, taxiScale]}
          position={taxiOffset}
        />
      </mesh>

      <WheelDebug wheelRef={wheels[0]} radius={wheelRadius} />
      <WheelDebug wheelRef={wheels[1]} radius={wheelRadius} />
      <WheelDebug wheelRef={wheels[2]} radius={wheelRadius} />
      <WheelDebug wheelRef={wheels[3]} radius={wheelRadius} />
    </group>
  );
}
