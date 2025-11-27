const STANDARD_MAPPING = "standard";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const applyDeadzone = (value: number, deadzone = 0.12) =>
  Math.abs(value) < deadzone ? 0 : value;

const getGamepads = () => {
  if (typeof navigator === "undefined" || !navigator.getGamepads) {
    return [] as (Gamepad | null)[];
  }
  return navigator.getGamepads();
};

const findPrimaryGamepad = () => {
  const pads = getGamepads();
  return (
    pads.find(
      (entry): entry is Gamepad =>
        Boolean(entry) && entry.mapping === STANDARD_MAPPING
    ) ??
    pads.find((entry): entry is Gamepad => Boolean(entry)) ??
    null
  );
};

export { applyDeadzone, clamp, findPrimaryGamepad, getGamepads };
