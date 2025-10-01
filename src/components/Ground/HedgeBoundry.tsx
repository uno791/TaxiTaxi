import type { JSX } from "react/jsx-runtime";
import { Hedge } from "./SceneObjects/Hedge";

function HedgeRun({
  start,
  step,
  count,
  rotationY,
  scale = 0.5,
  name,
}: {
  start: [number, number, number]; // [x, y, z]
  step: [number, number, number]; // per-item delta [dx, dy, dz]
  count: number; // how many barriers
  rotationY: number; // radians
  scale?: number;
  name: string; // used for stable React keys
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const x = start[0] + step[0] * i;
        const y = start[1] + step[1] * i;
        const z = start[2] + step[2] * i;
        return (
          <Hedge
            key={`${name}-${i}-${x.toFixed(2)}-${z.toFixed(2)}`}
            position={[x, y, z]}
            scale={scale}
            rotation={[0, rotationY, 0]}
          />
        );
      })}
    </>
  );
}

export default function HedgeBoundry(props: JSX.IntrinsicElements["group"]) {
  return (
    <group {...props}>
      <group>
        <HedgeRun
          name="left-vert"
          start={[6, 0, -17]}
          step={[-1.9, 0, 0]}
          count={15}
          rotationY={0}
        />
        <HedgeRun
          name="right-vert"
          start={[6, 0, -33]}
          step={[-1.9, 0, 0]}
          count={15}
          rotationY={0}
        />
        <HedgeRun
          name="left-bottom-horiz"
          start={[7, 0, -18]}
          step={[0, 0, -1.9]}
          count={3}
          rotationY={Math.PI / 2}
        />
        <HedgeRun
          name="right-bottom-horiz"
          start={[7, 0, -32]}
          step={[0, 0, 1.9]}
          count={3}
          rotationY={Math.PI / 2}
        />
        <HedgeRun
          name="right-bottom-vert"
          start={[8, 0, -27]}
          step={[1.9, 0, 0]}
          count={2}
          rotationY={0}
        />
        <HedgeRun
          name="left-bottom-vert"
          start={[8, 0, -23]}
          step={[1.9, 0, 0]}
          count={2}
          rotationY={0}
        />
        <HedgeRun
          name="right-top-horiz"
          start={[-21.5, 0, -34]}
          step={[0, 0, -1.9]}
          count={1}
          rotationY={Math.PI / 2}
        />
        <HedgeRun
          name="left-top-horiz"
          start={[-21.5, 0, -16]}
          step={[0, 0, -1.9]}
          count={1}
          rotationY={Math.PI / 2}
        />
        <HedgeRun
          name="right-top-vert"
          start={[-22.5, 0, -35]}
          step={[-1.9, 0, 0]}
          count={6}
          rotationY={0}
        />
        <HedgeRun
          name="left-top-vert"
          start={[-22.5, 0, -15]}
          step={[-1.9, 0, 0]}
          count={6}
          rotationY={0}
        />
        <HedgeRun
          name="left-top-angle"
          start={[-33.5, 0, -15.5]}
          step={[-1.3, 0, -1.3]}
          count={5}
          rotationY={Math.PI * 1.75}
        />
        <HedgeRun
          name="right-top-angle"
          start={[-33.5, 0, -34.5]}
          step={[-1.3, 0, 1.3]}
          count={5}
          rotationY={Math.PI / 4.4}
        />
        <HedgeRun
          name="-top-"
          start={[-39.3, 0, -22.4]}
          step={[0, 0, -1.3]}
          count={5}
          rotationY={Math.PI / 2}
        />
      </group>
    </group>
  );
}
