import type { JSX } from "react/jsx-runtime";
import { Vector3 } from "three";

import { BigBuilding } from "./Buildings/BigBuilding";
import { BrownBuilding } from "./Buildings/BrownBuilding";
import { CornerBuilding } from "./Buildings/CornerBuilding";
import { GreenBuilding } from "./Buildings/GreenBuilding";
import { RedBuilding } from "./Buildings/RedBuilding";

type BuildingEl = {
  Component: (props: JSX.IntrinsicElements["group"]) => JSX.Element;
  offset?: number; // distance along the line from previous building
};

type BaseRowProps = JSX.IntrinsicElements["group"] & {
  angle?: number; // orientation of the row (in radians)
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
  let distance = 0;

  return (
    <group {...props}>
      {sequence.map(({ Component, offset = 0 }, i) => {
        distance += offset;
        const pos = dir.clone().multiplyScalar(distance);

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
// Adjust offsets for your building dimensions

export function BuildingRowVariant1(props: BaseRowProps) {
  return (
    <BuildingRowBase
      sequence={[
        { Component: BigBuilding, offset: 0 },
        { Component: BrownBuilding, offset: 3.4 },
        { Component: GreenBuilding, offset: 2.2 },
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
        { Component: RedBuilding, offset: 2.5 },
        { Component: BrownBuilding, offset: 3 },
        { Component: BigBuilding, offset: 4 },
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
        { Component: RedBuilding, offset: 2.9 },
        { Component: BigBuilding, offset: 4 },
        { Component: BrownBuilding, offset: 3.9 },
        { Component: CornerBuilding, offset: 2.5 },
      ]}
      {...props}
    />
  );
}
