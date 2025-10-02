import type { JSX } from "react/jsx-runtime";
import { MissionZone } from "./MissionZone";
export default function Mission(props: JSX.IntrinsicElements["group"]) {
  return (
    <group {...props}>
      <group>
        <MissionZone position={[-26, -1, -20]} scale={1.5} />
      </group>
    </group>
  );
}
