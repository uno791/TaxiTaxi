import { useBox, useRaycastVehicle } from "@react-three/cannon";
import { useEffect, useRef } from "react";
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

const MAX_BOOST = 100;
const BOOST_CHARGE_RATE = 5;
const BOOST_DEPLETION_RATE = 45;
const MIN_SPEED_FOR_CHARGE = 2;

type Props = {
  chaseRef?: React.MutableRefObject<THREE.Object3D | null>;
  controlMode: ControlMode;
  isPaused: boolean;
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

export function TaxiPhysics({ chaseRef, controlMode, isPaused }: Props) {
  const { selectedCar } = useMeta();

  // find config or fallback to Taxi
  const carConfig =
    cars.find((c) => c.modelPath === selectedCar) ||
    cars.find((c) => c.name === "Taxi")!;

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
    const kilometers = metersTravelled * 0.001;

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

        <GenericCar
          modelPath={carConfig.modelPath}
          scale={carConfig.scale}
          offset={carConfig.offset}
        />
      </mesh>

      <WheelDebug wheelRef={wheels[0]} radius={wheelRadius} />
      <WheelDebug wheelRef={wheels[1]} radius={wheelRadius} />
      <WheelDebug wheelRef={wheels[2]} radius={wheelRadius} />
      <WheelDebug wheelRef={wheels[3]} radius={wheelRadius} />
    </group>
  );
}

// Preload taxi as fallback
useGLTF.preload("/models/Taxi.glb");
