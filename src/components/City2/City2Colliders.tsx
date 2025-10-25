import type { ThreeElements } from "@react-three/fiber";
import { ColliderBox } from "../Taxi/ColliderBox";
import { ColliderCylinder } from "../Taxi/ColliderCylinder";

export type CityCollidersProps = ThreeElements["group"] & { debug?: boolean };

export function City2Colliders({ debug, ...groupProps }: CityCollidersProps) {
  const PLACEHOLDER_COLLIDERS = false;

  return (
    <group name="City2Colliders" {...groupProps}>
      {PLACEHOLDER_COLLIDERS && (
        <>
          <ColliderBox
            mapPosition={{ x: 100, y: 0, z: -150 }}
            width={50}
            height={8}
            length={50}
            debug={debug}
          />
          <ColliderCylinder
            mapPosition={{ x: 110, y: 0, z: -160 }}
            radiusX={4}
            radiusZ={3}
            height={8}
            debug={debug}
          />
        </>
      )}
    </group>
  );
}
