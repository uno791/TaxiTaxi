// RoadCircuit.tsx
import type { JSX } from 'react/jsx-runtime'
import BlockBuilder from './BlockBuilder'
import { Grass } from '../Ground/Grass'

export default function RoadCircuit(props: JSX.IntrinsicElements['group']) {
  return (
    <group {...props}>
      <BlockBuilder position={[-30, 0, 0]} rotation={[Math.PI , -Math.PI/2,Math.PI ]}/> 
      <BlockBuilder position={[36, 0, 0]} rotation={[Math.PI , Math.PI,Math.PI ]}/>   {/* 20 + 16 gap = 36 */}
      <BlockBuilder position={[0, 0, -60]} rotation={[Math.PI , 2*Math.PI,Math.PI ]}/> {/* 18 + 22 gap = 40 */}
      <BlockBuilder position={[60, 0, -50]} rotation={[Math.PI , Math.PI/2,Math.PI ]}/>
      <Grass position={[0,-0.09,0]} scale={[1000,1,1000]}/>

    </group>
  )
}
