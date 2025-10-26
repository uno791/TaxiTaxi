import { useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { useCompoundBody } from "@react-three/cannon";
import type { CompoundBodyProps } from "@pmndrs/cannon-worker-api";
import type { Vector3 } from "three";
import { ColliderBox } from "../Taxi/ColliderBox";
import { ColliderCylinder } from "../Taxi/ColliderCylinder";
import {
  useColliderPainter,
  type ColliderDescriptor,
} from "../../tools/ColliderPainter";
import { CITY_SPAWN_POINTS, type CityId } from "../../constants/cities";

type Triplet = [number, number, number];

export type CityCollidersProps = ThreeElements["group"] & {
  debug?: boolean;
  playerPositionRef: MutableRefObject<Vector3>;
  cityOffset?: Triplet;
};

const CITY_ID: CityId = "city2";
const STATIC_COLLIDERS: readonly ColliderDescriptor[] = [
  {
    shape: "box",
    mapPosition: { x: 102.885, y: 0, z: -152.565 },
    height: 10,
    width: 0.665,
    length: 0.535,
  },
  {
    shape: "box",
    mapPosition: { x: 103.341, y: 0, z: -150.899 },
    height: 10,
    width: 0.21,
    length: 0.254,
  },
  {
    shape: "box",
    mapPosition: { x: 104.471, y: 0, z: -151.608 },
    height: 10,
    width: 0.266,
    length: 0.384,
  },
  {
    shape: "box",
    mapPosition: { x: 106.559, y: 0, z: -152.937 },
    height: 10,
    width: 0.267,
    length: 0.583,
  },
  {
    shape: "box",
    mapPosition: { x: 94.96, y: 0, z: -151.833 },
    height: 10,
    width: 0.464,
    length: 0.323,
  },
  {
    shape: "box",
    mapPosition: { x: 96.316, y: 0, z: -151.784 },
    height: 10,
    width: 0.381,
    length: 0.621,
  },
  {
    shape: "box",
    mapPosition: { x: 96.184, y: 0, z: -153.823 },
    height: 10,
    width: 0.262,
    length: 0.788,
  },
  {
    shape: "box",
    mapPosition: { x: 102.917, y: 0, z: -158.721 },
    height: 10,
    width: 3.019,
    length: 5.495,
  },
  {
    shape: "box",
    mapPosition: { x: 107.527, y: 0, z: -155.707 },
    height: 10,
    width: 0.231,
    length: 0.227,
  },
  {
    shape: "box",
    mapPosition: { x: 102.904, y: 0, z: -162.385 },
    height: 10,
    width: 1.445,
    length: 0.702,
  },
  {
    shape: "box",
    mapPosition: { x: 92.75, y: 0, z: -153.738 },
    height: 10,
    width: 3.443,
    length: 3.142,
  },
  {
    shape: "box",
    mapPosition: { x: 87.104, y: 0, z: -154.189 },
    height: 10,
    width: 3.617,
    length: 5.682,
  },
  {
    shape: "box",
    mapPosition: { x: 86.333, y: 0, z: -159.244 },
    height: 10,
    width: 2.928,
    length: 2.798,
  },
  {
    shape: "box",
    mapPosition: { x: 88.894, y: 0, z: -159.278 },
    height: 10,
    width: 3.33,
    length: 2.79,
  },
  {
    shape: "box",
    mapPosition: { x: 84.058, y: 0, z: -161.213 },
    height: 10,
    width: 0.358,
    length: 0.268,
  },
  {
    shape: "box",
    mapPosition: { x: 84.061, y: 0, z: -148.312 },
    height: 10,
    width: 0.783,
    length: 0.443,
  },
  {
    shape: "box",
    mapPosition: { x: 84.672, y: 0, z: -148.732 },
    height: 10,
    width: 0.672,
    length: 0.372,
  },
  {
    shape: "box",
    mapPosition: { x: 88.572, y: 0, z: -143.777 },
    height: 10,
    width: 4.86,
    length: 4.376,
  },
  {
    shape: "box",
    mapPosition: { x: 93.999, y: 0, z: -143.988 },
    height: 10,
    width: 4.616,
    length: 4.736,
  },
  {
    shape: "box",
    mapPosition: { x: 93.48, y: 0, z: -147.25 },
    height: 10,
    width: 6.419,
    length: 0.529,
  },
  {
    shape: "box",
    mapPosition: { x: 87.792, y: 0, z: -146.541 },
    height: 10,
    width: 1.568,
    length: 1.142,
  },
  {
    shape: "box",
    mapPosition: { x: 84.5, y: 0, z: -143.156 },
    height: 10,
    width: 0.648,
    length: 4.57,
  },
  {
    shape: "box",
    mapPosition: { x: 84.084, y: 0, z: -140.064 },
    height: 10,
    width: 0.348,
    length: 0.3,
  },
  {
    shape: "box",
    mapPosition: { x: 79.538, y: 0, z: -140.338 },
    height: 10,
    width: 0.293,
    length: 0.249,
  },
  {
    shape: "box",
    mapPosition: { x: 83.993, y: 0, z: -136.253 },
    height: 10,
    width: 0.201,
    length: 0.268,
  },
  {
    shape: "box",
    mapPosition: { x: 93.334, y: 0, z: -135.924 },
    height: 10,
    width: 15.164,
    length: 0.004,
  },
  {
    shape: "box",
    mapPosition: { x: 101.107, y: 0, z: -137.345 },
    height: 10,
    width: 0.402,
    length: 2.601,
  },
  {
    shape: "box",
    mapPosition: { x: 91.836, y: 0, z: -133.39 },
    height: 10,
    width: 15.182,
    length: 0.716,
  },
  {
    shape: "box",
    mapPosition: { x: 84.583, y: 0, z: -134.364 },
    height: 10,
    width: 0.457,
    length: 2.25,
  },
  {
    shape: "box",
    mapPosition: { x: 99.617, y: 0, z: -144.512 },
    height: 10,
    width: 1.315,
    length: 0.631,
  },
  {
    shape: "box",
    mapPosition: { x: 97.549, y: 0, z: -142.996 },
    height: 10,
    width: 0.359,
    length: 5.129,
  },
  {
    shape: "box",
    mapPosition: { x: 93.65, y: 0, z: -161.262 },
    height: 10,
    width: 0.229,
    length: 0.234,
  },
  {
    shape: "box",
    mapPosition: { x: 85.996, y: 0, z: -161.355 },
    height: 10,
    width: 1.321,
    length: 0.303,
  },
  {
    shape: "box",
    mapPosition: { x: 87.33, y: 0, z: -165.61 },
    height: 10,
    width: 2.039,
    length: 2.023,
  },
  {
    shape: "box",
    mapPosition: { x: 89.271, y: 0, z: -165.653 },
    height: 10,
    width: 0.499,
    length: 2.212,
  },
  {
    shape: "box",
    mapPosition: { x: 85.082, y: 0, z: -165.102 },
    height: 10,
    width: 1.878,
    length: 0.44,
  },
  {
    shape: "box",
    mapPosition: { x: 84.759, y: 0, z: -172.029 },
    height: 10,
    width: 0.45,
    length: 3.393,
  },
  {
    shape: "box",
    mapPosition: { x: 88.944, y: 0, z: -173.262 },
    height: 10,
    width: 5.59,
    length: 3.272,
  },
  {
    shape: "box",
    mapPosition: { x: 92.521, y: 0, z: -172.237 },
    height: 10,
    width: 0.511,
    length: 3.385,
  },
  {
    shape: "box",
    mapPosition: { x: 97.313, y: 0, z: -171.174 },
    height: 10,
    width: 0.408,
    length: 5.099,
  },
  {
    shape: "box",
    mapPosition: { x: 100.909, y: 0, z: -171.417 },
    height: 10,
    width: 4.463,
    length: 2.687,
  },
  {
    shape: "box",
    mapPosition: { x: 99.619, y: 0, z: -169.657 },
    height: 10,
    width: 1.332,
    length: 0.713,
  },
  {
    shape: "box",
    mapPosition: { x: 93.502, y: 0, z: -177.968 },
    height: 10,
    width: 0.122,
    length: 0.133,
  },
  {
    shape: "box",
    mapPosition: { x: 95.666, y: 0, z: -178.003 },
    height: 10,
    width: 0.119,
    length: 0.154,
  },
  {
    shape: "box",
    mapPosition: { x: 95.764, y: 0, z: -175.61 },
    height: 10,
    width: 0.172,
    length: 0.051,
  },
  {
    shape: "box",
    mapPosition: { x: 96.226, y: 0, z: -177.068 },
    height: 10,
    width: 0.722,
    length: 0.291,
  },
  {
    shape: "box",
    mapPosition: { x: 96.453, y: 0, z: -177.508 },
    height: 10,
    width: 0.303,
    length: 0.853,
  },
  {
    shape: "box",
    mapPosition: { x: 111.001, y: 0, z: -170.58 },
    height: 10,
    width: 3.05,
    length: 2.742,
  },
  {
    shape: "box",
    mapPosition: { x: 109.824, y: 0, z: -173.328 },
    height: 10,
    width: 3.058,
    length: 0.648,
  },
  {
    shape: "box",
    mapPosition: { x: 110.843, y: 0, z: -167.204 },
    height: 10,
    width: 3.241,
    length: 0.667,
  },
  {
    shape: "box",
    mapPosition: { x: 113.09, y: 0, z: -163.149 },
    height: 10,
    width: 0.194,
    length: 0.19,
  },
  {
    shape: "box",
    mapPosition: { x: 111.403, y: 0, z: -160.983 },
    height: 10,
    width: 2.722,
    length: 2.99,
  },
  {
    shape: "box",
    mapPosition: { x: 111.8, y: 0, z: -154.973 },
    height: 10,
    width: 2.879,
    length: 8.127,
  },
  {
    shape: "box",
    mapPosition: { x: 113.975, y: 0, z: -148.071 },
    height: 10,
    width: 0.181,
    length: 0.156,
  },
  {
    shape: "box",
    mapPosition: { x: 111.961, y: 0, z: -141.335 },
    height: 10,
    width: 2.439,
    length: 12.556,
  },
  {
    shape: "box",
    mapPosition: { x: 104.983, y: 0, z: -136.702 },
    height: 10,
    width: 3.671,
    length: 3.413,
  },
  {
    shape: "box",
    mapPosition: { x: 104.893, y: 0, z: -142.038 },
    height: 10,
    width: 3.356,
    length: 5.204,
  },
  {
    shape: "box",
    mapPosition: { x: 102.694, y: 0, z: -140.541 },
    height: 10,
    width: 0.984,
    length: 1.587,
  },
  {
    shape: "box",
    mapPosition: { x: 105.244, y: 0, z: -145.754 },
    height: 10,
    width: 3.862,
    length: 0.565,
  },
  {
    shape: "box",
    mapPosition: { x: 117.362, y: 0, z: -134.767 },
    height: 10,
    width: 0.729,
    length: 10.457,
  },
  {
    shape: "box",
    mapPosition: { x: 113.347, y: 0, z: -123.367 },
    height: 10,
    width: 0.399,
    length: 0.79,
  },
  {
    shape: "box",
    mapPosition: { x: 114.81, y: 0, z: -127.004 },
    height: 10,
    width: 5.16,
    length: 5.373,
  },
  {
    shape: "box",
    mapPosition: { x: 109.57, y: 0, z: -117.569 },
    height: 10,
    width: 0.339,
    length: 0.753,
  },
  {
    shape: "box",
    mapPosition: { x: 110.033, y: 0, z: -118.156 },
    height: 10,
    width: 0.65,
    length: 0.505,
  },
  {
    shape: "box",
    mapPosition: { x: 114.706, y: 0, z: -119.648 },
    height: 10,
    width: 4.971,
    length: 5.111,
  },
  {
    shape: "box",
    mapPosition: { x: 121.85, y: 0, z: -116.608 },
    height: 10,
    width: 9.629,
    length: 0.579,
  },
  {
    shape: "box",
    mapPosition: { x: 127.119, y: 0, z: -116.182 },
    height: 10,
    width: 0.567,
    length: 0.61,
  },
  {
    shape: "box",
    mapPosition: { x: 128.281, y: 0, z: -115.379 },
    height: 10,
    width: 0.732,
    length: 0.517,
  },
  {
    shape: "box",
    mapPosition: { x: 116.846, y: 0, z: -111.444 },
    height: 10,
    width: 12.342,
    length: 2.905,
  },
  {
    shape: "box",
    mapPosition: { x: 124.072, y: 0, z: -110.619 },
    height: 10,
    width: 0.87,
    length: 1.165,
  },
  {
    shape: "box",
    mapPosition: { x: 103.408, y: 0, z: -111.491 },
    height: 10,
    width: 7.536,
    length: 2.759,
  },
  {
    shape: "box",
    mapPosition: { x: 97.941, y: 0, z: -110.846 },
    height: 10,
    width: 2.327,
    length: 2.452,
  },
  {
    shape: "box",
    mapPosition: { x: 88.537, y: 0, z: -110.58 },
    height: 10,
    width: 2.667,
    length: 2.863,
  },
  {
    shape: "box",
    mapPosition: { x: 85.132, y: 0, z: -109.421 },
    height: 10,
    width: 0.81,
    length: 3.554,
  },
  {
    shape: "box",
    mapPosition: { x: 91.275, y: 0, z: -110.487 },
    height: 10,
    width: 0.484,
    length: 3.009,
  },
  {
    shape: "box",
    mapPosition: { x: 97.169, y: 0, z: -107.879 },
    height: 10,
    width: 3.018,
    length: 0.72,
  },
  {
    shape: "box",
    mapPosition: { x: 98.894, y: 0, z: -166.986 },
    height: 10,
    width: 2.911,
    length: 2.159,
  },
  {
    shape: "box",
    mapPosition: { x: 102.429, y: 0, z: -167.148 },
    height: 10,
    width: 4.646,
    length: 2.807,
  },
  {
    shape: "box",
    mapPosition: { x: 103.995, y: 0, z: -182.193 },
    height: 10,
    width: 4.082,
    length: 5.426,
  },
  {
    shape: "box",
    mapPosition: { x: 93.035, y: 0, z: -182.224 },
    height: 10,
    width: 2.966,
    length: 4.528,
  },
  {
    shape: "box",
    mapPosition: { x: 95.507, y: 0, z: -189.106 },
    height: 10,
    width: 4.023,
    length: 5.925,
  },
  {
    shape: "box",
    mapPosition: { x: 106.21, y: 0, z: -189.14 },
    height: 10,
    width: 3.452,
    length: 4.561,
  },
  {
    shape: "box",
    mapPosition: { x: 92.754, y: 0, z: -196.898 },
    height: 10,
    width: 3.864,
    length: 5.23,
  },
  {
    shape: "box",
    mapPosition: { x: 106.952, y: 0, z: -196.479 },
    height: 10,
    width: 3.679,
    length: 5.307,
  },
  {
    shape: "box",
    mapPosition: { x: 99.817, y: 0, z: -196.463 },
    height: 10,
    width: 1.567,
    length: 1.129,
  },
  {
    shape: "box",
    mapPosition: { x: 99.791, y: 0, z: -203.228 },
    height: 10,
    width: 5.208,
    length: 3.619,
  },
  {
    shape: "box",
    mapPosition: { x: 99.835, y: 0, z: -206.618 },
    height: 10,
    width: 8.531,
    length: 1.219,
  },
  {
    shape: "box",
    mapPosition: { x: 96.111, y: 0, z: -203.748 },
    height: 10,
    width: 1,
    length: 6.608,
  },
  {
    shape: "box",
    mapPosition: { x: 93.013, y: 0, z: -200.864 },
    height: 10,
    width: 7.062,
    length: 0.755,
  },
  {
    shape: "box",
    mapPosition: { x: 89.956, y: 0, z: -197.205 },
    height: 10,
    width: 1.038,
    length: 8.433,
  },
  {
    shape: "box",
    mapPosition: { x: 91.403, y: 0, z: -193.253 },
    height: 10,
    width: 3.862,
    length: 0.339,
  },
  {
    shape: "box",
    mapPosition: { x: 92.751, y: 0, z: -189.045 },
    height: 10,
    width: 0.865,
    length: 8.334,
  },
  {
    shape: "box",
    mapPosition: { x: 91.619, y: 0, z: -185.458 },
    height: 10,
    width: 3.333,
    length: 0.656,
  },
  {
    shape: "box",
    mapPosition: { x: 90.466, y: 0, z: -182.343 },
    height: 10,
    width: 0.979,
    length: 7.198,
  },
  {
    shape: "box",
    mapPosition: { x: 93.27, y: 0, z: -179.073 },
    height: 10,
    width: 5.212,
    length: 0.934,
  },
  {
    shape: "box",
    mapPosition: { x: 104.551, y: 0, z: -178.795 },
    height: 10,
    width: 5.354,
    length: 0.871,
  },
  {
    shape: "box",
    mapPosition: { x: 106.776, y: 0, z: -182.201 },
    height: 10,
    width: 0.815,
    length: 7.949,
  },
  {
    shape: "box",
    mapPosition: { x: 107.944, y: 0, z: -185.688 },
    height: 10,
    width: 3.064,
    length: 0.844,
  },
  {
    shape: "box",
    mapPosition: { x: 108.766, y: 0, z: -189.001 },
    height: 10,
    width: 1.044,
    length: 7.305,
  },
  {
    shape: "box",
    mapPosition: { x: 109.539, y: 0, z: -196.533 },
    height: 10,
    width: 0.808,
    length: 9.521,
  },
  {
    shape: "box",
    mapPosition: { x: 106.531, y: 0, z: -200.952 },
    height: 10,
    width: 7.073,
    length: 0.7,
  },
  {
    shape: "box",
    mapPosition: { x: 103.445, y: 0, z: -203.913 },
    height: 10,
    width: 0.891,
    length: 6.747,
  },
  {
    shape: "box",
    mapPosition: { x: 96.918, y: 0, z: -163.62 },
    height: 10,
    width: 0.747,
    length: 0.791,
  },
  {
    shape: "box",
    mapPosition: { x: 97.716, y: 0, z: -162.251 },
    height: 10,
    width: 0.81,
    length: 0.875,
  },
  {
    shape: "box",
    mapPosition: { x: 96.983, y: 0, z: -160.393 },
    height: 10,
    width: 0.615,
    length: 0.527,
  },
  {
    shape: "box",
    mapPosition: { x: 95.004, y: 0, z: -160.35 },
    height: 10,
    width: 0.624,
    length: 0.721,
  },
  {
    shape: "box",
    mapPosition: { x: 105.797, y: 0, z: -164.873 },
    height: 10,
    width: 0.589,
    length: 0.95,
  },
  {
    shape: "box",
    mapPosition: { x: 108.56, y: 0, z: -160.818 },
    height: 10,
    width: 0.408,
    length: 3.175,
  },
  {
    shape: "box",
    mapPosition: { x: 98.859, y: 0, z: -131.314 },
    height: 10,
    width: 1.089,
    length: 0.346,
  },
  {
    shape: "box",
    mapPosition: { x: 99.151, y: 0, z: -131.624 },
    height: 10,
    width: 0.321,
    length: 0.602,
  },
  {
    shape: "box",
    mapPosition: { x: 118.52, y: 0, z: -148.711 },
    height: 10,
    width: 0.758,
    length: 0.728,
  },
  {
    shape: "box",
    mapPosition: { x: 118.892, y: 0, z: -148.232 },
    height: 10,
    width: 0.421,
    length: 0.599,
  },
  {
    shape: "box",
    mapPosition: { x: 79.479, y: 0, z: -103.898 },
    height: 10,
    width: 1.241,
    length: 5.356,
  },
  {
    shape: "box",
    mapPosition: { x: 76.099, y: 0, z: -106.085 },
    height: 10,
    width: 7.665,
    length: 0.612,
  },
  {
    shape: "box",
    mapPosition: { x: 72.608, y: 0, z: -107.253 },
    height: 10,
    width: 0.585,
    length: 2.532,
  },
  {
    shape: "box",
    mapPosition: { x: 69.213, y: 0, z: -108.1 },
    height: 10,
    width: 7.321,
    length: 0.905,
  },
  {
    shape: "box",
    mapPosition: { x: 61.709, y: 0, z: -108.952 },
    height: 10,
    width: 9.602,
    length: 0.803,
  },
  {
    shape: "box",
    mapPosition: { x: 57.443, y: 0, z: -106.022 },
    height: 10,
    width: 1.004,
    length: 6.731,
  },
  {
    shape: "box",
    mapPosition: { x: 54.472, y: 0, z: -102.883 },
    height: 10,
    width: 6.659,
    length: 0.451,
  },
  {
    shape: "box",
    mapPosition: { x: 51.514, y: 0, z: -99.138 },
    height: 10,
    width: 0.967,
    length: 8.168,
  },
  {
    shape: "box",
    mapPosition: { x: 54.422, y: 0, z: -95.349 },
    height: 10,
    width: 6.701,
    length: 1.027,
  },
  {
    shape: "box",
    mapPosition: { x: 57.371, y: 0, z: -92.554 },
    height: 10,
    width: 0.581,
    length: 6.4,
  },
  {
    shape: "box",
    mapPosition: { x: 61.263, y: 0, z: -89.37 },
    height: 10,
    width: 8.506,
    length: 0.459,
  },
  {
    shape: "box",
    mapPosition: { x: 65.07, y: 0, z: -90.491 },
    height: 10,
    width: 0.806,
    length: 3.898,
  },
  {
    shape: "box",
    mapPosition: { x: 69.167, y: 0, z: -91.999 },
    height: 10,
    width: 8.053,
    length: 0.789,
  },
  {
    shape: "box",
    mapPosition: { x: 72.744, y: 0, z: -90.806 },
    height: 10,
    width: 0.754,
    length: 2.639,
  },
  {
    shape: "box",
    mapPosition: { x: 76.074, y: 0, z: -89.717 },
    height: 10,
    width: 7.106,
    length: 0.115,
  },
  {
    shape: "box",
    mapPosition: { x: 79.426, y: 0, z: -92.073 },
    height: 10,
    width: 1.016,
    length: 6.276,
  },
  {
    shape: "box",
    mapPosition: { x: 61.818, y: 0, z: -106.162 },
    height: 10,
    width: 5.125,
    length: 3.636,
  },
  {
    shape: "box",
    mapPosition: { x: 54.856, y: 0, z: -99.172 },
    height: 10,
    width: 3.479,
    length: 5.305,
  },
  {
    shape: "box",
    mapPosition: { x: 61.251, y: 0, z: -92.055 },
    height: 10,
    width: 5.126,
    length: 3.662,
  },
  {
    shape: "box",
    mapPosition: { x: 69.142, y: 0, z: -94.855 },
    height: 10,
    width: 5.919,
    length: 4.235,
  },
  {
    shape: "box",
    mapPosition: { x: 76.246, y: 0, z: -92.21 },
    height: 10,
    width: 4.679,
    length: 3.181,
  },
  {
    shape: "box",
    mapPosition: { x: 75.976, y: 0, z: -103.262 },
    height: 10,
    width: 5.684,
    length: 4.125,
  },
  {
    shape: "box",
    mapPosition: { x: 69.107, y: 0, z: -105.824 },
    height: 10,
    width: 4.648,
    length: 3.243,
  },
  {
    shape: "box",
    mapPosition: { x: 61.809, y: 0, z: -99.233 },
    height: 10,
    width: 0.932,
    length: 1.756,
  },
  {
    shape: "box",
    mapPosition: { x: 80.671, y: 0, z: -95.852 },
    height: 10,
    width: 0.438,
    length: 0.932,
  },
  {
    shape: "box",
    mapPosition: { x: 81.255, y: 0, z: -95.508 },
    height: 10,
    width: 0.244,
    length: 0.629,
  },
  {
    shape: "box",
    mapPosition: { x: 86.13, y: 0, z: -88.257 },
    height: 10,
    width: 2.86,
    length: 5.786,
  },
  {
    shape: "box",
    mapPosition: { x: 87.864, y: 0, z: -86.93 },
    height: 10,
    width: 0.832,
    length: 1.468,
  },
  {
    shape: "box",
    mapPosition: { x: 86.805, y: 0, z: -103.892 },
    height: 10,
    width: 4.95,
    length: 0.807,
  },
  {
    shape: "box",
    mapPosition: { x: 87.636, y: 0, z: -100.457 },
    height: 10,
    width: 3.432,
    length: 4.765,
  },
  {
    shape: "box",
    mapPosition: { x: 92.126, y: 0, z: -102.328 },
    height: 10,
    width: 2.819,
    length: 4.62,
  },
  {
    shape: "box",
    mapPosition: { x: 92.43, y: 0, z: -98.276 },
    height: 10,
    width: 2.299,
    length: 2.766,
  },
  {
    shape: "box",
    mapPosition: { x: 99.637, y: 0, z: -102.235 },
    height: 10,
    width: 5.543,
    length: 2.889,
  },
  {
    shape: "box",
    mapPosition: { x: 95.795, y: 0, z: -102.295 },
    height: 10,
    width: 0.525,
    length: 1.267,
  },
  {
    shape: "box",
    mapPosition: { x: 113.801, y: 0, z: -98.949 },
    height: 10,
    width: 0.456,
    length: 1.433,
  },
  {
    shape: "box",
    mapPosition: { x: 106.136, y: 0, z: -106.216 },
    height: 10,
    width: 2.466,
    length: 0.983,
  },
  {
    shape: "box",
    mapPosition: { x: 116.931, y: 0, z: -104.254 },
    height: 10,
    width: 5.956,
    length: 3.627,
  },
  {
    shape: "box",
    mapPosition: { x: 122.502, y: 0, z: -104.392 },
    height: 10,
    width: 3.419,
    length: 3.661,
  },
  {
    shape: "box",
    mapPosition: { x: 105.514, y: 0, z: -92.221 },
    height: 10,
    width: 3.189,
    length: 3.509,
  },
  {
    shape: "box",
    mapPosition: { x: 104.728, y: 0, z: -86.497 },
    height: 10,
    width: 5.898,
    length: 3.873,
  },
  {
    shape: "box",
    mapPosition: { x: 99.693, y: 0, z: -88.507 },
    height: 10,
    width: 3.035,
    length: 3.341,
  },
  {
    shape: "box",
    mapPosition: { x: 99.951, y: 0, z: -85.504 },
    height: 10,
    width: 2.86,
    length: 2.268,
  },
  {
    shape: "box",
    mapPosition: { x: 92.619, y: 0, z: -86.713 },
    height: 10,
    width: 2.223,
    length: 2.205,
  },
  {
    shape: "box",
    mapPosition: { x: 92.539, y: 0, z: -88.684 },
    height: 10,
    width: 1.911,
    length: 0.477,
  },
  {
    shape: "box",
    mapPosition: { x: 92.641, y: 0, z: -84.829 },
    height: 10,
    width: 1.785,
    length: 0.382,
  },
  {
    shape: "box",
    mapPosition: { x: 93.273, y: 0, z: -83.422 },
    height: 10,
    width: 0.505,
    length: 0.637,
  },
  {
    shape: "box",
    mapPosition: { x: 86.197, y: 0, z: -83.863 },
    height: 10,
    width: 3.149,
    length: 0.521,
  },
  {
    shape: "box",
    mapPosition: { x: 85.882, y: 0, z: -91.896 },
    height: 10,
    width: 3.204,
    length: 0.639,
  },
  {
    shape: "box",
    mapPosition: { x: 87.06, y: 0, z: -96.992 },
    height: 10,
    width: 4.779,
    length: 0.548,
  },
  {
    shape: "box",
    mapPosition: { x: 97.817, y: 0, z: -95.404 },
    height: 10,
    width: 0.079,
    length: 3.17,
  },
  {
    shape: "box",
    mapPosition: { x: 97.139, y: 0, z: -92.943 },
    height: 10,
    width: 0.308,
    length: 0.264,
  },
  {
    shape: "box",
    mapPosition: { x: 96.077, y: 0, z: -97.325 },
    height: 10,
    width: 0.822,
    length: 0.636,
  },
  {
    shape: "box",
    mapPosition: { x: 94.589, y: 0, z: -96.453 },
    height: 10,
    width: 0.725,
    length: 0.637,
  },
  {
    shape: "box",
    mapPosition: { x: 102.636, y: 0, z: -106.85 },
    height: 10,
    width: 0.198,
    length: 0.352,
  },
  {
    shape: "box",
    mapPosition: { x: 107.314, y: 0, z: -102.753 },
    height: 10,
    width: 0.242,
    length: 0.242,
  },
  {
    shape: "box",
    mapPosition: { x: 123.709, y: 0, z: -92.799 },
    height: 10,
    width: 2.991,
    length: 17.452,
  },
  {
    shape: "box",
    mapPosition: { x: 121.988, y: 0, z: -83.314 },
    height: 10,
    width: 0.308,
    length: 0.395,
  },
  {
    shape: "box",
    mapPosition: { x: 117.925, y: 0, z: -78.976 },
    height: 10,
    width: 0.505,
    length: 0.439,
  },
  {
    shape: "box",
    mapPosition: { x: 118.221, y: 0, z: -83.631 },
    height: 10,
    width: 0.308,
    length: 0.417,
  },
  {
    shape: "box",
    mapPosition: { x: 115.019, y: 0, z: -84.095 },
    height: 10,
    width: 5.219,
    length: 0.753,
  },
  {
    shape: "box",
    mapPosition: { x: 111.132, y: 0, z: -92.85 },
    height: 10,
    width: 0.607,
    length: 6.861,
  },
  {
    shape: "box",
    mapPosition: { x: 109.434, y: 0, z: -84.042 },
    height: 10,
    width: 0.923,
    length: 0.35,
  },
  {
    shape: "box",
    mapPosition: { x: 109.701, y: 0, z: -83.691 },
    height: 10,
    width: 0.637,
    length: 0.417,
  },
  {
    shape: "box",
    mapPosition: { x: 109.912, y: 0, z: -83.362 },
    height: 10,
    width: 0.505,
    length: 0.242,
  },
  {
    shape: "box",
    mapPosition: { x: 126.584, y: 0, z: -98.552 },
    height: 10,
    width: 0.767,
    length: 0.724,
  },
  {
    shape: "box",
    mapPosition: { x: 127.033, y: 0, z: -98.004 },
    height: 10,
    width: 0.33,
    length: 0.417,
  },
  {
    shape: "box",
    mapPosition: { x: 95.126, y: 0, z: -112.636 },
    height: 10,
    width: 0.352,
    length: 0.286,
  },
  {
    shape: "box",
    mapPosition: { x: 83.931, y: 0, z: -105.052 },
    height: 10,
    width: 0.242,
    length: 0.154,
  },
  {
    shape: "box",
    mapPosition: { x: 97.138, y: 0, z: -83.483 },
    height: 10,
    width: 0.242,
    length: 0.483,
  },
  {
    shape: "box",
    mapPosition: { x: 131.881, y: 0, z: -113.724 },
    height: 10,
    width: 5.836,
    length: 5.457,
  },
  {
    shape: "box",
    mapPosition: { x: 135.448, y: 0, z: -113.734 },
    height: 10,
    width: 1.538,
    length: 0.57,
  },
  {
    shape: "box",
    mapPosition: { x: 138.871, y: 0, z: -113.723 },
    height: 10,
    width: 5.702,
    length: 6.425,
  },
  {
    shape: "box",
    mapPosition: { x: 139.904, y: 0, z: -109.386 },
    height: 10,
    width: 0.732,
    length: 0.911,
  },
  {
    shape: "box",
    mapPosition: { x: 140.206, y: 0, z: -108.799 },
    height: 10,
    width: 0.355,
    length: 0.51,
  },
  {
    shape: "box",
    mapPosition: { x: 141.451, y: 0, z: -121.23 },
    height: 10,
    width: 0.713,
    length: 9.982,
  },
  {
    shape: "box",
    mapPosition: { x: 142.526, y: 0, z: -126.497 },
    height: 10,
    width: 0.549,
    length: 0.571,
  },
  {
    shape: "box",
    mapPosition: { x: 143.329, y: 0, z: -127.35 },
    height: 10,
    width: 0.615,
    length: 0.703,
  },
  {
    shape: "box",
    mapPosition: { x: 146.427, y: 0, z: -116.556 },
    height: 10,
    width: 2.088,
    length: 12.038,
  },
  {
    shape: "box",
    mapPosition: { x: 153.855, y: 0, z: -111.803 },
    height: 10,
    width: 3.884,
    length: 0.323,
  },
  {
    shape: "box",
    mapPosition: { x: 154.515, y: 0, z: -122.002 },
    height: 10,
    width: 3.739,
    length: 3.585,
  },
  {
    shape: "box",
    mapPosition: { x: 167.156, y: 0, z: -123.088 },
    height: 10,
    width: 14.71,
    length: 3.288,
  },
  {
    shape: "box",
    mapPosition: { x: 159.174, y: 0, z: -125.946 },
    height: 10,
    width: 0.901,
    length: 0.416,
  },
  {
    shape: "box",
    mapPosition: { x: 159.766, y: 0, z: -126.273 },
    height: 10,
    width: 0.373,
    length: 0.488,
  },
  {
    shape: "box",
    mapPosition: { x: 154.692, y: 0, z: -116.59 },
    height: 10,
    width: 3.956,
    length: 5.803,
  },
  {
    shape: "box",
    mapPosition: { x: 160.971, y: 0, z: -114.39 },
    height: 10,
    width: 0.536,
    length: 5.062,
  },
  {
    shape: "box",
    mapPosition: { x: 165.486, y: 0, z: -110.527 },
    height: 10,
    width: 6.54,
    length: 0.622,
  },
  {
    shape: "box",
    mapPosition: { x: 165.546, y: 0, z: -114.821 },
    height: 10,
    width: 4.656,
    length: 4.607,
  },
  {
    shape: "box",
    mapPosition: { x: 170.938, y: 0, z: -114.93 },
    height: 10,
    width: 4.622,
    length: 4.54,
  },
  {
    shape: "box",
    mapPosition: { x: 174.203, y: 0, z: -114.79 },
    height: 10,
    width: 0.229,
    length: 5.83,
  },
  {
    shape: "box",
    mapPosition: { x: 174.031, y: 0, z: -108.897 },
    height: 10,
    width: 0.395,
    length: 0.776,
  },
  {
    shape: "box",
    mapPosition: { x: 174.528, y: 0, z: -109.172 },
    height: 10,
    width: 0.643,
    length: 0.2,
  },
  {
    shape: "box",
    mapPosition: { x: 153.413, y: 0, z: -106.585 },
    height: 10,
    width: 3.872,
    length: 0.351,
  },
  {
    shape: "box",
    mapPosition: { x: 151.549, y: 0, z: -105.049 },
    height: 10,
    width: 0.218,
    length: 2.224,
  },
  {
    shape: "box",
    mapPosition: { x: 155.95, y: 0, z: -105.013 },
    height: 10,
    width: 0.989,
    length: 0.637,
  },
  {
    shape: "box",
    mapPosition: { x: 162.36, y: 0, z: -104.58 },
    height: 10,
    width: 0.637,
    length: 3.444,
  },
  {
    shape: "box",
    mapPosition: { x: 146.401, y: 0, z: -103.538 },
    height: 10,
    width: 2.051,
    length: 5.537,
  },
  {
    shape: "box",
    mapPosition: { x: 146.39, y: 0, z: -99.94 },
    height: 10,
    width: 2.263,
    length: 0.668,
  },
  {
    shape: "box",
    mapPosition: { x: 150.214, y: 0, z: -96.671 },
    height: 10,
    width: 0.543,
    length: 2.963,
  },
  {
    shape: "box",
    mapPosition: { x: 147.691, y: 0, z: -97.421 },
    height: 10,
    width: 2.937,
    length: 2.445,
  },
  {
    shape: "box",
    mapPosition: { x: 155.735, y: 0, z: -98.937 },
    height: 10,
    width: 2.881,
    length: 5.308,
  },
  {
    shape: "box",
    mapPosition: { x: 155.635, y: 0, z: -95.122 },
    height: 10,
    width: 1.341,
    length: 0.655,
  },
  {
    shape: "box",
    mapPosition: { x: 166.535, y: 0, z: -105.162 },
    height: 10,
    width: 3.621,
    length: 3.178,
  },
  {
    shape: "box",
    mapPosition: { x: 172.182, y: 0, z: -104.452 },
    height: 10,
    width: 3.921,
    length: 5.793,
  },
  {
    shape: "box",
    mapPosition: { x: 171.513, y: 0, z: -99.236 },
    height: 10,
    width: 5.82,
    length: 3.182,
  },
  {
    shape: "box",
    mapPosition: { x: 174.478, y: 0, z: -96.504 },
    height: 10,
    width: 0.22,
    length: 0.374,
  },
  {
    shape: "box",
    mapPosition: { x: 179.133, y: 0, z: -88.844 },
    height: 10,
    width: 0.308,
    length: 0.439,
  },
  {
    shape: "box",
    mapPosition: { x: 171.059, y: 0, z: -91.913 },
    height: 10,
    width: 4.327,
    length: 2.422,
  },
  {
    shape: "box",
    mapPosition: { x: 174.319, y: 0, z: -92.572 },
    height: 10,
    width: 0.373,
    length: 0.857,
  },
  {
    shape: "box",
    mapPosition: { x: 170.433, y: 0, z: -85.488 },
    height: 10,
    width: 5.625,
    length: 2.813,
  },
  {
    shape: "box",
    mapPosition: { x: 156.464, y: 0, z: -91.512 },
    height: 10,
    width: 4.505,
    length: 2.483,
  },
  {
    shape: "box",
    mapPosition: { x: 157.386, y: 0, z: -91.516 },
    height: 10,
    width: 3.238,
    length: 2.632,
  },
  {
    shape: "box",
    mapPosition: { x: 160.587, y: 0, z: -91.793 },
    height: 10,
    width: 2.704,
    length: 2.18,
  },
  {
    shape: "box",
    mapPosition: { x: 162.766, y: 0, z: -97.25 },
    height: 10,
    width: 2.748,
    length: 0.852,
  },
  {
    shape: "box",
    mapPosition: { x: 160.977, y: 0, z: -95.123 },
    height: 10,
    width: 0.482,
    length: 1.02,
  },
  {
    shape: "box",
    mapPosition: { x: 148.152, y: 0, z: -88.258 },
    height: 10,
    width: 3.238,
    length: 3.092,
  },
  {
    shape: "box",
    mapPosition: { x: 147.64, y: 0, z: -90.748 },
    height: 10,
    width: 2.733,
    length: 0.491,
  },
  {
    shape: "box",
    mapPosition: { x: 148.763, y: 0, z: -84.632 },
    height: 10,
    width: 2.942,
    length: 0.617,
  },
  {
    shape: "box",
    mapPosition: { x: 154.274, y: 0, z: -86.19 },
    height: 10,
    width: 0.498,
    length: 4.752,
  },
  {
    shape: "box",
    mapPosition: { x: 158.399, y: 0, z: -87.39 },
    height: 10,
    width: 4.662,
    length: 3.301,
  },
  {
    shape: "box",
    mapPosition: { x: 161.313, y: 0, z: -86.441 },
    height: 10,
    width: 0.094,
    length: 5.244,
  },
  {
    shape: "box",
    mapPosition: { x: 166.094, y: 0, z: -85.194 },
    height: 10,
    width: 0.16,
    length: 3.46,
  },
  {
    shape: "box",
    mapPosition: { x: 166.628, y: 0, z: -101.436 },
    height: 10,
    width: 2.407,
    length: 0.914,
  },
  {
    shape: "box",
    mapPosition: { x: 162.239, y: 0, z: -79.821 },
    height: 10,
    width: 0.51,
    length: 0.952,
  },
  {
    shape: "box",
    mapPosition: { x: 165.632, y: 0, z: -78.429 },
    height: 10,
    width: 6.076,
    length: 1.134,
  },
  {
    shape: "box",
    mapPosition: { x: 168.257, y: 0, z: -75.261 },
    height: 10,
    width: 0.768,
    length: 7.636,
  },
  {
    shape: "box",
    mapPosition: { x: 167.046, y: 0, z: -72.045 },
    height: 10,
    width: 3.498,
    length: 0.982,
  },
  {
    shape: "box",
    mapPosition: { x: 165.848, y: 0, z: -68.24 },
    height: 10,
    width: 1.148,
    length: 8.374,
  },
  {
    shape: "box",
    mapPosition: { x: 167.325, y: 0, z: -64.402 },
    height: 10,
    width: 3.579,
    length: 0.587,
  },
  {
    shape: "box",
    mapPosition: { x: 168.662, y: 0, z: -60.4 },
    height: 10,
    width: 0.969,
    length: 8.858,
  },
  {
    shape: "box",
    mapPosition: { x: 165.661, y: 0, z: -56.425 },
    height: 10,
    width: 7.279,
    length: 1.171,
  },
  {
    shape: "box",
    mapPosition: { x: 162.595, y: 0, z: -53.672 },
    height: 10,
    width: 1.19,
    length: 6.678,
  },
  {
    shape: "box",
    mapPosition: { x: 158.882, y: 0, z: -50.732 },
    height: 10,
    width: 8.616,
    length: 0.974,
  },
  {
    shape: "box",
    mapPosition: { x: 155.141, y: 0, z: -53.594 },
    height: 10,
    width: 0.949,
    length: 6.948,
  },
  {
    shape: "box",
    mapPosition: { x: 151.917, y: 0, z: -56.572 },
    height: 10,
    width: 7.118,
    length: 1.085,
  },
  {
    shape: "box",
    mapPosition: { x: 149.044, y: 0, z: -60.914 },
    height: 10,
    width: 0.649,
    length: 9.356,
  },
  {
    shape: "box",
    mapPosition: { x: 149.936, y: 0, z: -68.646 },
    height: 10,
    width: 0.859,
    length: 7.179,
  },
  {
    shape: "box",
    mapPosition: { x: 150.869, y: 0, z: -71.876 },
    height: 10,
    width: 3.079,
    length: 0.784,
  },
  {
    shape: "box",
    mapPosition: { x: 151.985, y: 0, z: -75.124 },
    height: 10,
    width: 0.98,
    length: 7.5,
  },
  {
    shape: "box",
    mapPosition: { x: 154.17, y: 0, z: -78.805 },
    height: 10,
    width: 5.219,
    length: 0.758,
  },
  {
    shape: "box",
    mapPosition: { x: 165.342, y: 0, z: -75.325 },
    height: 10,
    width: 3.761,
    length: 4.678,
  },
  {
    shape: "box",
    mapPosition: { x: 154.576, y: 0, z: -75.354 },
    height: 10,
    width: 4.246,
    length: 5.503,
  },
  {
    shape: "box",
    mapPosition: { x: 152.163, y: 0, z: -68.358 },
    height: 10,
    width: 3.939,
    length: 4.871,
  },
  {
    shape: "box",
    mapPosition: { x: 151.884, y: 0, z: -61.112 },
    height: 10,
    width: 4.205,
    length: 5.444,
  },
  {
    shape: "box",
    mapPosition: { x: 158.911, y: 0, z: -54.244 },
    height: 10,
    width: 4.981,
    length: 3.955,
  },
  {
    shape: "box",
    mapPosition: { x: 166.027, y: 0, z: -60.696 },
    height: 10,
    width: 3.531,
    length: 5.544,
  },
  {
    shape: "box",
    mapPosition: { x: 163.152, y: 0, z: -68.303 },
    height: 10,
    width: 3.976,
    length: 5.481,
  },
  {
    shape: "box",
    mapPosition: { x: 130.163, y: 0, z: -129.09 },
    height: 10,
    width: 9.422,
    length: 14.636,
  },
  {
    shape: "box",
    mapPosition: { x: 144.69, y: 0, z: -134.968 },
    height: 10,
    width: 1.033,
    length: 0.966,
  },
  {
    shape: "box",
    mapPosition: { x: 144.366, y: 0, z: -138.815 },
    height: 10,
    width: 5.238,
    length: 5.439,
  },
  {
    shape: "box",
    mapPosition: { x: 144.348, y: 0, z: -131.252 },
    height: 10,
    width: 5.341,
    length: 5.219,
  },
  {
    shape: "box",
    mapPosition: { x: 120.513, y: 0, z: -144.231 },
    height: 10,
    width: 5.126,
    length: 5.22,
  },
  {
    shape: "box",
    mapPosition: { x: 124.653, y: 0, z: -146.857 },
    height: 10,
    width: 0.067,
    length: 0.089,
  },
  {
    shape: "box",
    mapPosition: { x: 127.324, y: 0, z: -144.094 },
    height: 10,
    width: 5.409,
    length: 5.616,
  },
  {
    shape: "box",
    mapPosition: { x: 137.416, y: 0, z: -140.98 },
    height: 10,
    width: 7.375,
    length: 0.488,
  },
  {
    shape: "box",
    mapPosition: { x: 132.617, y: 0, z: -141.597 },
    height: 10,
    width: 0.637,
    length: 0.549,
  },
  {
    shape: "box",
    mapPosition: { x: 131.544, y: 0, z: -142.152 },
    height: 10,
    width: 0.549,
    length: 0.549,
  },
  {
    shape: "box",
    mapPosition: { x: 130.428, y: 0, z: -142.508 },
    height: 10,
    width: 0.483,
    length: 0.505,
  },
  {
    shape: "box",
    mapPosition: { x: 148.693, y: 0, z: -139.36 },
    height: 10,
    width: 0.466,
    length: 0.71,
  },
  {
    shape: "box",
    mapPosition: { x: 149.018, y: 0, z: -139.887 },
    height: 10,
    width: 0.266,
    length: 0.598,
  },
  {
    shape: "box",
    mapPosition: { x: 141.776, y: 0, z: -146.05 },
    height: 10,
    width: 11.972,
    length: 2.161,
  },
  {
    shape: "box",
    mapPosition: { x: 134.426, y: 0, z: -147.023 },
    height: 10,
    width: 1.133,
    length: 0.532,
  },
  {
    shape: "box",
    mapPosition: { x: 155.077, y: 0, z: -146.257 },
    height: 10,
    width: 6.823,
    length: 2.289,
  },
  {
    shape: "box",
    mapPosition: { x: 161.525, y: 0, z: -147.608 },
    height: 10,
    width: 2.343,
    length: 2.695,
  },
  {
    shape: "box",
    mapPosition: { x: 170.996, y: 0, z: -148.112 },
    height: 10,
    width: 2.97,
    length: 3.249,
  },
  {
    shape: "box",
    mapPosition: { x: 167.427, y: 0, z: -147.271 },
    height: 10,
    width: 0.428,
    length: 2.978,
  },
  {
    shape: "box",
    mapPosition: { x: 173.49, y: 0, z: -148.455 },
    height: 10,
    width: 0.112,
    length: 2.77,
  },
  {
    shape: "box",
    mapPosition: { x: 171.971, y: 0, z: -153.895 },
    height: 10,
    width: 4.636,
    length: 0.498,
  },
  {
    shape: "box",
    mapPosition: { x: 167.525, y: 0, z: -154.919 },
    height: 10,
    width: 2.395,
    length: 1.637,
  },
  {
    shape: "box",
    mapPosition: { x: 167.312, y: 0, z: -157.449 },
    height: 10,
    width: 2.708,
    length: 2.377,
  },
  {
    shape: "box",
    mapPosition: { x: 167.304, y: 0, z: -160.154 },
    height: 10,
    width: 2.137,
    length: 3.017,
  },
  {
    shape: "box",
    mapPosition: { x: 171.722, y: 0, z: -158.061 },
    height: 10,
    width: 2.857,
    length: 4.62,
  },
  {
    shape: "box",
    mapPosition: { x: 171.695, y: 0, z: -161.176 },
    height: 10,
    width: 4.852,
    length: 0.798,
  },
  {
    shape: "box",
    mapPosition: { x: 160.85, y: 0, z: -163.31 },
    height: 10,
    width: 0.353,
    length: 0.868,
  },
  {
    shape: "box",
    mapPosition: { x: 160.964, y: 0, z: -161.192 },
    height: 10,
    width: 0.837,
    length: 1.111,
  },
  {
    shape: "box",
    mapPosition: { x: 162.743, y: 0, z: -160.674 },
    height: 10,
    width: 0.597,
    length: 0.76,
  },
  {
    shape: "box",
    mapPosition: { x: 163.952, y: 0, z: -161.313 },
    height: 10,
    width: 0.769,
    length: 0.483,
  },
  {
    shape: "box",
    mapPosition: { x: 161.568, y: 0, z: -164.722 },
    height: 10,
    width: 0.242,
    length: 0.308,
  },
  {
    shape: "box",
    mapPosition: { x: 162.724, y: 0, z: -155.425 },
    height: 10,
    width: 0.614,
    length: 1.283,
  },
  {
    shape: "box",
    mapPosition: { x: 159.073, y: 0, z: -155.416 },
    height: 10,
    width: 5.272,
    length: 2.786,
  },
  {
    shape: "box",
    mapPosition: { x: 155.974, y: 0, z: -150.75 },
    height: 10,
    width: 0.286,
    length: 0.395,
  },
  {
    shape: "box",
    mapPosition: { x: 152.767, y: 0, z: -151.594 },
    height: 10,
    width: 2.604,
    length: 0.614,
  },
  {
    shape: "box",
    mapPosition: { x: 152.147, y: 0, z: -153.917 },
    height: 10,
    width: 0.637,
    length: 0.659,
  },
  {
    shape: "box",
    mapPosition: { x: 153.149, y: 0, z: -155.676 },
    height: 10,
    width: 0.516,
    length: 0.888,
  },
  {
    shape: "box",
    mapPosition: { x: 151.382, y: 0, z: -154.755 },
    height: 10,
    width: 0.308,
    length: 0.176,
  },
  {
    shape: "box",
    mapPosition: { x: 145.923, y: 0, z: -153.375 },
    height: 10,
    width: 0.477,
    length: 4.38,
  },
  {
    shape: "box",
    mapPosition: { x: 144.06, y: 0, z: -154.47 },
    height: 10,
    width: 2.52,
    length: 3.434,
  },
  {
    shape: "box",
    mapPosition: { x: 141.186, y: 0, z: -154.253 },
    height: 10,
    width: 3.675,
    length: 3.749,
  },
  {
    shape: "box",
    mapPosition: { x: 136.948, y: 0, z: -154.174 },
    height: 10,
    width: 3.378,
    length: 3.719,
  },
  {
    shape: "box",
    mapPosition: { x: 131.521, y: 0, z: -159.468 },
    height: 10,
    width: 0.791,
    length: 0.725,
  },
  {
    shape: "box",
    mapPosition: { x: 131.945, y: 0, z: -159.051 },
    height: 10,
    width: 0.439,
    length: 0.527,
  },
  {
    shape: "box",
    mapPosition: { x: 134.793, y: 0, z: -166.477 },
    height: 10,
    width: 3.383,
    length: 16.172,
  },
  {
    shape: "box",
    mapPosition: { x: 137.278, y: 0, z: -158.662 },
    height: 10,
    width: 1.163,
    length: 1.13,
  },
  {
    shape: "box",
    mapPosition: { x: 143.419, y: 0, z: -160.849 },
    height: 10,
    width: 4.906,
    length: 0.603,
  },
  {
    shape: "box",
    mapPosition: { x: 144.878, y: 0, z: -158.663 },
    height: 10,
    width: 0.615,
    length: 1.318,
  },
  {
    shape: "box",
    mapPosition: { x: 147.484, y: 0, z: -165.075 },
    height: 10,
    width: 0.585,
    length: 6.698,
  },
  {
    shape: "box",
    mapPosition: { x: 144.034, y: 0, z: -165.021 },
    height: 10,
    width: 4.782,
    length: 4.638,
  },
  {
    shape: "box",
    mapPosition: { x: 143.97, y: 0, z: -170.562 },
    height: 10,
    width: 4.516,
    length: 4.666,
  },
  {
    shape: "box",
    mapPosition: { x: 143.622, y: 0, z: -173.927 },
    height: 10,
    width: 4.609,
    length: 0.518,
  },
  {
    shape: "box",
    mapPosition: { x: 148.775, y: 0, z: -174.148 },
    height: 10,
    width: 0.901,
    length: 0.615,
  },
  {
    shape: "box",
    mapPosition: { x: 148.914, y: 0, z: -173.547 },
    height: 10,
    width: 0.133,
    length: 0.731,
  },
  {
    shape: "box",
    mapPosition: { x: 140.645, y: 0, z: -178.849 },
    height: 10,
    width: 0.308,
    length: 0.176,
  },
  {
    shape: "box",
    mapPosition: { x: 140.466, y: 0, z: -174.08 },
    height: 10,
    width: 0.308,
    length: 0.308,
  },
  {
    shape: "box",
    mapPosition: { x: 154.451, y: 0, z: -172.154 },
    height: 10,
    width: 6.08,
    length: 3.966,
  },
  {
    shape: "box",
    mapPosition: { x: 159.38, y: 0, z: -171.29 },
    height: 10,
    width: 3.362,
    length: 5.891,
  },
  {
    shape: "box",
    mapPosition: { x: 153.584, y: 0, z: -166.202 },
    height: 10,
    width: 3.406,
    length: 3.486,
  },
  {
    shape: "box",
    mapPosition: { x: 157.374, y: 0, z: -167.116 },
    height: 10,
    width: 2.316,
    length: 0.185,
  },
  {
    shape: "box",
    mapPosition: { x: 153.234, y: 0, z: -162.05 },
    height: 10,
    width: 3.042,
    length: 0.672,
  },
  {
    shape: "box",
    mapPosition: { x: 166.028, y: 0, z: -170.821 },
    height: 10,
    width: 2.272,
    length: 4.486,
  },
  {
    shape: "box",
    mapPosition: { x: 165.246, y: 0, z: -174.125 },
    height: 10,
    width: 0.527,
    length: 0.461,
  },
  {
    shape: "box",
    mapPosition: { x: 168.993, y: 0, z: -178.824 },
    height: 10,
    width: 0.286,
    length: 0.308,
  },
  {
    shape: "box",
    mapPosition: { x: 172.436, y: 0, z: -173.981 },
    height: 10,
    width: 2.864,
    length: 0.716,
  },
  {
    shape: "box",
    mapPosition: { x: 173.668, y: 0, z: -170.111 },
    height: 10,
    width: 3.739,
    length: 5.828,
  },
  {
    shape: "box",
    mapPosition: { x: 172.678, y: 0, z: -165.872 },
    height: 10,
    width: 3.168,
    length: 0.645,
  },
  {
    shape: "box",
    mapPosition: { x: 178.308, y: 0, z: -164.817 },
    height: 10,
    width: 0.154,
    length: 0.264,
  },
  {
    shape: "box",
    mapPosition: { x: 178.346, y: 0, z: -162.548 },
    height: 10,
    width: 0.198,
    length: 0.242,
  },
  {
    shape: "box",
    mapPosition: { x: 175.962, y: 0, z: -162.541 },
    height: 10,
    width: 0.154,
    length: 0.088,
  },
  {
    shape: "box",
    mapPosition: { x: 177.527, y: 0, z: -162.064 },
    height: 10,
    width: 0.483,
    length: 0.791,
  },
  {
    shape: "box",
    mapPosition: { x: 178.007, y: 0, z: -161.782 },
    height: 10,
    width: 0.31,
    length: 0.62,
  },
  {
    shape: "box",
    mapPosition: { x: 179.414, y: 0, z: -165.316 },
    height: 10,
    width: 0.793,
    length: 5.982,
  },
  {
    shape: "box",
    mapPosition: { x: 182.591, y: 0, z: -167.922 },
    height: 10,
    width: 7.148,
    length: 0.947,
  },
  {
    shape: "box",
    mapPosition: { x: 185.887, y: 0, z: -166.706 },
    height: 10,
    width: 1.127,
    length: 3.126,
  },
  {
    shape: "box",
    mapPosition: { x: 189.667, y: 0, z: -165.505 },
    height: 10,
    width: 8.107,
    length: 0.977,
  },
  {
    shape: "box",
    mapPosition: { x: 193.487, y: 0, z: -167.13 },
    height: 10,
    width: 0.773,
    length: 3.285,
  },
  {
    shape: "box",
    mapPosition: { x: 197.459, y: 0, z: -168.29 },
    height: 10,
    width: 8.703,
    length: 0.916,
  },
  {
    shape: "box",
    mapPosition: { x: 201.454, y: 0, z: -165.342 },
    height: 10,
    width: 0.861,
    length: 7.046,
  },
  {
    shape: "box",
    mapPosition: { x: 204.23, y: 0, z: -162.27 },
    height: 10,
    width: 6.501,
    length: 0.946,
  },
  {
    shape: "box",
    mapPosition: { x: 207.054, y: 0, z: -158.602 },
    height: 10,
    width: 1.069,
    length: 8.52,
  },
  {
    shape: "box",
    mapPosition: { x: 204.149, y: 0, z: -154.724 },
    height: 10,
    width: 6.693,
    length: 0.649,
  },
  {
    shape: "box",
    mapPosition: { x: 201.131, y: 0, z: -151.769 },
    height: 10,
    width: 1.057,
    length: 6.915,
  },
  {
    shape: "box",
    mapPosition: { x: 196.965, y: 0, z: -148.744 },
    height: 10,
    width: 9.341,
    length: 1.043,
  },
  {
    shape: "box",
    mapPosition: { x: 189.158, y: 0, z: -149.575 },
    height: 10,
    width: 7.328,
    length: 0.751,
  },
  {
    shape: "box",
    mapPosition: { x: 178.892, y: 0, z: -153.809 },
    height: 10,
    width: 0.803,
    length: 5.439,
  },
  {
    shape: "box",
    mapPosition: { x: 182.503, y: 0, z: -151.469 },
    height: 10,
    width: 7.7,
    length: 0.896,
  },
  {
    shape: "box",
    mapPosition: { x: 185.944, y: 0, z: -150.406 },
    height: 10,
    width: 0.559,
    length: 2.711,
  },
  {
    shape: "box",
    mapPosition: { x: 182.581, y: 0, z: -165.302 },
    height: 10,
    width: 4.729,
    length: 3.152,
  },
  {
    shape: "box",
    mapPosition: { x: 189.508, y: 0, z: -162.505 },
    height: 10,
    width: 5.63,
    length: 3.852,
  },
  {
    shape: "box",
    mapPosition: { x: 196.726, y: 0, z: -158.479 },
    height: 10,
    width: 1.318,
    length: 1.538,
  },
  {
    shape: "box",
    mapPosition: { x: 197.197, y: 0, z: -165.421 },
    height: 10,
    width: 5.059,
    length: 3.94,
  },
  {
    shape: "box",
    mapPosition: { x: 203.797, y: 0, z: -158.518 },
    height: 10,
    width: 3.936,
    length: 5.023,
  },
  {
    shape: "box",
    mapPosition: { x: 196.76, y: 0, z: -151.606 },
    height: 10,
    width: 4.962,
    length: 3.735,
  },
  {
    shape: "box",
    mapPosition: { x: 189.279, y: 0, z: -151.911 },
    height: 10,
    width: 4.897,
    length: 3.13,
  },
  {
    shape: "box",
    mapPosition: { x: 182.646, y: 0, z: -154.363 },
    height: 10,
    width: 5.617,
    length: 3.948,
  },
  {
    shape: "box",
    mapPosition: { x: 165.281, y: 0, z: -152.936 },
    height: 10,
    width: 0.648,
    length: 0.8,
  },
  {
    shape: "box",
    mapPosition: { x: 161.13, y: 0, z: -150.311 },
    height: 10,
    width: 3.047,
    length: 0.561,
  },
  {
    shape: "box",
    mapPosition: { x: 163.368, y: 0, z: -145.156 },
    height: 10,
    width: 0.374,
    length: 0.264,
  },
  {
    shape: "box",
    mapPosition: { x: 144.016, y: 0, z: -179.54 },
    height: 10,
    width: 74.421,
    length: 1.299,
  },
  {
    shape: "box",
    mapPosition: { x: 181.105, y: 0, z: -173.941 },
    height: 10,
    width: 0.766,
    length: 11.516,
  },
  {
    shape: "box",
    mapPosition: { x: 181.314, y: 0, z: -113.433 },
    height: 10,
    width: 1.107,
    length: 75.64,
  },
  {
    shape: "box",
    mapPosition: { x: 175.114, y: 0, z: -75.961 },
    height: 10,
    width: 13.394,
    length: 1.722,
  },
  {
    shape: "box",
    mapPosition: { x: 114.625, y: 0, z: -76.442 },
    height: 10,
    width: 74.52,
    length: 0.608,
  },
  {
    shape: "box",
    mapPosition: { x: 77.867, y: 0, z: -82.824 },
    height: 10,
    width: 1.194,
    length: 14.307,
  },
  {
    shape: "box",
    mapPosition: { x: 77.123, y: 0, z: -143.238 },
    height: 10,
    width: 1.044,
    length: 75.043,
  },
  {
    shape: "box",
    mapPosition: { x: 83.564, y: 0, z: -180.229 },
    height: 10,
    width: 13.662,
    length: 0.841,
  },
  {
    shape: "box",
    mapPosition: { x: 89.575, y: 0, z: -78.809 },
    height: 10,
    width: 0.417,
    length: 0.242,
  },
  {
    shape: "box",
    mapPosition: { x: 80.2, y: 0, z: -95.045 },
    height: 10,
    width: 0.195,
    length: 0.137,
  },
  {
    shape: "box",
    mapPosition: { x: 80.208, y: 0, z: -92.815 },
    height: 10,
    width: 0.117,
    length: 0.146,
  },
  {
    shape: "box",
    mapPosition: { x: 82.474, y: 0, z: -95.04 },
    height: 10,
    width: 0.156,
    length: 0.137,
  },
];

type ChunkShape = {
  type: "Box";
  position: Triplet;
  args: Triplet;
};

type DebugBox = {
  position: Triplet;
  size: Triplet;
};

type ChunkData = {
  key: string;
  cellX: number;
  cellZ: number;
  shapes: ChunkShape[];
  debugBoxes: DebugBox[];
};

const CHUNK_SIZE = 30;
const CHUNK_RADIUS = 1;
const MAX_CHUNKS_PER_FRAME = 1;

const STATIC_COLLIDER_CHUNKS: ReadonlyMap<string, ChunkData> = (() => {
  const buckets = new Map<string, ChunkData>();

  const getBucket = (cellX: number, cellZ: number, key: string) => {
    const existing = buckets.get(key);
    if (existing) return existing;
    const created: ChunkData = {
      key,
      cellX,
      cellZ,
      shapes: [],
      debugBoxes: [],
    };
    buckets.set(key, created);
    return created;
  };

  for (const collider of STATIC_COLLIDERS) {
    const {
      mapPosition: { x, y, z },
    } = collider;
    const cellX = Math.floor(x / CHUNK_SIZE);
    const cellZ = Math.floor(z / CHUNK_SIZE);
    const key = `${cellX},${cellZ}`;
    const bucket = getBucket(cellX, cellZ, key);

    const width =
      collider.shape === "box" ? collider.width : collider.radiusX * 2;
    const length =
      collider.shape === "box" ? collider.length : collider.radiusZ * 2;
    const height = collider.height;

    const position: Triplet = [x, y, z];
    const size: Triplet = [width, height, length];

    bucket.shapes.push({
      type: "Box",
      position,
      args: size,
    });

    bucket.debugBoxes.push({
      position,
      size,
    });
  }

  buckets.forEach((bucket, key) => {
    bucket.shapes = bucket.shapes.map((shape) => ({
      type: shape.type,
      position: [...shape.position] as Triplet,
      args: [...shape.args] as Triplet,
    }));
    bucket.debugBoxes = bucket.debugBoxes.map((box) => ({
      position: [...box.position] as Triplet,
      size: [...box.size] as Triplet,
    }));
    buckets.set(key, bucket);
  });

  return buckets;
})();

const SPAWN_POINT = CITY_SPAWN_POINTS[CITY_ID];
const INITIAL_CELL_X = Math.floor(SPAWN_POINT[0] / CHUNK_SIZE);
const INITIAL_CELL_Z = Math.floor(SPAWN_POINT[2] / CHUNK_SIZE);

function collectChunks(centerCellX: number, centerCellZ: number): ChunkData[] {
  const result: ChunkData[] = [];
  for (let dz = -CHUNK_RADIUS; dz <= CHUNK_RADIUS; dz += 1) {
    for (let dx = -CHUNK_RADIUS; dx <= CHUNK_RADIUS; dx += 1) {
      const key = `${centerCellX + dx},${centerCellZ + dz}`;
      const chunk = STATIC_COLLIDER_CHUNKS.get(key);
      if (!chunk) continue;
      result.push(chunk);
    }
  }
  return result;
}

type ChunkColliderProps = {
  chunk: ChunkData;
  debug?: boolean;
  cityOffset: Triplet;
};

function ChunkCollider({ chunk, debug, cityOffset }: ChunkColliderProps) {
  const [ref] = useCompoundBody(
    () => ({
      type: "Static",
      allowSleep: true,
      shapes: chunk.shapes as unknown as CompoundBodyProps["shapes"],
    }),
    undefined,
    [chunk]
  );

  return (
    <group ref={ref} name={`City2ColliderChunk-${chunk.key}`}>
      {debug
        ? chunk.debugBoxes.map((box, index) => (
            <mesh
              key={`${chunk.key}-debug-${index}`}
              position={[
                box.position[0] - cityOffset[0],
                box.position[1] - cityOffset[1],
                box.position[2] - cityOffset[2],
              ]}
            >
              <boxGeometry args={box.size} />
              <meshBasicMaterial color="orange" transparent opacity={0.3} />
            </mesh>
          ))
        : null}
    </group>
  );
}

export function City2Colliders({
  debug,
  playerPositionRef,
  cityOffset,
  ...groupProps
}: CityCollidersProps) {
  const offset: Triplet = [
    cityOffset?.[0] ?? 0,
    cityOffset?.[1] ?? 0,
    cityOffset?.[2] ?? 0,
  ];
  const { getCollidersForCity } = useColliderPainter();
  const dynamicColliders = getCollidersForCity(CITY_ID);
  const initialChunks = useMemo(
    () => collectChunks(INITIAL_CELL_X, INITIAL_CELL_Z),
    []
  );
  const [chunkVersion, setChunkVersion] = useState(0);
  const visibleChunkKeysRef = useRef(
    new Set(initialChunks.map((chunk) => chunk.key))
  );
  const targetChunkKeysRef = useRef(new Set(visibleChunkKeysRef.current));
  const currentCellRef = useRef<{ x: number; z: number }>({
    x: INITIAL_CELL_X,
    z: INITIAL_CELL_Z,
  });
  const pendingAdditionsRef = useRef<string[]>([]);
  const pendingRemovalsRef = useRef<string[]>([]);

  const visibleChunks = useMemo(() => {
    const chunks: ChunkData[] = [];
    for (const key of visibleChunkKeysRef.current) {
      const chunk = STATIC_COLLIDER_CHUNKS.get(key);
      if (chunk) chunks.push(chunk);
    }
    chunks.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
    return chunks;
  }, [chunkVersion]);

  useFrame(() => {
    const position = playerPositionRef.current;
    if (!position) return;
    if (!Number.isFinite(position.x) || !Number.isFinite(position.z)) return;

    const cellX = Math.floor(position.x / CHUNK_SIZE);
    const cellZ = Math.floor(position.z / CHUNK_SIZE);

    const current = currentCellRef.current;
    if (current.x === cellX && current.z === cellZ) return;

    currentCellRef.current = { x: cellX, z: cellZ };
    const nextChunks = collectChunks(cellX, cellZ);
    const nextKeys = new Set(nextChunks.map((chunk) => chunk.key));
    targetChunkKeysRef.current = nextKeys;

    const visibleKeys = visibleChunkKeysRef.current;
    const additions: string[] = [];
    for (const key of nextKeys) {
      if (!visibleKeys.has(key)) additions.push(key);
    }

    const removals: string[] = [];
    for (const key of visibleKeys) {
      if (!nextKeys.has(key)) removals.push(key);
    }

    const additionsQueue = pendingAdditionsRef.current;
    const removalsQueue = pendingRemovalsRef.current;

    for (const key of additions) {
      if (!additionsQueue.includes(key)) {
        additionsQueue.push(key);
      }
      const removalIndex = removalsQueue.indexOf(key);
      if (removalIndex >= 0) {
        removalsQueue.splice(removalIndex, 1);
      }
    }

    for (const key of removals) {
      if (!removalsQueue.includes(key) && !additionsQueue.includes(key)) {
        removalsQueue.push(key);
      }
    }
  });

  useFrame(() => {
    const visibleKeys = visibleChunkKeysRef.current;
    const targetKeys = targetChunkKeysRef.current;
    const additionsQueue = pendingAdditionsRef.current;
    const removalsQueue = pendingRemovalsRef.current;
    let changed = false;
    let processed = 0;

    while (additionsQueue.length > 0 && processed < MAX_CHUNKS_PER_FRAME) {
      const key = additionsQueue.shift();
      if (!key) break;
      if (!targetKeys.has(key)) continue;
      if (visibleKeys.has(key)) continue;
      visibleKeys.add(key);
      changed = true;
      processed += 1;
    }

    if (processed < MAX_CHUNKS_PER_FRAME && additionsQueue.length === 0) {
      while (removalsQueue.length > 0 && processed < MAX_CHUNKS_PER_FRAME) {
        const key = removalsQueue.shift();
        if (!key) break;
        if (targetKeys.has(key)) continue;
        if (!visibleKeys.delete(key)) continue;
        changed = true;
        processed += 1;
      }
    }

    if (changed) {
      setChunkVersion((previous) => (previous + 1) % Number.MAX_SAFE_INTEGER);
    }
  });

  const renderCollider = (collider: ColliderDescriptor, key: string) => {
    if (collider.shape === "box") {
      return (
        <ColliderBox
          key={key}
          mapPosition={collider.mapPosition}
          width={collider.width}
          height={collider.height}
          length={collider.length}
          debug={debug}
          renderOffset={{
            x: offset[0],
            y: offset[1],
            z: offset[2],
          }}
        />
      );
    }

    return (
      <ColliderCylinder
        key={key}
        mapPosition={collider.mapPosition}
        radiusX={collider.radiusX}
        radiusZ={collider.radiusZ}
        height={collider.height}
        segments={collider.segments}
        debug={debug}
        renderOffset={{
          x: offset[0],
          y: offset[1],
          z: offset[2],
        }}
      />
    );
  };

  return (
    <group name="City2Colliders" {...groupProps}>
      {visibleChunks.map((chunk) => (
        <ChunkCollider
          key={chunk.key}
          chunk={chunk}
          debug={debug}
          cityOffset={offset}
        />
      ))}
      {dynamicColliders.map((collider) =>
        renderCollider(collider, collider.id)
      )}
    </group>
  );
}
