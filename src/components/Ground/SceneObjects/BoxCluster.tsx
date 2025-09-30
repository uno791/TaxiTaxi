import type { JSX } from "react/jsx-runtime";
import { Box } from "./Box";

export default function BoxCluster(props: JSX.IntrinsicElements["group"]) {
  return (
    <group {...props}>
      <group>
        <Box position={[-12.5, 0.01, -3.3]} scale={1} />
        <Box position={[-12.5, 0.01, -4]} scale={1} rotation={[0, 6, 0]} />
        <Box position={[-12.5, 0.01, -3.73]} scale={1.3} rotation={[0, 1, 0]} />
        <Box position={[-12.5, 0.01, -3.5]} scale={1} />
        <Box position={[-12.5, 0.1, -3.45]} scale={1.2} />
        <Box position={[-12.7, 0.01, -3.45]} scale={1.2} />
      </group>
    </group>
  );
}
