import type { JSX } from 'react/jsx-runtime'
import {
  RoadStraight,
  RoadCornerCurved,
  RoadStraightCrossing,
  RoadTSplit,
} from './RoadBitsGenerated'

export default function BlockBuilder(props: JSX.IntrinsicElements['group']) {
  const tilesUp: JSX.Element[] = []
  const tilesDown: JSX.Element[] = []
   const tilesLeft: JSX.Element[] = []
  const tilesRight: JSX.Element[] = []


  for (let i = 0; i < 16; i = i + 2) {
    tilesUp.push(<RoadStraight key={`up-${i}`} position={[-8, 0, -i]} />)
    tilesDown.push(<RoadStraight key={`down-${i}`} position={[12, 0, -i]} />)
    

  }

  for (let i = -10; i < 8; i = i + 2) {
    tilesLeft.push(<RoadStraight key={`left-${i}`} position={[-i, 0, -16]}  rotation={[Math.PI / 2, Math.PI, Math.PI / 2]} />)
    tilesRight.push(<RoadStraight key={`right-${i}`} position={[-i, 0, 2]}  rotation={[Math.PI / 2, Math.PI, Math.PI / 2]} />)
    
    

  }


  

  return (
    <group {...props}>
    

      


      {tilesUp}
      {tilesLeft}
      {tilesRight}
      {tilesDown}


      <RoadCornerCurved
        position={[12, 0, -16]}
        rotation={[Math.PI / 2, Math.PI, Math.PI / 2]}
      />

       <RoadCornerCurved
        position={[-8, 0, -16]}
        rotation={[Math.PI / 2, Math.PI, 2*Math.PI / 2]}
      />


      <RoadCornerCurved
        position={[-8, 0, 2]}
        rotation={[Math.PI / 2, Math.PI, -Math.PI / 2]}
      />
     
      
      <RoadCornerCurved
        position={[12, 0, 2]}
        rotation={[Math.PI / 2, Math.PI, -2 * Math.PI]}
      />

      <RoadStraightCrossing position={[8,0,2]} rotation={[Math.PI / 2, Math.PI, -Math.PI / 2]}/>
      <RoadStraightCrossing position={[-4,0,-16]} rotation={[Math.PI / 2, Math.PI, -Math.PI / 2]}/>
       <RoadStraightCrossing position={[12,0,-8]} rotation={[Math.PI / 2, Math.PI,-2*Math.PI / 2]}/>
      <RoadStraightCrossing position={[-8,0,-8]} rotation={[Math.PI / 2, Math.PI,-2*Math.PI / 2]}/>


      <RoadTSplit position={[4,0,-16]} rotation={[Math.PI / 2, Math.PI,-Math.PI / 2]}/>
      <RoadStraight position={[4,0,-18]} rotation={[Math.PI / 2, Math.PI,-2*Math.PI / 2]}/>
      <RoadStraight position={[4,0,-20]} rotation={[Math.PI / 2, Math.PI,-2*Math.PI / 2]}/>

      <RoadTSplit position={[-8,0,-4]} rotation={[Math.PI / 2, Math.PI,2*Math.PI ]}/>
      <RoadStraight position={[-10,0,-4]} rotation={[Math.PI / 2, Math.PI,-Math.PI / 2]}/>
      <RoadStraight position={[-12,0,-4]} rotation={[Math.PI / 2, Math.PI,-Math.PI / 2]}/>

      
    </group>
  )
}
