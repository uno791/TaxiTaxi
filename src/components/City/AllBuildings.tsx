import type { JSX } from 'react/jsx-runtime'
import {
  BuildingRowVariant1,
  BuildingRowVariant2,
  BuildingRowVariant3,
} from './BuildingRow';

export default function Allbuildings(props: JSX.IntrinsicElements['group']) {
  return (
    <group {...props}>
      <BuildingRowVariant1 position={[-8, 0, 1.8]} angle={0} scale={[1,1,1]} />
      <BuildingRowVariant2
        position={[-0.8, 0, 1.8]} angle={0} scale={[1,1,1]}
      />
      <BuildingRowVariant3 position={[-10.8, 0, 1.4]} angle={-Math.PI/2} scale={[1,1,1]} />

      <BuildingRowVariant1 position={[-3.6, 0, -9]} angle={-Math.PI} scale={[1,1,1]} />
      <BuildingRowVariant2
        position={[8.1, 0, -9]} angle={-Math.PI} scale={[1,1,1]}
      />
      <BuildingRowVariant3 position={[9.3, 0,-8.5]} angle={Math.PI/2} scale={[1,1,0.9]} />
     
    </group>
  );
}
