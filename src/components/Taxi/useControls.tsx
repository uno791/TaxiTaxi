import { useEffect, useMemo } from "react";
import { useGame } from "../../GameContext";
import { useKeyboardControls } from "../Controls/useKeyboardControls";
import { useMouseControls } from "../Controls/useMouseControls";
import type { ControlMode, KeyboardState } from "../Controls/types";
import { useDualSenseControls } from "../Controls/useDualSenseControls";

export type { ControlMode } from "../Controls/types";

const COUNTER_STEER_RATIO = 0.1 / 0.35;
//Arcadey Feel
// const ENGINE_FORCE = 650;
// const BRAKE_FORCE = -900;
// const BOOST_ENGINE_FORCE = 1400;
const ENGINE_FORCE = 200;
const BRAKE_FORCE = -400;
const BOOST_ENGINE_FORCE = 600;

type VehicleApi = {
  applyEngineForce: (force: number, wheelIndex: number) => void;
  setSteeringValue: (value: number, wheelIndex: number) => void;
};

type ChassisApi = {
  velocity?: { set: (x: number, y: number, z: number) => void };
  angularVelocity?: { set: (x: number, y: number, z: number) => void };
} | null;

const resetVehicle = (vehicleApi: VehicleApi) => {
  vehicleApi.applyEngineForce(0, 2);
  vehicleApi.applyEngineForce(0, 3);
  for (let i = 0; i < 4; i++) {
    vehicleApi.setSteeringValue(0, i);
  }
};

export const useControls = (
  vehicleApi: VehicleApi,
  chassisApi: ChassisApi,
  controlMode: ControlMode,
  isPaused: boolean
) => {
  const {
    keyboardControls,
    spacePressed,
    reset: resetKeyboardControls,
  } = useKeyboardControls(controlMode, isPaused);
  const { mouseControls, reset: resetMouseControls } = useMouseControls(
    controlMode,
    isPaused
  );
  const dualSenseControls = useDualSenseControls();
  const gameState = useGame();
  const { boost } = gameState;

  const outputKeyboardControls = useMemo<KeyboardState>(() => {
    if (controlMode === "controller") {
      return {
        ...keyboardControls,
        space: dualSenseControls.handbrake,
      };
    }
    return keyboardControls;
  }, [keyboardControls, controlMode, dualSenseControls.handbrake]);

  useEffect(() => {
    resetVehicle(vehicleApi);
  }, [controlMode, vehicleApi]);

  useEffect(() => {
    if (!isPaused) return;

    resetVehicle(vehicleApi);
    chassisApi?.velocity?.set(0, 0, 0);
    chassisApi?.angularVelocity?.set(0, 0, 0);
    resetKeyboardControls();
    resetMouseControls();
  }, [
    isPaused,
    vehicleApi,
    chassisApi,
    resetKeyboardControls,
    resetMouseControls,
  ]);

  useEffect(() => {
    if (controlMode !== "keyboard") return;
    if (isPaused) {
      resetVehicle(vehicleApi);
      return;
    }

    const boostActive = Boolean(spacePressed && boost > 0.01);

    if (keyboardControls.w || keyboardControls.arrowup) {
      const force = boostActive
        ? ENGINE_FORCE + BOOST_ENGINE_FORCE
        : ENGINE_FORCE;
      vehicleApi.applyEngineForce(force, 2);
      vehicleApi.applyEngineForce(force, 3);
    } else if (keyboardControls.s || keyboardControls.arrowdown) {
      vehicleApi.applyEngineForce(BRAKE_FORCE, 2);
      vehicleApi.applyEngineForce(BRAKE_FORCE, 3);
    } else {
      vehicleApi.applyEngineForce(0, 2);
      vehicleApi.applyEngineForce(0, 3);
    }

    if (keyboardControls.a || keyboardControls.arrowleft) {
      vehicleApi.setSteeringValue(0.35, 2);
      vehicleApi.setSteeringValue(0.35, 3);
      vehicleApi.setSteeringValue(-0.1, 0);
      vehicleApi.setSteeringValue(-0.1, 1);
    } else if (keyboardControls.d || keyboardControls.arrowright) {
      vehicleApi.setSteeringValue(-0.35, 2);
      vehicleApi.setSteeringValue(-0.35, 3);
      vehicleApi.setSteeringValue(0.1, 0);
      vehicleApi.setSteeringValue(0.1, 1);
    } else {
      for (let i = 0; i < 4; i++) {
        vehicleApi.setSteeringValue(0, i);
      }
    }
  }, [
    keyboardControls,
    controlMode,
    vehicleApi,
    isPaused,
    boost,
    spacePressed,
  ]);

  useEffect(() => {
    if (controlMode !== "mouse") return;
    if (isPaused) {
      resetVehicle(vehicleApi);
      return;
    }

    const boostActive = Boolean(
      mouseControls.accelerate && spacePressed && boost > 0.01
    );

    const engineForce = mouseControls.accelerate
      ? ENGINE_FORCE + (boostActive ? BOOST_ENGINE_FORCE : 0)
      : mouseControls.brake
      ? BRAKE_FORCE
      : 0;

    vehicleApi.applyEngineForce(engineForce, 2);
    vehicleApi.applyEngineForce(engineForce, 3);

    const maxFrontSteer = 0.35;
    const frontSteer = maxFrontSteer * mouseControls.steer;
    const rearSteer = -frontSteer * COUNTER_STEER_RATIO;

    vehicleApi.setSteeringValue(frontSteer, 2);
    vehicleApi.setSteeringValue(frontSteer, 3);
    vehicleApi.setSteeringValue(rearSteer, 0);
    vehicleApi.setSteeringValue(rearSteer, 1);
  }, [mouseControls, controlMode, vehicleApi, isPaused, spacePressed, boost]);

  useEffect(() => {
    if (controlMode !== "controller") return;
    if (isPaused) {
      resetVehicle(vehicleApi);
      return;
    }

    const { throttle, brake, steer, reverse, handbrake } = dualSenseControls;

    const wantsBoost = handbrake && boost > 0.01;
    const throttleForce = throttle > 0.001 ? throttle : 0;
    const brakeForce = brake > 0.001 ? brake : 0;

    let engineForce = 0;

    if (reverse) {
      const reverseForce = Math.max(throttleForce, brakeForce);
      engineForce = BRAKE_FORCE * reverseForce;
    } else if (throttleForce > 0) {
      const baseForce = ENGINE_FORCE * throttleForce;
      const boostForce = wantsBoost ? BOOST_ENGINE_FORCE * throttleForce : 0;
      engineForce = baseForce + boostForce;
    } else if (brakeForce > 0) {
      engineForce = BRAKE_FORCE * brakeForce;
    }

    vehicleApi.applyEngineForce(engineForce, 2);
    vehicleApi.applyEngineForce(engineForce, 3);

    const maxFrontSteer = 0.35;
    const frontSteer = maxFrontSteer * steer;
    const rearSteer = -frontSteer * COUNTER_STEER_RATIO;

    vehicleApi.setSteeringValue(frontSteer, 2);
    vehicleApi.setSteeringValue(frontSteer, 3);
    vehicleApi.setSteeringValue(rearSteer, 0);
    vehicleApi.setSteeringValue(rearSteer, 1);
  }, [controlMode, dualSenseControls, vehicleApi, isPaused, boost]);

  return useMemo(
    () => ({
      keyboardControls: outputKeyboardControls,
      mouseControls,
      controllerControls: dualSenseControls,
    }),
    [outputKeyboardControls, mouseControls, dualSenseControls]
  );
};
