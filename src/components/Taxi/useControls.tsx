import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const COUNTER_STEER_RATIO = 0.1 / 0.35;
const ENGINE_FORCE = 150;
const BRAKE_FORCE = -400;

export type ControlMode = "keyboard" | "mouse";

type KeyboardState = Record<string, boolean>;

type MouseState = {
  accelerate: boolean;
  brake: boolean;
  steer: number;
};

const ZERO_MOUSE_STATE: MouseState = {
  accelerate: false,
  brake: false,
  steer: 0,
};

type VehicleApi = {
  applyEngineForce: (force: number, wheelIndex: number) => void;
  setSteeringValue: (value: number, wheelIndex: number) => void;
};

type ChassisApi = {
  velocity?: { set: (x: number, y: number, z: number) => void };
  angularVelocity?: { set: (x: number, y: number, z: number) => void };
} | null;

const relevantKeys = new Set([
  "w",
  "a",
  "s",
  "d",
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
]);

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
  const [keyboardControls, setKeyboardControls] = useState<KeyboardState>({});
  const [mouseControls, setMouseControls] = useState<MouseState>({
    ...ZERO_MOUSE_STATE,
  });
  const pointerStateRef = useRef<MouseState>({ ...ZERO_MOUSE_STATE });

  useEffect(() => {
    resetVehicle(vehicleApi);
  }, [controlMode, vehicleApi]);

  useEffect(() => {
    if (!isPaused) return;

    resetVehicle(vehicleApi);
    chassisApi?.velocity?.set(0, 0, 0);
    chassisApi?.angularVelocity?.set(0, 0, 0);
    setKeyboardControls({});
    pointerStateRef.current = { ...ZERO_MOUSE_STATE };
    setMouseControls({ ...ZERO_MOUSE_STATE });
  }, [isPaused, vehicleApi, chassisApi]);

  useEffect(() => {
    if (controlMode !== "keyboard") {
      setKeyboardControls({});
      return;
    }

    const keyDownPressHandler = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (!relevantKeys.has(key)) return;
      if (isPaused) return;
      setKeyboardControls((controls) => {
        if (controls[key]) return controls;
        return { ...controls, [key]: true };
      });
    };

    const keyUpPressHandler = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (!relevantKeys.has(key)) return;
      if (isPaused) return;
      setKeyboardControls((controls) => {
        if (!controls[key]) return controls;
        const next = { ...controls, [key]: false };
        return next;
      });
    };

    setKeyboardControls({});

    window.addEventListener("keydown", keyDownPressHandler);
    window.addEventListener("keyup", keyUpPressHandler);

    return () => {
      window.removeEventListener("keydown", keyDownPressHandler);
      window.removeEventListener("keyup", keyUpPressHandler);
    };
  }, [controlMode, isPaused]);

  useEffect(() => {
    if (controlMode !== "mouse") {
      pointerStateRef.current = { ...ZERO_MOUSE_STATE };
      setMouseControls({ ...ZERO_MOUSE_STATE });
      return;
    }

    pointerStateRef.current = { ...ZERO_MOUSE_STATE };
    setMouseControls({ ...ZERO_MOUSE_STATE });

    const syncMouseControls = () => {
      setMouseControls({ ...pointerStateRef.current });
    };

    const updateSteerFromPointer = (clientX: number | null) => {
      if (typeof clientX !== "number") return;
      const normalized = THREE.MathUtils.clamp(
        (clientX / window.innerWidth) * 2 - 1,
        -1,
        1
      );

      const steerValue = THREE.MathUtils.clamp(-normalized, -1, 1);
      if (Math.abs(pointerStateRef.current.steer - steerValue) < 0.001) return;

      pointerStateRef.current.steer = steerValue;
      syncMouseControls();
    };

    const releaseButtons = () => {
      const pointer = pointerStateRef.current;
      if (!pointer.accelerate && !pointer.brake) return;
      pointer.accelerate = false;
      pointer.brake = false;
      syncMouseControls();
    };

    const pointerDownHandler = (event: PointerEvent) => {
      if (isPaused) return;
      if (event.button === 2) {
        event.preventDefault();
        if (!pointerStateRef.current.accelerate) {
          pointerStateRef.current.accelerate = true;
          syncMouseControls();
        }
      }
      if (event.button === 0) {
        if (!pointerStateRef.current.brake) {
          pointerStateRef.current.brake = true;
          syncMouseControls();
        }
      }
      updateSteerFromPointer(event.clientX);
    };

    const pointerUpHandler = (event: PointerEvent) => {
      if (isPaused) return;
      if (event.button === 2 && pointerStateRef.current.accelerate) {
        pointerStateRef.current.accelerate = false;
        syncMouseControls();
      }
      if (event.button === 0 && pointerStateRef.current.brake) {
        pointerStateRef.current.brake = false;
        syncMouseControls();
      }
    };

    const pointerMoveHandler = (event: PointerEvent) => {
      if (isPaused) return;
      updateSteerFromPointer(event.clientX);
    };

    const contextMenuHandler = (event: MouseEvent) => {
      event.preventDefault();
    };

    const blurHandler = () => {
      pointerStateRef.current = { ...ZERO_MOUSE_STATE };
      syncMouseControls();
    };

    window.addEventListener("pointerdown", pointerDownHandler);
    window.addEventListener("pointerup", pointerUpHandler);
    window.addEventListener("pointermove", pointerMoveHandler);
    window.addEventListener("pointercancel", releaseButtons);
    window.addEventListener("blur", blurHandler);
    window.addEventListener("contextmenu", contextMenuHandler);

    return () => {
      window.removeEventListener("pointerdown", pointerDownHandler);
      window.removeEventListener("pointerup", pointerUpHandler);
      window.removeEventListener("pointermove", pointerMoveHandler);
      window.removeEventListener("pointercancel", releaseButtons);
      window.removeEventListener("blur", blurHandler);
      window.removeEventListener("contextmenu", contextMenuHandler);
    };
  }, [controlMode, isPaused]);

  useEffect(() => {
    if (controlMode !== "keyboard") return;
    if (isPaused) {
      resetVehicle(vehicleApi);
      return;
    }

    if (keyboardControls.w || keyboardControls.arrowup) {
      vehicleApi.applyEngineForce(ENGINE_FORCE, 2);
      vehicleApi.applyEngineForce(ENGINE_FORCE, 3);
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
  }, [keyboardControls, controlMode, vehicleApi, isPaused]);

  useEffect(() => {
    if (controlMode !== "mouse") return;
    if (isPaused) {
      resetVehicle(vehicleApi);
      return;
    }

    const engineForce = mouseControls.accelerate
      ? ENGINE_FORCE
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
  }, [mouseControls, controlMode, vehicleApi, isPaused]);

  return useMemo(
    () => ({ keyboardControls, mouseControls }),
    [keyboardControls, mouseControls]
  );
};
