import {
  BufferGeometry,
  Float32BufferAttribute,
  Uint16BufferAttribute,
} from "three";

export type RampAxis = "x" | "z";
export type RampDirection = "positive" | "negative";

export interface RampGeometryParams {
  width: number;
  length: number;
  startHeight: number;
  endHeight: number;
  axis?: RampAxis;
  direction?: RampDirection;
}

export interface RampGeometryData {
  vertices: Float32Array;
  indices: Uint16Array;
  centerHeight: number;
}

const DEFAULT_AXIS: RampAxis = "z";
const DEFAULT_DIRECTION: RampDirection = "positive";

export function createRampGeometryData({
  width,
  length,
  startHeight,
  endHeight,
  axis = DEFAULT_AXIS,
  direction = DEFAULT_DIRECTION,
}: RampGeometryParams): RampGeometryData {
  const halfWidth = width / 2;
  const halfLength = length / 2;
  const ascendingTowardsPositive = direction !== "negative";

  const frontHeightWorld = ascendingTowardsPositive ? startHeight : endHeight;
  const backHeightWorld = ascendingTowardsPositive ? endHeight : startHeight;
  const baseHeightWorld = Math.min(startHeight, endHeight);

  const minHeight = Math.min(baseHeightWorld, frontHeightWorld, backHeightWorld);
  const maxHeight = Math.max(baseHeightWorld, frontHeightWorld, backHeightWorld);
  const centerHeight = (minHeight + maxHeight) / 2;

  const frontTop = frontHeightWorld - centerHeight;
  const backTop = backHeightWorld - centerHeight;
  const base = baseHeightWorld - centerHeight;

  const frontCoord = -halfLength;
  const backCoord = halfLength;

  const vertices = new Float32Array([
    // top front left
    -halfWidth,
    frontTop,
    frontCoord,
    // top front right
    halfWidth,
    frontTop,
    frontCoord,
    // top back left
    -halfWidth,
    backTop,
    backCoord,
    // top back right
    halfWidth,
    backTop,
    backCoord,
    // bottom front left
    -halfWidth,
    base,
    frontCoord,
    // bottom front right
    halfWidth,
    base,
    frontCoord,
    // bottom back left
    -halfWidth,
    base,
    backCoord,
    // bottom back right
    halfWidth,
    base,
    backCoord,
  ]);

  if (axis === "x") {
    // rotate +90 degrees around Y so the ramp runs along the X axis
    for (let index = 0; index < vertices.length; index += 3) {
      const vx = vertices[index];
      const vz = vertices[index + 2];
      vertices[index] = vz;
      vertices[index + 2] = -vx;
    }
  }

  const indices = new Uint16Array([
    // top face
    0,
    3,
    1,
    0,
    2,
    3,
    // bottom face
    4,
    5,
    7,
    4,
    7,
    6,
    // front face
    0,
    1,
    5,
    0,
    5,
    4,
    // back face
    2,
    7,
    3,
    2,
    6,
    7,
    // left face
    0,
    4,
    6,
    0,
    6,
    2,
    // right face
    1,
    3,
    7,
    1,
    7,
    5,
  ]);

  return { vertices, indices, centerHeight };
}

export function createRampBufferGeometry({
  vertices,
  indices,
}: RampGeometryData): BufferGeometry {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  geometry.setIndex(new Uint16BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  return geometry;
}
