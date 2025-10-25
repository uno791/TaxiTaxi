import type { ThreeElements } from "@react-three/fiber";
import { ColliderBox } from "../Taxi/ColliderBox";
import { ColliderCylinder } from "../Taxi/ColliderCylinder";
import {
  useColliderPainter,
  type ColliderDescriptor,
} from "../../tools/ColliderPainter";
import type { CityId } from "../../constants/cities";

export type CityCollidersProps = ThreeElements["group"] & { debug?: boolean };

const CITY_ID: CityId = "city3";
const STATIC_COLLIDERS: readonly ColliderDescriptor[] = [
  // Thin row near plaza
  {
    shape: "box",
    mapPosition: { x: 53, y: 0, z: -431 },
    width: 32,
    height: 10,
    length: 4,
  },
  // Thick row behind plaza
  {
    shape: "box",
    mapPosition: { x: 53, y: 0, z: -424 },
    width: 35.5,
    height: 10,
    length: 6,
  },
  {
    shape: "box",
    mapPosition: { x: 55, y: 0, z: -416 },
    width: 32,
    height: 10,
    length: 4,
  },
  {
    shape: "box",
    mapPosition: { x: 54, y: 0, z: -413.5 },
    width: 34,
    height: 10,
    length: 5,
  },
  {
    shape: "cylinder",
    mapPosition: { x: 50, y: 0, z: -470 },
    radiusX: 4,
    radiusZ: 4,
    height: 6,
    segments: 32,
  },
  {
    shape: "box",
    mapPosition: { x: 37, y: 0, z: -439 },
    width: 32,
    height: 10,
    length: 4,
  },
  {
    shape: "box",
    mapPosition: { x: 23, y: 0, z: -443 },
    width: 4,
    height: 10,
    length: 10,
  },
  {
    shape: "box",
    mapPosition: { x: 43.6, y: 0, z: -462 },
    width: 32,
    height: 10,
    length: 4,
  },
  {
    shape: "box",
    mapPosition: { x: 46, y: 0, z: -469 },
    width: 30.5,
    height: 10,
    length: 4.6,
  },
  {
    shape: "box",
    mapPosition: { x: 91.565, y: 0, z: -448.98 },
    height: 10,
    width: 4.75,
    length: 11.941,
  },
  {
    shape: "box",
    mapPosition: { x: 99.609, y: 0, z: -454.281 },
    height: 10,
    width: 14.489,
    length: 3.883,
  },
  {
    shape: "box",
    mapPosition: { x: 107.436, y: 0, z: -442.414 },
    height: 10,
    width: 1.526,
    length: 0.806,
  },
  {
    shape: "box",
    mapPosition: { x: 98.462, y: 0, z: -444.863 },
    height: 10,
    width: 14.087,
    length: 5.162,
  },
  {
    shape: "box",
    mapPosition: { x: 105.595, y: 0, z: -449.697 },
    height: 10,
    width: 3.958,
    length: 11.743,
  },
  {
    shape: "box",
    mapPosition: { x: -20.406, y: 0, z: -482.121 },
    height: 10,
    width: 6.632,
    length: 3.425,
  },
  {
    shape: "box",
    mapPosition: { x: -12.516, y: 0, z: -481.928 },
    height: 10,
    width: 8.676,
    length: 3.177,
  },
  {
    shape: "box",
    mapPosition: { x: -5.758, y: 0, z: -481.795 },
    height: 10,
    width: 2.739,
    length: 2.969,
  },
  {
    shape: "box",
    mapPosition: { x: -2.651, y: 0, z: -482.048 },
    height: 10,
    width: 3.624,
    length: 3.502,
  },
  {
    shape: "box",
    mapPosition: { x: 0.976, y: 0, z: -482.121 },
    height: 10,
    width: 2.768,
    length: 2.949,
  },
  {
    shape: "box",
    mapPosition: { x: 4.606, y: 0, z: -482.076 },
    height: 10,
    width: 3.388,
    length: 3.34,
  },
  {
    shape: "box",
    mapPosition: { x: 8.444, y: 0, z: -482.096 },
    height: 10,
    width: 3.618,
    length: 3.623,
  },
];

export function City3Colliders({ debug, ...groupProps }: CityCollidersProps) {
  const { getCollidersForCity } = useColliderPainter();
  const dynamicColliders = getCollidersForCity(CITY_ID);

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
      />
    );
  };

  return (
    <group name="City3Colliders" {...groupProps}>
      {STATIC_COLLIDERS.map((collider, index) =>
        renderCollider(collider, `static-${index}`)
      )}
      {dynamicColliders.map((collider) =>
        renderCollider(collider, collider.id)
      )}
    </group>
  );
}
