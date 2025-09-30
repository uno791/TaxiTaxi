import type { JSX } from "react/jsx-runtime";
import {
  BuildingRowVariant1,
  BuildingRowVariant2,
  BuildingRowVariant3,
} from "./BuildingRow";
import BlockBuildings from "./BlockBuildings";

export default function Allbuildings(props: JSX.IntrinsicElements["group"]) {
  return (
    <group {...props}>
      <BuildingRowVariant1
        position={[-8, 0, 1.8]}
        angle={0}
        scale={[1, 1, 1]}
      />
      <BuildingRowVariant2
        position={[-0.8, 0, 1.8]}
        angle={0}
        scale={[1, 1, 1]}
      />
      <BuildingRowVariant3
        position={[-10.8, 0, 1.4]}
        angle={-Math.PI / 2}
        scale={[1, 1, 1]}
      />

      <BuildingRowVariant1
        position={[-3.6, 0, -9]}
        angle={-Math.PI}
        scale={[1, 1, 1]}
      />
      <BuildingRowVariant2
        position={[8.1, 0, -9]}
        angle={-Math.PI}
        scale={[1, 1, 1]}
      />
      <BuildingRowVariant3
        position={[9.3, 0, -8.5]}
        angle={Math.PI / 2}
        scale={[1, 1, 0.9]}
      />

      <BlockBuildings position={[-22.7, 0, 1.5]} scale={[1, 1, 1]} />
      <BlockBuildings
        position={[37.5, 0, -7.3]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <BlockBuildings
        position={[-2.5, 0, -53.3]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <BlockBuildings
        position={[25.5, 0, -45.25]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[1, 1, 1.45]}
      />
      <BlockBuildings
        position={[25.5, 0, -28.25]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.87, 1, 1.45]}
      />
      <BlockBuildings
        position={[17.7, 0, -12.2]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.85, 1, 0.55]}
      />
      <BlockBuildings
        position={[17.7, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.35, 1, 0.55]}
      />
      <BlockBuildings
        position={[49.75, 0, -48.2]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.6, 1, 0.55]}
      />
    </group>
  );
}
