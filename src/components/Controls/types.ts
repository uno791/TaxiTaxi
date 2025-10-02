export type ControlMode = "keyboard" | "mouse" | "controller";

export type KeyboardState = Record<string, boolean>;

export type MouseState = {
  accelerate: boolean;
  brake: boolean;
  steer: number;
};

export type DualSenseControls = {
  connected: boolean;
  steer: number;
  throttle: number;
  brake: number;
  handbrake: boolean;
  reverse: boolean;
  cameraX: number;
  cameraY: number;
};
