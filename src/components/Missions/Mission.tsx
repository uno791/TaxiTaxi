import type { JSX } from "react/jsx-runtime";
import { MissionZone } from "./MissionZone";
import { Woman } from "../Ground/SceneObjects/Woman";
export default function Mission(props: JSX.IntrinsicElements["group"]) {
  return (
    <group {...props}>
      <group>
        <MissionZone position={[-26, -1, -20]} scale={1.5} />
        <Woman
          position={[-26, 0, -20]}
          scale={0.5}
          rotation={[0, Math.PI, 0]}
        />
      </group>
    </group>
  );
}
