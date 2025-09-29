import type { JSX } from 'react/jsx-runtime'
import {
  BuildingRowVariant1,
  BuildingRowVariant2,
  BuildingRowVariant3,
} from './BuildingRow';
import { BigBuilding } from "./Buildings/BigBuilding";
import { BrownBuilding } from "./Buildings/BrownBuilding";
import { CornerBuilding } from "./Buildings/CornerBuilding";
import { GreenBuilding } from "./Buildings/GreenBuilding";
import { RedBuilding } from "./Buildings/RedBuilding";

/**
 * Helper to convert world-ish coords into local coords around a chosen pivot.
 * Use this to keep the block centered so rotation works as expected.
 */
function toLocal(
  [x, y, z]: [number, number, number],
  [px, py, pz]: [number, number, number]
): [number, number, number] {
  return [x - px, y - py, z - pz];
}

/**
 * Pick a pivot near the middle of your current layout.
 * You can tweak this until rotating looks “about right”.
 */
const PIVOT: [number, number, number] = [-23, 0, 1.5];

export default function BlockBuildings(props: JSX.IntrinsicElements['group']) {
  return (
    // Outer group receives world-space transforms (position/rotation/scale)
    <group {...props}>
      {/* Inner group is your block content in local space */}
      <group>
        <BuildingRowVariant3
          position={toLocal([-16.5, 0, -4.1], PIVOT)}
          angle={Math.PI/2}
          scale={[1,1,0.9]}
        />
        <GreenBuilding
          position={toLocal([-16.5, 0, 7.3], PIVOT)}
          rotation={[0, Math.PI/2, 0]}
          scale={[1,1,0.9]}
        />
        <CornerBuilding
          position={toLocal([-16.5, 0, 9.4], PIVOT)}
          rotation={[0, Math.PI/2, 0]}
          scale={[1.5,1,1]}
        />
        <CornerBuilding
          position={toLocal([-16.8, 0, -5.8], PIVOT)}
          rotation={[0, Math.PI, 0]}
          scale={[1.5,1,1]}
        />

        <BuildingRowVariant3
          position={toLocal([-30, 0, 5], PIVOT)}
          angle={-Math.PI/2}
          scale={[1,1,0.9]}
        />
        <GreenBuilding
          position={toLocal([-30, 0, 7.3], PIVOT)}
          rotation={[0, -Math.PI/2, 0]}
          scale={[1,1,0.9]}
        />
        <CornerBuilding
          position={toLocal([-30, 0, 9.4], PIVOT)}
          rotation={[0, 2*Math.PI, 0]}
          scale={[1,1,1.5]}
        />
        <CornerBuilding
          position={toLocal([-30, 0, -5.8], PIVOT)}
          rotation={[0, -Math.PI/2, 0]}
          scale={[1,1,1]}
        />

        <BuildingRowVariant1
          position={toLocal([-27.2, 0, 9.75], PIVOT)}
          angle={0}
          scale={[1,1,0.9]}
        />
        <BigBuilding
          position={toLocal([-18.85, 0, 8.6], PIVOT)}
          rotation={[0, 2*Math.PI, 0]}
          scale={[0.78,1,1]}
        />

        <BuildingRowVariant1
          position={toLocal([-22.8, 0, -5.8], PIVOT)}
          angle={Math.PI}
          scale={[1,1,0.9]}
        />
        <GreenBuilding
          position={toLocal([-19.2, 0, -5.8], PIVOT)}
          rotation={[0, Math.PI, 0]}
          scale={[1.2,1,1]}
        />
      </group>
    </group>
  );
}
