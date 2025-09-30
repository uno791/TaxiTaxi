import type { JSX } from "react/jsx-runtime";
import { Mountain } from "../Ground/Mountain";
import { Nature } from "../Ground/Nature";
import { Barrier } from "../Ground/Barrier";
import CityObjects from "./CityObjects";
/** Utility: lay out N barriers along a straight line with constant step */
function BarrierRun({
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
          <Barrier
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

export default function Background(props: JSX.IntrinsicElements["group"]) {
  return (
    // Outer group receives world-space transforms (position/rotation/scale)
    <group {...props}>
      {/* Inner group is your block content in local space */}
      <group>
        {/* MOUNTAINS */}
        <Mountain position={[20, 3, 30]} scale={30} />
        <Mountain position={[40, 3, 30]} scale={30} />
        <Mountain position={[0, 3, 30]} scale={30} />
        <Mountain position={[60, 3, 30]} scale={30} />
        <Mountain
          position={[70, 3, 10]}
          scale={30}
          rotation={[0, Math.PI / 2, 0]}
        />
        <Mountain
          position={[70, 3, 30]}
          scale={30}
          rotation={[0, Math.PI / 6, 0]}
        />
        <Mountain position={[-20, 3, 35]} scale={30} />

        {/* NATURE */}
        <Nature position={[10, -0.2, 12]} scale={0.3} />
        <Nature position={[20, -0.2, 9.5]} scale={0.3} />
        <Nature position={[30, -0.2, 14]} scale={0.3} />
        <Nature position={[40, -0.2, 10]} scale={0.3} />
        <Nature position={[0, -0.2, 10]} scale={0.3} />
        <Nature position={[-7, -0.2, 10]} scale={0.3} />

        {/* ───── BARRIERS (loop-generated) ───── */}

        {/* Left horizontal run (z = 5.1), from x=5 down to x≈-12.1, step ≈ -1.7  */}
        <BarrierRun
          name="left-row"
          start={[5.0, 0, 5.1]}
          step={[-1.7, 0, 0]}
          count={11} // 5.0, 3.3, 1.6, ..., -12.1
          rotationY={Math.PI}
        />

        {/* Vertical run up the left (x = -12.9), z: 6.5 → 12.1 ~ +1.9 */}
        <BarrierRun
          name="left-vert"
          start={[-12.9, 0, 6.5]}
          step={[0, 0, 1.9]}
          count={4} // 6.5, 8.4, 10.3/10.2, 12.1 (close enough)
          rotationY={1.5 * Math.PI}
        />

        {/* Right horizontal long run (z = 5.1), x: 6.7 → 39.2 with +1.7 steps */}
        <BarrierRun
          name="right-row-main"
          start={[6.7, 0, 5.1]}
          step={[1.7, 0, 0]}
          count={20} // up to 39.2
          rotationY={Math.PI}
        />
        {/* Small manual tail to match your 40.2 endpoint */}
        <Barrier
          position={[40.2, 0, 5.1]}
          scale={0.5}
          rotation={[0, Math.PI, 0]}
        />

        {/* Corner piece at (41, 4) turning downwards */}
        <Barrier
          position={[41, 0, 4]}
          scale={0.5}
          rotation={[0, 1.5 * Math.PI, 0]}
        />

        {/* Bottom run (z = 3.1), x: 42 → 47.1 with +1.7 steps */}
        <BarrierRun
          name="bottom-row"
          start={[42, 0, 3.1]}
          step={[1.7, 0, 0]}
          count={4} // 42, 43.7, 45.4, 47.1
          rotationY={Math.PI}
        />
        {/* Final little cap at 48.4 to match your layout */}
        <Barrier
          position={[48.4, 0, 3.1]}
          scale={0.5}
          rotation={[0, Math.PI, 0]}
        />
        <BarrierRun
          name="left-horiz"
          start={[-14, 0, 13.1]}
          step={[-1.9, 0, 0]}
          count={10}
          rotationY={Math.PI}
        />
        <Barrier
          position={[-32.4, 0, 13.1]}
          scale={0.5}
          rotation={[0, Math.PI, 0]}
        />
        <BarrierRun
          name="right-vert"
          start={[49, 0, 2]}
          step={[0, 0, -1.9]}
          count={11}
          rotationY={Math.PI * 1.5}
        />
        <BarrierRun
          name="left-vert-back"
          start={[-33.18, 0, 12.2]}
          step={[0, 0, -1.9]}
          count={11}
          rotationY={Math.PI / 2}
        />
        <Barrier
          position={[-33.18, 0, -8.4]}
          scale={0.5}
          rotation={[0, Math.PI / 2, 0]}
        />
        <BarrierRun
          name="left-horz-top"
          start={[-32.18, 0, -9.2]}
          step={[1.9, 0, 0]}
          count={3}
          rotationY={Math.PI * 2}
        />
        <CityObjects position={[0, 0, 0]} />
      </group>
    </group>
  );
}
