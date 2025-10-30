import type { JSX } from "react/jsx-runtime";
import {
  BuildingRowVariant1,
  BuildingRowVariant2,
  BuildingRowVariant3,
} from "./BuildingRow";
import BlockBuildings from "./BlockBuildings";
import Resedential from "./Resedential";
import { BBall } from "./Buildings/BBall";
import { Tennis } from "./Buildings/Tennis";
import FlickeringBillboard from "../Environment/FlickeringBillboard";
import TrashCan from "../Environment/TrashCan";

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
      <BlockBuildings position={[-22.7, 0, 1.5]} scale={[1, 2, 1]} />
      <BlockBuildings
        position={[37.5, 0, -7.3]}
        rotation={[0, Math.PI / 2, 0]}
      />
      //White House //LEFT HOUSES
      <BlockBuildings
        position={[-2.5, 0, -53.3]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <BlockBuildings
        position={[25.5, 0, -45.25]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[1, 2, 1.45]}
      />
      <BlockBuildings
        position={[25.5, 0, -28.25]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.87, 2, 1.45]}
      />
      <BlockBuildings
        position={[17.7, 0, -12.2]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.85, 1, 0.55]}
      />
      <BlockBuildings
        position={[17.7, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.35, 2, 0.55]}
      />
      <BlockBuildings
        position={[49.75, 0, -48.2]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.6, 1, 0.55]}
      />
      <Resedential position={[0, 0, 0]} />
      <Resedential position={[1, 0, -66]} rotation={[0, -Math.PI / 2, 0]} />
      <Resedential position={[52, 0, -51]} rotation={[0, -Math.PI, 0]} />
      <BBall
        position={[59, 0.012, -58]}
        rotation={[0, -Math.PI, 0]}
        scale={[0.2, 0.2, 0.2]}
      />
      <Tennis
        position={[59, 0.03, -45.5]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={[0.18, 0.18, 0.18]}
      />
      <Tennis
        position={[59, 0.03, -50.5]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={[0.18, 0.18, 0.18]}
      />
      <FlickeringBillboard
        position={[68, -0.5, -58]}
        rotation={[0, -Math.PI / 2, 0]} // rotated to face the courts/road
      />
      {/* Trashcan with spinning lid */}
      <TrashCan position={[57, 0.18, -55.2]} scale={0.4} />
      {/* <Hospital position={[52,1.6,-58.3]} rotation={[0, -Math.PI/2, 0]} scale={[0.008,0.008,0.008]}/> */}
    </group>
  );
}
