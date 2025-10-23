import type { JSX } from "react/jsx-runtime";
import { RoadLevel2 } from "./Road/RoadLevel2";
import { BuildingsLevel2 } from "./Buildings/BuildingsLevel2";
export default function Level2(props: JSX.IntrinsicElements["group"]) {
  return (
    <group {...props}>
        <RoadLevel2
        position={[100, 0.1, -150]}
        scale={0.4}
        rotation={[0, 0, 0]}/>

        <BuildingsLevel2
        position={[100.4, 0, -150.5]}
        scale={[0.4,0.35,0.4]}
        rotation={[0, 0, 0]}/>
      
    </group>
  );
}
