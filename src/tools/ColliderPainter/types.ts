import type { CityId } from "../../constants/cities";

export type ColliderShape = "box" | "cylinder";

export type ColliderDescriptorBox = {
  shape: "box";
  mapPosition: { x: number; y: number; z: number };
  width: number;
  length: number;
  height: number;
};

export type ColliderDescriptorCylinder = {
  shape: "cylinder";
  mapPosition: { x: number; y: number; z: number };
  radiusX: number;
  radiusZ: number;
  height: number;
  segments: number;
};

export type ColliderDescriptor =
  | ColliderDescriptorBox
  | ColliderDescriptorCylinder;

export type ColliderRecord = ColliderDescriptor & {
  id: string;
  cityId: CityId;
  createdAt: number;
};

export type ColliderPreview = {
  shape: ColliderShape;
  mapPosition: { x: number; y: number; z: number };
  width?: number;
  length?: number;
  radiusX?: number;
  radiusZ?: number;
  height: number;
  segments?: number;
};
