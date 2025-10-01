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

    suspensionStiffness: 25, // raise for stronger springs
    suspensionRestLength: 0.08, // a bit shorter rest length
    maxSuspensionTravel: 0.15, // allow more travel
    dampingRelaxation: 2.3, // rebound
    dampingCompression: 4.5, // bump
    frictionSlip: 6.5, // moderate grip
    rollInfluence: 0.03, // slight body roll allowed
    maxSuspensionForce: 1e5,
    customSlidingRotationalSpeed: -20,
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
