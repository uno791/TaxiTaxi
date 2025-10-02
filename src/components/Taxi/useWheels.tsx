import { useCompoundBody } from "@react-three/cannon";
import { useRef } from "react";

export const useWheels = (
  width: number,
  height: number,
  front: number,
  radius: number
) => {
  const wheels = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const wheelInfo = {
    radius,
    directionLocal: [0, -1, 0] as [number, number, number],
    axleLocal: [1, 0, 0] as [number, number, number],

    suspensionStiffness: 82,
    suspensionRestLength: 0.16,
    maxSuspensionTravel: 0.22,
    dampingRelaxation: 11,
    dampingCompression: 7.5,
    frictionSlip: 5,
    rollInfluence: 0.03,
    maxSuspensionForce: 3e5,
    customSlidingRotationalSpeed: -25,
    useCustomSlidingRotationalSpeed: true,
  };

  const wheelInfos = [
    {
      ...wheelInfo,
      chassisConnectionPointLocal: [
        -width * 0.65 + 0.1,
        height * 0.4 + 0.01,
        front,
      ],
      isFrontWheel: true,
    },
    {
      ...wheelInfo,
      chassisConnectionPointLocal: [
        width * 0.65 - 0.1,
        height * 0.4 + 0.01,
        front,
      ],
      isFrontWheel: true,
    },
    {
      ...wheelInfo,
      chassisConnectionPointLocal: [
        -width * 0.65 + 0.1,
        height * 0.4 + 0.01,
        -front,
      ],
      isFrontWheel: false,
    },
    {
      ...wheelInfo,
      chassisConnectionPointLocal: [
        width * 0.65 - 0.1,
        height * 0.4 + 0.01,
        -front,
      ],
      isFrontWheel: false,
    },
  ];

  const propsFunc = () => ({
    collisionFilterGroup: 0,
    mass: 1,
    shapes: [
      {
        args: [wheelInfo.radius, wheelInfo.radius, 0.015, 16],
        rotation: [0, 0, -Math.PI / 2],
        type: "Cylinder" as const,
      },
    ],
    type: "Kinematic" as const,
  });

  // Assign compound bodies for wheels (just visual / link bodies)
  useCompoundBody(propsFunc, wheels[0]);
  useCompoundBody(propsFunc, wheels[1]);
  useCompoundBody(propsFunc, wheels[2]);
  useCompoundBody(propsFunc, wheels[3]);

  return [wheels, wheelInfos];
};
