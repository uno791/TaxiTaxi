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

type Props = {
  /** Optional: expose the chassis ref so the camera can follow it */
  chaseRef?: React.MutableRefObject<THREE.Object3D | null>;
  controlMode: ControlMode;
  isPaused: boolean;
};

export function TaxiPhysics({ chaseRef, controlMode, isPaused }: Props) {
  const position: [number, number, number] = [-3, 0.5, -2];
  const width = 0.375;
  const height = 0.1;
  const front = 0.38;
  const wheelRadius = 0.05;

  const chassisBodyArgs: [number, number, number] = [width, height, front * 2];

  const chassisRef = useRef<THREE.Mesh>(null);
  const [chassisBoxRef, chassisApi] = useBox(
    () => ({
      args: chassisBodyArgs,
      mass: 500,
      position,
    }),
    chassisRef
  );

  // Expose the chassis to the outside for camera following
  useEffect(() => {
    if (chaseRef) chaseRef.current = chassisRef.current;
  }, [chaseRef]);

  const [wheels, wheelInfos] = useWheels(width, height, front, wheelRadius);
  const vehicleRef = useRef<THREE.Group>(null);
  const { setMoney, setKilometers, setGameOver, gameOver } = useGame();
  const [rvRef, vehicleApi] = useRaycastVehicle(
    () => ({ chassisBody: chassisBoxRef, wheels, wheelInfos }),
    vehicleRef
  );

  useControls(vehicleApi, chassisApi, controlMode, isPaused || gameOver);
  const velocityRef = useRef<[number, number, number]>([0, 0, 0]);
  const velocityVector = useRef(new THREE.Vector3());

  const taxiScale = 0.18;
  const taxiOffset: [number, number, number] = [0, -0.07, 0.02];

  useEffect(() => {
    const unsubscribeVelocity = chassisApi?.velocity?.subscribe?.((next) => {
      velocityRef.current = next;
    });

    return () => {
      unsubscribeVelocity?.();
    };
  }, [chassisApi]);

  useFrame((_, delta) => {
    if (gameOver || isPaused) return;

    velocityVector.current.fromArray(velocityRef.current);
    const speed = velocityVector.current.length();
    if (speed <= 0.0001) return;

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
