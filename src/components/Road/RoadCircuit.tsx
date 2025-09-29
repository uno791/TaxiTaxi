// RoadCircuit.tsx
import type { JSX } from 'react/jsx-runtime'
import BlockBuilder from './BlockBuilder'
import { Grass } from '../Ground/Grass'
import {
  RoadStraight,
  RoadCornerCurved,
  RoadStraightCrossing,
  RoadTSplit,
} from './RoadBitsGenerated'

type Vector3 = [number, number, number]

export default function RoadCircuit(props: JSX.IntrinsicElements['group']) {
  const horizontalRotation: Vector3 = [Math.PI / 2, Math.PI, Math.PI / 2]
  const cornerEastToSouth: Vector3 = [Math.PI / 2, Math.PI, 0]
  const crossingRotation: Vector3 = [Math.PI / 2, Math.PI, -Math.PI / 2]
  const tSplitRotations: Record<'north' | 'south' | 'east' | 'west', Vector3> = {
    north: [Math.PI / 2, Math.PI, Math.PI],
    south: [Math.PI / 2, Math.PI, -Math.PI / 2],
    east: [Math.PI / 2, Math.PI, Math.PI / 2],
    west: [Math.PI / 2, Math.PI, 0],
  }

  const createLinearRange = (start: number, end: number) => {
    const values: number[] = []
    const step = start <= end ? 2 : -2

    for (let current = start; step > 0 ? current <= end : current >= end; current += step) {
      values.push(current)
    }

    return values
  }

  const horizontalRuns = [
    { id: 'a-to-hub-west', z: 4, start: -8, end: 10 },
    { id: 'a-to-b-north', z: 4, start: 14, end: 38 },
    { id: 'b-west-approach', z: -4, start: 14, end: 22 },
    { id: 'a-west-connector', z: -12, start: -24, end: 10 },
    { id: 'b-south-approach', z: -20, start: 14, end: 38 },
    { id: 'c-to-d-link-west', z: -36, start: 14, end: 38 },
    { id: 'c-to-d-link-east', z: -36, start: 42, end: 54 },
    { id: 'c-south-connector', z: -40, start: 10, end: -2 },
    { id: 'lower-loop-west', z: -54, start: 14, end: 38 },
    { id: 'lower-loop-east', z: -54, start: 42, end: 60 },
  ] satisfies Array<{ id: string; z: number; start: number; end: number }>

  const horizontalRoads = horizontalRuns.flatMap(({ id, z, start, end }) =>
    createLinearRange(start, end).map((x) => (
      <RoadStraight
        key={`h-${id}-${x}-${z}`}
        position={[x, 0, z]}
        rotation={horizontalRotation}
      />
    )),
  )

  const verticalRuns = [
    {
      id: 'main-spine',
      x: 12,
      start: 2,
      end: -54,
      skip: new Set([4, -4, -12, -20, -36, -40]),
    },
    {
      id: 'b-loop',
      x: 24,
      start: 2,
      end: -18,
      skip: new Set([4, -4, -20]),
    },
    {
      id: 'b-to-d-spine',
      x: 40,
      start: -22,
      end: -52,
      skip: new Set([-36]),
    },
    {
      id: 'd-east-spine',
      x: 56,
      start: -40,
      end: -60,
      skip: new Set([-54]),
    },
  ] satisfies Array<{ id: string; x: number; start: number; end: number; skip: Set<number> }>

  const verticalRoads = verticalRuns.flatMap(({ id, x, start, end, skip }) =>
    createLinearRange(start, end)
      .filter((z) => !skip.has(z))
      .map((z) => <RoadStraight key={`v-${id}-${x}-${z}`} position={[x, 0, z]} />),
  )

  const tSplitData: Array<{ id: string; position: Vector3; rotation: Vector3 }> = [
    { id: 'hub-top', position: [12, 0, 4], rotation: tSplitRotations.south },
    { id: 'hub-b-west', position: [12, 0, -4], rotation: tSplitRotations.east },
    { id: 'hub-a-west', position: [12, 0, -12], rotation: tSplitRotations.west },
    { id: 'hub-south', position: [12, 0, -20], rotation: tSplitRotations.east },
    { id: 'hub-c-north', position: [12, 0, -36], rotation: tSplitRotations.east },
    { id: 'hub-c-south', position: [12, 0, -40], rotation: tSplitRotations.west },
    { id: 'b-loop-entry', position: [24, 0, 4], rotation: tSplitRotations.south },
    { id: 'b-loop-junction', position: [24, 0, -20], rotation: tSplitRotations.north },
  ]

  const tSplits = tSplitData.map(({ id, position, rotation }) => (
    <RoadTSplit key={`ts-${id}`} position={position} rotation={rotation} />
  ))

  const crossings = [
    { id: 'bd-cross', position: [40, 0, -36] as Vector3 },
    { id: 'd-cross', position: [56, 0, -54] as Vector3 },
  ].map(({ id, position }) => (
    <RoadStraightCrossing key={`cross-${id}`} position={position} rotation={crossingRotation} />
  ))

  const corners = [
    { id: 'b-north-turn', position: [40, 0, 4] as Vector3 },
    { id: 'd-west-turn', position: [56, 0, -36] as Vector3 },
  ].map(({ id, position }) => (
    <RoadCornerCurved key={`corner-${id}`} position={position} rotation={cornerEastToSouth} />
  ))

  return (
    <group {...props}>
      <BlockBuilder position={[-30, 0, 0]} rotation={[Math.PI , -Math.PI/2,Math.PI ]}/> 
      <BlockBuilder position={[36, 0, 0]} rotation={[Math.PI , Math.PI,Math.PI ]}/>   {/* 20 + 16 gap = 36 */}
      <BlockBuilder position={[0, 0, -60]} rotation={[Math.PI , 2*Math.PI,Math.PI ]}/> {/* 18 + 22 gap = 40 */}
      <BlockBuilder position={[60, 0, -50]} rotation={[Math.PI , Math.PI/2,Math.PI ]}/>
      {horizontalRoads}
      {verticalRoads}
      {tSplits}
      {crossings}
      {corners}
      <Grass position={[0, -0.09, 0]} scale={[1000, 1, 1000]} />
    </group>
  )
}
