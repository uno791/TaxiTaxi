import type { JSX } from "react/jsx-runtime";
import { PowerBox } from "./PowerBox";
import { Fence } from "./Fence";
export default function ElectricityBox(props: JSX.IntrinsicElements["group"]) {
  return (
    <group {...props}>
      <group>
        <PowerBox position={[53, 0, -38]} scale={1.5} />
        <PowerBox position={[52.7, 0, -38]} scale={1.5} />
        <PowerBox position={[52.4, 0, -38]} scale={1.5} />
        <PowerBox
          position={[53, 0, -38.6]}
          scale={1.5}
          rotation={[0, Math.PI, 0]}
        />
        <PowerBox
          position={[52.7, 0, -38.6]}
          scale={1.5}
          rotation={[0, Math.PI, 0]}
        />
        <PowerBox
          position={[52.4, 0, -38.6]}
          scale={1.5}
          rotation={[0, Math.PI, 0]}
        />
        <PowerBox
          position={[53, 0, -38.6]}
          scale={1.5}
          rotation={[0, Math.PI / 2, 0]}
        />
        <PowerBox
          position={[53, 0, -38.3]}
          scale={1.5}
          rotation={[0, Math.PI / 2, 0]}
        />
        <PowerBox
          position={[53, 0, -38]}
          scale={1.5}
          rotation={[0, Math.PI / 2, 0]}
        />
        <PowerBox
          position={[52.4, 0, -38.6]}
          scale={1.5}
          rotation={[0, Math.PI * 1.5, 0]}
        />
        <PowerBox
          position={[52.4, 0, -38.3]}
          scale={1.5}
          rotation={[0, Math.PI * 1.5, 0]}
        />
        <PowerBox
          position={[52.4, 0, -38]}
          scale={1.5}
          rotation={[0, Math.PI * 1.5, 0]}
        />
        <PowerBox
          position={[52.7, -0.03, -38.3]}
          scale={1.5}
          rotation={[0, Math.PI * 1.5, 0]}
        />
        <Fence position={[52.1, -0.03, -37.1]} scale={0.17} />
        <Fence position={[53.3, -0.03, -37.1]} scale={0.17} />
        <Fence
          position={[53.9, -0.03, -37.7]}
          scale={0.17}
          rotation={[0, Math.PI / 2, 0]}
        />
        <Fence
          position={[53.9, -0.03, -38.9]}
          scale={0.17}
          rotation={[0, Math.PI / 2, 0]}
        />
        <Fence position={[52.1, -0.03, -39.5]} scale={0.17} />
        <Fence position={[53.3, -0.03, -39.5]} scale={0.17} />
        <Fence
          position={[51.5, -0.03, -37.7]}
          scale={0.17}
          rotation={[0, Math.PI / 2, 0]}
        />
        <Fence
          position={[51.5, -0.03, -38.9]}
          scale={0.17}
          rotation={[0, Math.PI / 2, 0]}
        />
      </group>
    </group>
  );
}
