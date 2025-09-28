import type { JSX } from 'react/jsx-runtime'
import {
  RoadStraight,
  RoadCorner,
  RoadCornerCurved,
  RoadJunction,
  RoadStraightCrossing,
  RoadTSplit,
} from './RoadBitsGenerated'
import type { PI } from 'three/tsl';

export default function RoadCircuit(props: JSX.IntrinsicElements['group']) {
    const spacing = 2
    const tilesUp:JSX.Element[]=[];
    const tilesDown:JSX.Element[]=[];
    
    for(let i=0;i<6;i=i+2){
        tilesUp.push(<RoadStraight key={i} position={[0,0,-i] }/>)
        tilesDown.push(<RoadStraight key={i} position={[4,0,-i] }/>)
    }
    return(
    <group {...props}>
      
      {tilesUp}
      <RoadCornerCurved position={[0,0,-6]}/>
      <RoadStraightCrossing position={[2, 0, -6]} rotation={[Math.PI / 2, Math.PI, Math.PI/2]}/>
      <RoadCornerCurved position={[4,0,-6]}rotation={[Math.PI / 2, Math.PI, Math.PI/2]}/>
      {tilesDown}
      <RoadCornerCurved position={[0,0,2]}rotation={[Math.PI / 2, Math.PI, -Math.PI/2]}/>
      <RoadStraightCrossing position={[2, 0, 2]} rotation={[Math.PI / 2, Math.PI, Math.PI/2]}/>
      <RoadCornerCurved position={[4,0,2]}rotation={[Math.PI / 2, Math.PI, -2*Math.PI]}/>



        



      {/* examples of adding other bits later: */}
      {/* <RoadCorner position={[spacing, 0, 0]} rotation={[-Math.PI/2, Math.PI/2, 0]} /> */}
      {/* <RoadJunction position={[2 * spacing, 0, spacing]} /> */}
    </group>
    )

}
