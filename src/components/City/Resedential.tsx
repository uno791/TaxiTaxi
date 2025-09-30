import type { JSX } from 'react/jsx-runtime'
import { BritsHouse } from './Buildings/BritsHouse';
import { FarmHouse } from './Buildings/FarmHouse';
import { House } from './Buildings/House';
import { HouseCar } from './Buildings/HouseCar';
import { HouseDriveway } from './Buildings/HouseDriveway';
import {
  RoadStraight,
  RoadCornerCurved,
  RoadTSplit,
  RoadJunction
} from '../Road/RoadBitsGenerated';
import { Driveway } from '../Ground/SceneObjects/Driveway';
import { Tree } from '../Ground/SceneObjects/Tree';
import { Hedge } from '../Ground/SceneObjects/Hedge';
import { StreetLight } from '../Ground/SceneObjects/StreetLight';


const straight: JSX.Element[] = []

for (let c = 10; c >= -20; c -= 2) {
  straight.push(
    <RoadStraight
      key={`straight-${c}`}
      position={[c, 0, -25]}
      rotation={[-Math.PI / 2, 0, Math.PI / 2]}
    />
  )
}

     
    





export default function Resedential(props: JSX.IntrinsicElements['group']) {
  return (
    <group {...props}>


        <RoadTSplit position={[12,0,-25]} rotation={[-Math.PI/2, 0, Math.PI]}/>
        {straight}


        <StreetLight position={[10,0,-23.9]} rotation={[0, 0, 0]} scale={[0.5,0.4,0.4]}/>
        <RoadTSplit position={[-22,0,-25]} rotation={[-Math.PI/2, 0, 2*Math.PI]}/>

        <RoadStraight position={[-22,0,-23]} rotation={[-Math.PI/2, 0, 2*Math.PI]}/>
        <RoadStraight position={[-22,0,-27]} rotation={[-Math.PI/2, 0, 2*Math.PI]}/>
        <RoadCornerCurved position={[-22,0,-21]} rotation={[-Math.PI/2, 0, Math.PI]}/>
        <RoadCornerCurved position={[-22,0,-29]} rotation={[-Math.PI/2, 0, -Math.PI/2]}/>

        <RoadStraight position={[-24,0,-21]} rotation={[-Math.PI/2, 0, Math.PI/2]}/>
        <RoadStraight position={[-26,0,-21]} rotation={[-Math.PI/2, 0, Math.PI/2]}/>
        <RoadStraight position={[-28,0,-21]} rotation={[-Math.PI/2, 0, Math.PI/2]}/>

         <RoadStraight position={[-24,0,-29]} rotation={[-Math.PI/2, 0, Math.PI/2]}/>
        <RoadStraight position={[-26,0,-29]} rotation={[-Math.PI/2, 0, Math.PI/2]}/>
        <RoadStraight position={[-28,0,-29]} rotation={[-Math.PI/2, 0, Math.PI/2]}/>

        <RoadCornerCurved position={[-30,0,-21]} rotation={[-Math.PI/2, 0, Math.PI/2]}/>
        <RoadCornerCurved position={[-30,0,-29]} rotation={[-Math.PI/2, 0, 2*Math.PI]}/>

        <RoadStraight position={[-30,0,-23]} rotation={[-Math.PI/2, 0, 2*Math.PI]}/>
        <RoadStraight position={[-30,0,-27]} rotation={[-Math.PI/2, 0, 2*Math.PI]}/>
        <RoadStraight position={[-30,0,-25]} rotation={[-Math.PI/2, 0, 2*Math.PI]}/>
    


        <FarmHouse position={[4,0,-29]} scale={[0.15,0.15,0.15]}/>
        <Driveway position={[3.9,0.01,-26.7]} scale={[1.5,1,1.5]}/>
        <House position={[-5,0,-29]} scale={[0.9,0.9,0.9]}/>
        <Driveway position={[-4.8,0.01,-26.7]} scale={[1.5,1,1.5]}/>
        <HouseDriveway position={[-13,0.05,-29]} scale={[0.17,0.17,0.17]}/>



        <FarmHouse position={[-5,0,-21.3]} scale={[0.15,0.15,0.15]} rotation={[0, Math.PI, -0]}/>
        <Driveway position={[-4.9,0.01,-23.5]} scale={[1.5,1,1.5]} rotation={[0, Math.PI, -0]}/>
        <House position={[-13,0,-21.3]} scale={[0.9,0.9,0.9]} rotation={[0, Math.PI, -0]}/>
        <Driveway position={[-13.2,0.01,-23.5]} scale={[1.5,1,1.5]}/>
        <HouseDriveway position={[4,0.05,-21]} scale={[0.17,0.17,0.17]} rotation={[0, Math.PI, -0]}/>



        <FarmHouse position={[-26,0,-17]} scale={[0.15,0.15,0.15]} rotation={[0, Math.PI, -0]}/>
        <Driveway position={[-26,0.01,-19.1]} scale={[1.5,1,1.7]} rotation={[0, Math.PI, -0]}/>
        <House position={[-26,0,-33]} scale={[0.9,0.9,0.9]} rotation={[0, 2*Math.PI, -0]}/>
        <Driveway position={[-25.8,0.01,-30.7]} scale={[1.5,1,1.5]}/>
        <HouseDriveway position={[-33.9,0.05,-25]} scale={[0.17,0.17,0.17]} rotation={[0, Math.PI/2, -0]}/>

        <Tree position={[1.2,0,-29]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-1.8,0,-29]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-0.3,0,-29]} scale={[0.005,0.005,0.005]}/>

        
         <Tree position={[-7.3,0,-29]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-10.3,0,-29]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-8.8,0,-29]} scale={[0.005,0.005,0.005]}/>


        <Tree position={[-16,0,-29]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-19,0,-29]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-17.5,0,-29]} scale={[0.005,0.005,0.005]}/>



        <Tree position={[1.2,0,-21]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-1.8,0,-21]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-0.3,0,-21]} scale={[0.005,0.005,0.005]}/>

        
         <Tree position={[-7.3,0,-21]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-10.3,0,-21]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-8.8,0,-21]} scale={[0.005,0.005,0.005]}/>


        <Tree position={[-16,0,-21]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-19,0,-21]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-17.5,0,-21]} scale={[0.005,0.005,0.005]}/>


        <Tree position={[-22,0,-18]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-23,0,-18]} scale={[0.005,0.005,0.005]}/>

        <Tree position={[-29,0,-18]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-30,0,-18]} scale={[0.005,0.005,0.005]}/>

        <Tree position={[-22,0,-32]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-23,0,-32]} scale={[0.005,0.005,0.005]}/>

        <Tree position={[-29,0,-32]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-30,0,-32]} scale={[0.005,0.005,0.005]}/>


        <Tree position={[-32,0,-32]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-33,0,-31]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-34,0,-30]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-35,0,-29]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-36,0,-28]} scale={[0.005,0.005,0.005]}/>


        <Tree position={[-32,0,-18]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-33,0,-19]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-34,0,-20]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-35,0,-21]} scale={[0.005,0.005,0.005]}/>
        <Tree position={[-36,0,-22]} scale={[0.005,0.005,0.005]}/>








        
     


      
     
    </group>
  );
}
