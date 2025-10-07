import type { JSX } from "react/jsx-runtime";
import { StreetLight } from "./SceneObjects/StreetLight";

export default function StreetLights(props: JSX.IntrinsicElements["group"]) {
  return (
    <group {...props}>
      <group>
        <StreetLight
          position={[0, 0, -13.1]}
          scale={2.3}
          rotation={[0, Math.PI / 2, 0]}
        />
        <StreetLight
          position={[-13.4, 0, -13.1]}
          scale={2.3}
          rotation={[0, Math.PI / 2, 0]}
        />
        <StreetLight
          position={[-26.8, 0, -12.8]}
          scale={2.3}
          rotation={[0, Math.PI * 2.7, 0]}
        />
        <StreetLight
          position={[-15.2, 0, -6.8]}
          scale={2.3}
          rotation={[0, Math.PI * 1.3, 0]}
        />
        <StreetLight
          position={[-30.8, 0, -6.8]}
          scale={2.3}
          rotation={[0, Math.PI * 1.75, 0]}
        />
        <StreetLight
          position={[-30.8, 0, 10.8]}
          scale={2.3}
          rotation={[0, Math.PI * 2.2, 0]}
        />
        <StreetLight
          position={[-15.2, 0, 10.8]}
          scale={2.3}
          rotation={[0, Math.PI * 2.7, 0]}
        />
        <StreetLight
          position={[-6, 0, 2.9]}
          scale={2.3}
          rotation={[0, Math.PI / 2, 0]}
        />
        <StreetLight
          position={[9, 0, 2.9]}
          scale={2.3}
          rotation={[0, Math.PI / 2, 0]}
        />
        <StreetLight
          position={[17.8, 0, 2.9]}
          scale={2.3}
          rotation={[0, Math.PI / 2, 0]}
        />
        <StreetLight
          position={[10.9, 0, -4]}
          scale={2.3}
          rotation={[0, Math.PI, 0]}
        />
        <StreetLight
          position={[10.9, 0, -34]}
          scale={2.3}
          rotation={[0, Math.PI, 0]}
        />
        <StreetLight
          position={[4, 0, -38.9]}
          scale={2.3}
          rotation={[0, Math.PI * 1.5, 0]}
        />
        <StreetLight
          position={[9, 0, -43]}
          scale={2.3}
          rotation={[0, Math.PI * 1.77, 0]}
        />
        <StreetLight
          position={[9.1, 0, -54.9]}
          scale={2.3}
          rotation={[0, Math.PI * 1.77, 0]}
        />
        <StreetLight
          position={[10.9, 0, -54.9]}
          scale={2.3}
          rotation={[0, Math.PI * 1.33, 0]}
        />
        <StreetLight
          position={[6.9, 0, -60.9]}
          scale={2.3}
          rotation={[0, Math.PI * 1.33, 0]}
        />
        <StreetLight
          position={[-10.9, 0, -60.9]}
          scale={2.3}
          rotation={[0, Math.PI * 1.77, 0]}
        />
        <StreetLight
          position={[-10.9, 0, -45.1]}
          scale={2.3}
          rotation={[0, Math.PI * 2.33, 0]}
        />
        <StreetLight
          position={[18.5, 0, -55.1]}
          scale={2.3}
          rotation={[0, Math.PI / 2, 0]}
        />
        <StreetLight
          position={[35, 0, -55.1]}
          scale={2.3}
          rotation={[0, Math.PI / 2, 0]}
        />
        <StreetLight
          position={[50, 0, -55.1]}
          scale={2.3}
          rotation={[0, Math.PI / 2, 0]}
        />
        <StreetLight
          position={[50, 0, -60.9]}
          scale={2.3}
          rotation={[0, Math.PI * 1.5, 0]}
        />
        <StreetLight
          position={[54.9, 0, -58]}
          scale={2.3}
          rotation={[0, Math.PI, 0]}
        />
        <StreetLight
          position={[63.1, 0, -58]}
          scale={2.3}
          rotation={[0, Math.PI * 2, 0]}
        />
        <StreetLight
          position={[63.1, 0, -50]}
          scale={2.3}
          rotation={[0, Math.PI * 2, 0]}
        />
        <StreetLight
          position={[63.1, 0, -40.9]}
          scale={2.3}
          rotation={[0, Math.PI * 1.77, 0]}
        />
        <StreetLight
          position={[57, 0, -35]}
          scale={2.3}
          rotation={[0, Math.PI * 1.77, 0]}
        />
        <StreetLight
          position={[50, 0, -34.9]}
          scale={2.3}
          rotation={[0, Math.PI * 1.5, 0]}
        />
        <StreetLight
          position={[50, 0, -40.9]}
          scale={2.3}
          rotation={[0, Math.PI * 1.5, 0]}
        />
        <StreetLight
          position={[42.9, 0, -40.9]}
          scale={2.3}
          rotation={[0, Math.PI * 1.33, 0]}
        />
        <StreetLight
          position={[41, 0, -17]}
          scale={2.3}
          rotation={[0, Math.PI * 2, 0]}
        />
        <StreetLight
          position={[27, 0, -17]}
          scale={2.3}
          rotation={[0, Math.PI * 2.77, 0]}
        />
        <StreetLight
          position={[29.1, 0, 0.9]}
          scale={2.3}
          rotation={[0, Math.PI * 2.33, 0]}
        />
        <StreetLight
          position={[38, 0, 0.9]}
          scale={2.3}
          rotation={[0, Math.PI / 2, 0]}
        />
        <StreetLight
          position={[46.9, 0, 0.9]}
          scale={2.3}
          rotation={[0, Math.PI / 1.33, 0]}
        />
        <StreetLight
          position={[46.9, 0, -14.9]}
          scale={2.3}
          rotation={[0, Math.PI * 1.33, 0]}
        />
        <StreetLight
          position={[30, 0, -18.9]}
          scale={2.3}
          rotation={[0, Math.PI * 1.5, 0]}
        />
      </group>
    </group>
  );
}
