import type { JSX } from "react/jsx-runtime";
import { Dumpster } from "./Dumpster";
import { TrashBag } from "./TrashBag";
export default function DumpsterFull(props: JSX.IntrinsicElements["group"]) {
  return (
    <group {...props}>
      <group>
        <Dumpster position={[-13, 0, -10]} scale={0.5} />
        <Dumpster position={[-14.2, 0, -10]} scale={0.5} />
        <TrashBag position={[-14.2, 0, -9.5]} scale={1.6} />
        <TrashBag position={[-13.7, 0.1, -9.5]} scale={1.6} />
        <TrashBag position={[-14.5, 0.2, -9.5]} scale={1.6} />
        <TrashBag position={[-14.97, 0.2, -9.7]} scale={1.6} />
        <TrashBag position={[-14.8, 0.1, -9.3]} scale={1.6} />
        <TrashBag position={[-13, 0.1, -9.5]} scale={1.6} />
        <TrashBag position={[-12.7, 0, -9.5]} scale={1.6} />
      </group>
    </group>
  );
}
