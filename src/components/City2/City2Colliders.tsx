import type { ThreeElements } from "@react-three/fiber";
import { ColliderBox } from "../Taxi/ColliderBox";
import { ColliderCylinder } from "../Taxi/ColliderCylinder";
import {
  useColliderPainter,
  type ColliderDescriptor,
} from "../../tools/ColliderPainter";
import type { CityId } from "../../constants/cities";

export type CityCollidersProps = ThreeElements["group"] & { debug?: boolean };

const CITY_ID: CityId = "city2";
const STATIC_COLLIDERS: readonly ColliderDescriptor[] = [];

export function City2Colliders({ debug, ...groupProps }: CityCollidersProps) {
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
    <group name="City2Colliders" {...groupProps}>
      {STATIC_COLLIDERS.map((collider, index) =>
        renderCollider(collider, `static-${index}`)
      )}
      {dynamicColliders.map((collider) =>
        renderCollider(collider, collider.id)
      )}
    </group>
  );
}
