import type { JSX } from "react/jsx-runtime";
import { StreetLight } from "./StreetLight";

import { TrafficLight } from "./TrafficLight";
import { TrafficLightB } from "./TrafficLightB";
import { TrafficLightC } from "./TrafficLightC";
import { StopSign } from "./StopSign";

export default function TrafficSigns(props: JSX.IntrinsicElements["group"]) {
  return (
    <group {...props}>
      <group>
        <StreetLight position={[11, 0, -12]} scale={2.3} />
        <TrafficLightC
          position={[11, 0, -11]}
          scale={2.3}
          rotation={[0, 0, 0]}
        />
        <TrafficLightB
          position={[11, 0, -13]}
          scale={2.3}
          rotation={[0, Math.PI * 1.5, 0]}
        />
        <StopSign
          position={[13, 0, -5]}
          scale={0.007}
          rotation={[0, Math.PI * 2, 0]}
        />
        <StopSign
          position={[11, 0, 3]}
          scale={0.007}
          rotation={[0, Math.PI / 2, 0]}
        />
        <StopSign
          position={[-13, 0, 3]}
          scale={0.007}
          rotation={[0, Math.PI * 2, 0]}
        />
        <StopSign
          position={[-27, 0, -9]}
          scale={0.007}
          rotation={[0, Math.PI / 2, 0]}
        />
        <StopSign
          position={[-3, 0, -43]}
          scale={0.007}
          rotation={[0, Math.PI * 1.5, 0]}
        />
        <StopSign
          position={[-3, 0, -43]}
          scale={0.007}
          rotation={[0, Math.PI * 1.5, 0]}
        />
        <StopSign
          position={[13, 0, -21]}
          scale={0.007}
          rotation={[0, Math.PI * 2, 0]}
        />
        <StopSign
          position={[25, 0, -19]}
          scale={0.007}
          rotation={[0, Math.PI * 1.5, 0]}
        />
        <StopSign
          position={[25, 0, -3]}
          scale={0.007}
          rotation={[0, Math.PI * 1.5, 0]}
        />
        <StopSign
          position={[39, 0, -19]}
          scale={0.007}
          rotation={[0, Math.PI, 0]}
        />
        <StopSign
          position={[23, 0, -5]}
          scale={0.007}
          rotation={[0, Math.PI / 2, 0]}
        />
        <StopSign
          position={[40.8, 0, 2.9]}
          scale={0.007}
          rotation={[0, Math.PI * 1.2, 0]}
        />
        <TrafficLightB
          position={[39, 0, -17]}
          scale={2.3}
          rotation={[0, Math.PI, 0]}
        />
        <TrafficLightB
          position={[27, 0, -5]}
          scale={2.3}
          rotation={[0, Math.PI * 2, 0]}
        />
        <TrafficLightC
          position={[27, 0, -5]}
          scale={2.3}
          rotation={[0, Math.PI * 1.5, 0]}
        />
        <TrafficLightC
          position={[41, 0, -15]}
          scale={2.3}
          rotation={[0, Math.PI * 1.5, 0]}
        />
        <TrafficLight position={[41.5, 0, -35]} scale={2.3} />
        <TrafficLight
          position={[38.5, 0, -37]}
          scale={2.3}
          rotation={[0, Math.PI, 0]}
        />
        <TrafficLightC
          position={[41, 0, -37]}
          scale={2.3}
          rotation={[0, Math.PI / 2, 0]}
        />
        <TrafficLightC
          position={[39, 0, -35]}
          scale={2.3}
          rotation={[0, Math.PI * 1.5, 0]}
        />
        <StopSign
          position={[13, 0, -37]}
          scale={0.007}
          rotation={[0, Math.PI * 2, 0]}
        />
        <StopSign
          position={[41, 0, -53]}
          scale={0.007}
          rotation={[0, Math.PI * 1.5, 0]}
        />
        <TrafficLightB
          position={[43, 0, -53]}
          scale={2.3}
          rotation={[0, Math.PI / 2, 0]}
        />
        <TrafficLightC
          position={[43, 0, -55]}
          scale={2.3}
          rotation={[0, Math.PI * 2, 0]}
        />
        <TrafficLightB
          position={[45, 0, -55]}
          scale={2.3}
          rotation={[0, Math.PI * 2, 0]}
        />
        <TrafficLightC
          position={[45, 0, -55]}
          scale={2.3}
          rotation={[0, Math.PI * 1.5, 0]}
        />
        <StopSign
          position={[61, 0, -55]}
          scale={0.008}
          rotation={[0, Math.PI, 0]}
        />
      </group>
    </group>
  );
}
