import type { JSX } from "react/jsx-runtime";
import { Vector3 } from "three";

import { BigBuilding } from "./Buildings/BigBuilding";
import { BrownBuilding } from "./Buildings/BrownBuilding";
import { CornerBuilding } from "./Buildings/CornerBuilding";
import { GreenBuilding } from "./Buildings/GreenBuilding";
import { RedBuilding } from "./Buildings/RedBuilding";

type BuildingEl = {
  Component: (props: JSX.IntrinsicElements["group"]) => JSX.Element;
  /**
   * Distance from the previous building along the row direction (cumulative).
   */
  offset?: number;

  /**
   * A sideways adjustment, perpendicular to the row direction.
   * Positive = right side, negative = left side.
   */
  lateral?: number;
};

type BaseRowProps = JSX.IntrinsicElements["group"] & {
  angle?: number;        // orientation of the row (in radians)
  facingOffset?: number; // adjustment for building orientation
};

/**
 * Generic row renderer
 * Places buildings along a line defined by `angle`.
 * Each building is rotated to face `angle + facingOffset`.
 */
function BuildingRowBase({
  sequence,
  angle = 0,
  facingOffset = 2 * Math.PI, // default correction factor
  ...props
}: BaseRowProps & { sequence: BuildingEl[] }) {
  const dir = new Vector3(Math.cos(angle), 0, Math.sin(angle));
  // Perpendicular direction (rotate dir 90° around Y)
  const lateralDir = new Vector3(-Math.sin(angle), 0, Math.cos(angle));

  let distance = 0;

  return (
    <group {...props}>
      {sequence.map(({ Component, offset = 0, lateral = 0 }, i) => {
        distance += offset;

        // base forward position
        const pos = dir.clone().multiplyScalar(distance);

        // add sideways offset
        pos.add(lateralDir.clone().multiplyScalar(lateral));

        return (
          <Component
            key={i}
            position={[pos.x, 0, pos.z]}
            rotation={[0, angle + facingOffset, 0]}
          />
        );
      })}
    </group>
  );
}

// === Preset Rows ===

export function BuildingRowVariant1(props: BaseRowProps) {
  return (
    <BuildingRowBase
      sequence={[
        { Component: BigBuilding, offset: 0, lateral:-1 },
        { Component: BrownBuilding, offset: 3.3 },
        // Example: push this one slightly left
        { Component: GreenBuilding, offset: 2.1},
      ]}
      {...props}
    />
  );
}

export function BuildingRowVariant2(props: BaseRowProps) {
  return (
    <BuildingRowBase
      sequence={[
        { Component: CornerBuilding, offset: 0 },
        { Component: RedBuilding, offset: 1.9 },
        { Component: BrownBuilding, offset: 2.2 },
        // Example: push this one to the right
        { Component: BigBuilding, offset: 3.1, lateral:-1},
      ]}
      {...props}
    />
  );
}

export function BuildingRowVariant3(props: BaseRowProps) {
  return (
    <BuildingRowBase
      sequence={[
        { Component: GreenBuilding, offset: 0 },
        { Component: RedBuilding, offset: 2.4},
        { Component: BigBuilding, offset: 3.5, lateral:1 },
        { Component: BrownBuilding, offset: 3.2 },
        { Component: CornerBuilding, offset: 1.7},
      ]}
      {...props}
    />
  );
}
