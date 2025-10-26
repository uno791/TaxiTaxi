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
import { Hospital } from "./Buildings/Hospital";
import { ColliderBox } from "../Taxi/ColliderBox";
import FlickeringBillboard from "../Environment/FlickeringBillboard";

export default function Allbuildings(props: JSX.IntrinsicElements["group"]) {
  return (
    <group {...props}>
      <BuildingRowVariant1
        position={[-8, 0, 1.8]}
        angle={0}
        scale={[1, 1, 1]}
      />
      <ColliderBox
        mapPosition={{ x: -1, y: 0, z: -3.5 }}
        width={22}
        height={12}
        length={12.5}
      />
      <BuildingRowVariant2
        position={[-0.8, 0, 1.8]}
        angle={0}
        scale={[1, 1, 1]}
      />
      <ColliderBox
        mapPosition={{ x: -23, y: 0, z: 1.8 }}
        width={15}
        height={12}
        length={17.5}
      />
      <BuildingRowVariant3
        position={[-10.8, 0, 1.4]}
        angle={-Math.PI / 2}
        scale={[1, 1, 1]}
      />
      <ColliderBox
        mapPosition={{ x: 18, y: 0, z: 0 }}
        width={9.5}
        height={12}
        length={5.5}
      />
      <BuildingRowVariant1
        position={[-3.6, 0, -9]}
        angle={-Math.PI}
        scale={[1, 1, 1]}
      />
      <ColliderBox
        mapPosition={{ x: 18, y: 0, z: -12 }}
        width={9.5}
        height={12}
        length={13}
      />
      <BuildingRowVariant2
        position={[8.1, 0, -9]}
        angle={-Math.PI}
        scale={[1, 1, 1]}
      />
      <ColliderBox
        mapPosition={{ x: 38, y: 0, z: -7 }}
        width={17.5}
        height={12}
        length={14.5}
      />
      <BuildingRowVariant3
        position={[9.3, 0, -8.5]}
        angle={Math.PI / 2}
        scale={[1, 1, 0.9]}
      />
      <ColliderBox
        mapPosition={{ x: 26, y: 0, z: -28 }}
        width={25}
        height={12}
        length={13.5}
      />
      <ColliderBox
        mapPosition={{ x: 26, y: 0, z: -45 }}
        width={25}
        height={12}
        length={15}
      />
      <ColliderBox
        mapPosition={{ x: 50, y: 0, z: -48 }}
        width={9.5}
        height={12}
        length={9}
      />
      <BlockBuildings position={[-22.7, 0, 1.5]} scale={[1, 2, 1]} />
      <ColliderBox
        mapPosition={{ x: -2, y: 0, z: -53 }}
        width={17}
        height={12}
        length={15}
      />
      <BlockBuildings
        position={[37.5, 0, -7.3]}
        rotation={[0, Math.PI / 2, 0]}
      />
      //White House //LEFT HOUSES
      <ColliderBox
        mapPosition={{ x: 4, y: 0, z: -29 }}
        width={5}
        height={5}
        length={2.8}
      />
      <ColliderBox
        mapPosition={{ x: -5, y: 0, z: -21.7 }}
        width={5}
        height={5}
        length={2.8}
      />
      <ColliderBox
        mapPosition={{ x: -26, y: 0, z: -17 }}
        width={5}
        height={5}
        length={2.8}
      />
      //Brick House
      <ColliderBox
        mapPosition={{ x: 4, y: 0, z: -19.5 }}
        width={5}
        height={5}
        length={3.2}
      />
      <ColliderBox
        mapPosition={{ x: -13, y: 0, z: -30 }}
        width={5}
        height={5}
        length={3.2}
      />
      <ColliderBox
        mapPosition={{ x: -35, y: 0, z: -25 }}
        width={3.2}
        height={5}
        length={5}
      />
      //Small House
      <ColliderBox
        mapPosition={{ x: -5, y: 0, z: -29 }}
        width={3.5}
        height={5}
        length={2.5}
      />
      <ColliderBox
        mapPosition={{ x: -13, y: 0, z: -21.5 }}
        width={3.5}
        height={5}
        length={2.5}
      />
      <ColliderBox
        mapPosition={{ x: -26, y: 0, z: -33 }}
        width={3.5}
        height={5}
        length={2.5}
      />
      //MIDDLE HOUSES //White House
      <ColliderBox
        mapPosition={{ x: 30, y: 0, z: -62 }}
        width={2.8}
        height={5}
        length={5}
      />
      <ColliderBox
        mapPosition={{ x: 22, y: 0, z: -71 }}
        width={2.8}
        height={5}
        length={5}
      />
      <ColliderBox
        mapPosition={{ x: 18, y: 0, z: -92 }}
        width={2.8}
        height={5}
        length={5}
      />
      //Brick House
      <ColliderBox
        mapPosition={{ x: 20.5, y: 0, z: -61.5 }}
        width={3.2}
        height={5}
        length={5}
      />
      <ColliderBox
        mapPosition={{ x: 31.5, y: 0, z: -79 }}
        width={3.2}
        height={5}
        length={5}
      />
      <ColliderBox
        mapPosition={{ x: 26, y: 0, z: -101.3 }}
        width={5}
        height={5}
        length={3.2}
      />
      //Small House
      <ColliderBox
        mapPosition={{ x: 22.5, y: 0, z: -79 }}
        width={2.5}
        height={5}
        length={3.5}
      />
      <ColliderBox
        mapPosition={{ x: 30, y: 0, z: -71 }}
        width={2.5}
        height={5}
        length={3.5}
      />
      <ColliderBox
        mapPosition={{ x: 34, y: 0, z: -92 }}
        width={2.5}
        height={5}
        length={3.5}
      />
      //RIGHT HOUSES //White House
      <ColliderBox
        mapPosition={{ x: 48, y: 0, z: -22 }}
        width={5}
        height={5}
        length={2.8}
      />
      <ColliderBox
        mapPosition={{ x: 57, y: 0, z: -29.5 }}
        width={5}
        height={5}
        length={2.8}
      />
      <ColliderBox
        mapPosition={{ x: 78, y: 0, z: -34 }}
        width={5}
        height={5}
        length={2.8}
      />
      //Brick House
      <ColliderBox
        mapPosition={{ x: 48, y: 0, z: -31 }}
        width={5}
        height={5}
        length={3.2}
      />
      <ColliderBox
        mapPosition={{ x: 65, y: 0, z: -20.5 }}
        width={5}
        height={5}
        length={3.2}
      />
      <ColliderBox
        mapPosition={{ x: 87, y: 0, z: -26 }}
        width={3.2}
        height={5}
        length={5}
      />
      //Small House
      <ColliderBox
        mapPosition={{ x: 65, y: 0, z: -29.5 }}
        width={3.5}
        height={5}
        length={2.5}
      />
      <ColliderBox
        mapPosition={{ x: 57, y: 0, z: -22 }}
        width={3.5}
        height={5}
        length={2.5}
      />
      <ColliderBox
        mapPosition={{ x: 78, y: 0, z: -18 }}
        width={3.5}
        height={5}
        length={2.5}
      />
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
      {/* <Hospital position={[52,1.6,-58.3]} rotation={[0, -Math.PI/2, 0]} scale={[0.008,0.008,0.008]}/> */}
    </group>
  );
}
