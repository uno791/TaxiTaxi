import type { ThreeElements } from "@react-three/fiber";
import { ColliderBox } from "../Taxi/ColliderBox";
import { ColliderCylinder } from "../Taxi/ColliderCylinder";

export type CityCollidersProps = ThreeElements["group"] & { debug?: boolean };

export function City3Colliders({ debug, ...groupProps }: CityCollidersProps) {
  return (
    <group name="City3Colliders" {...groupProps}>
      {/*thin row*/}
      <ColliderBox
        mapPosition={{ x: 53, y: 0, z: -431 }}
        width={32}
        height={10}
        length={4}
        debug={debug}
      />

      {/*thick row*/}
      <ColliderBox
        mapPosition={{ x: 53, y: 0, z: -424 }}
        width={35.5}
        height={10}
        length={6}
        debug={debug}
      />

      <ColliderBox
        mapPosition={{ x: 55, y: 0, z: -416 }}
        width={32}
        height={10}
        length={4}
        debug={debug}
      />
      <ColliderBox
        mapPosition={{ x: 54, y: 0, z: -413.5 }}
        width={34}
        height={10}
        length={5}
        debug={debug}
      />
      <ColliderCylinder
        mapPosition={{ x: 50, y: 0, z: -470 }}
        radiusX={4}
        radiusZ={4}
        height={6}
        debug={debug}
      />
      <ColliderBox
        mapPosition={{ x: 37, y: 0, z: -439 }}
        width={32}
        height={10}
        length={4}
        debug={debug}
      />
      <ColliderBox
        mapPosition={{ x: 23, y: 0, z: -443 }}
        width={4}
        height={10}
        length={10}
        debug={debug}
      />
      <ColliderBox
        mapPosition={{ x: 43.6, y: 0, z: -462 }}
        width={32}
        height={10}
        length={4}
        debug={debug}
      />
      <ColliderBox
        mapPosition={{ x: 46, y: 0, z: -469 }}
        width={30.5}
        height={10}
        length={4.6}
        debug={debug}
      />
    </group>
  );
}
