import type { JSX } from "react/jsx-runtime";
import { StreetLight } from "./SceneObjects/StreetLight";
import {
  StreetLightEmitter,
  type StreetLightEmitterProps,
} from "./SceneObjects/StreetLightEmitter";

type LitStreetLightProps = JSX.IntrinsicElements["group"] & {
  emitterOffset?: [number, number, number];
  emitterProps?: Partial<
    Omit<StreetLightEmitterProps, keyof JSX.IntrinsicElements["group"]>
  >;
};

function LitStreetLight({
  emitterOffset = [-0.2, 0.905, 0],
  emitterProps,
  ...groupProps
}: LitStreetLightProps) {
  return (
    <group {...groupProps}>
      <StreetLight />
      <StreetLightEmitter position={emitterOffset} {...emitterProps} />
    </group>
  );
}

type StreetLightConfig = {
  key: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
};

const STREET_LIGHTS: StreetLightConfig[] = [
  {
    key: "street-light-01",
    position: [0, 0, -13.1],
    rotation: [0, Math.PI / 2, 0],
    scale: 2.3,
  },
  {
    key: "street-light-02",
    position: [-13.4, 0, -13.1],
    rotation: [0, Math.PI / 2, 0],
    scale: 2.3,
  },
  {
    key: "street-light-03",
    position: [-26.8, 0, -12.8],
    rotation: [0, Math.PI * 2.7, 0],
    scale: 2.3,
  },
  {
    key: "street-light-04",
    position: [-15.2, 0, -6.8],
    rotation: [0, Math.PI * 1.3, 0],
    scale: 2.3,
  },
  {
    key: "street-light-05",
    position: [-30.8, 0, -6.8],
    rotation: [0, Math.PI * 1.75, 0],
    scale: 2.3,
  },
  {
    key: "street-light-06",
    position: [-30.8, 0, 10.8],
    rotation: [0, Math.PI * 2.2, 0],
    scale: 2.3,
  },
  {
    key: "street-light-07",
    position: [-15.2, 0, 10.8],
    rotation: [0, Math.PI * 2.7, 0],
    scale: 2.3,
  },
  {
    key: "street-light-08",
    position: [-6, 0, 2.9],
    rotation: [0, Math.PI / 2, 0],
    scale: 2.3,
  },
  {
    key: "street-light-09",
    position: [9, 0, 2.9],
    rotation: [0, Math.PI / 2, 0],
    scale: 2.3,
  },
  {
    key: "street-light-10",
    position: [17.8, 0, 2.9],
    rotation: [0, Math.PI / 2, 0],
    scale: 2.3,
  },
  {
    key: "street-light-11",
    position: [10.9, 0, -4],
    rotation: [0, Math.PI, 0],
    scale: 2.3,
  },
  {
    key: "street-light-12",
    position: [10.9, 0, -34],
    rotation: [0, Math.PI, 0],
    scale: 2.3,
  },
  {
    key: "street-light-13",
    position: [4, 0, -38.9],
    rotation: [0, Math.PI * 1.5, 0],
    scale: 2.3,
  },
  {
    key: "street-light-14",
    position: [9, 0, -43],
    rotation: [0, Math.PI * 1.77, 0],
    scale: 2.3,
  },
  {
    key: "street-light-15",
    position: [9.1, 0, -54.9],
    rotation: [0, Math.PI * 1.77, 0],
    scale: 2.3,
  },
  {
    key: "street-light-16",
    position: [10.9, 0, -54.9],
    rotation: [0, Math.PI * 1.33, 0],
    scale: 2.3,
  },
  {
    key: "street-light-17",
    position: [6.9, 0, -60.9],
    rotation: [0, Math.PI * 1.33, 0],
    scale: 2.3,
  },
  {
    key: "street-light-18",
    position: [-10.9, 0, -60.9],
    rotation: [0, Math.PI * 1.77, 0],
    scale: 2.3,
  },
  {
    key: "street-light-19",
    position: [-10.9, 0, -45.1],
    rotation: [0, Math.PI * 2.33, 0],
    scale: 2.3,
  },
  {
    key: "street-light-20",
    position: [18.5, 0, -55.1],
    rotation: [0, Math.PI / 2, 0],
    scale: 2.3,
  },
  {
    key: "street-light-21",
    position: [35, 0, -55.1],
    rotation: [0, Math.PI / 2, 0],
    scale: 2.3,
  },
  {
    key: "street-light-22",
    position: [50, 0, -55.1],
    rotation: [0, Math.PI / 2, 0],
    scale: 2.3,
  },
  {
    key: "street-light-23",
    position: [50, 0, -60.9],
    rotation: [0, Math.PI * 1.5, 0],
    scale: 2.3,
  },
  {
    key: "street-light-24",
    position: [54.9, 0, -58],
    rotation: [0, Math.PI, 0],
    scale: 2.3,
  },
  {
    key: "street-light-25",
    position: [63.1, 0, -58],
    rotation: [0, Math.PI * 2, 0],
    scale: 2.3,
  },
  {
    key: "street-light-26",
    position: [63.1, 0, -50],
    rotation: [0, Math.PI * 2, 0],
    scale: 2.3,
  },
  {
    key: "street-light-27",
    position: [63.1, 0, -40.9],
    rotation: [0, Math.PI * 1.77, 0],
    scale: 2.3,
  },
  {
    key: "street-light-28",
    position: [57, 0, -35],
    rotation: [0, Math.PI * 1.77, 0],
    scale: 2.3,
  },
  {
    key: "street-light-29",
    position: [50, 0, -34.9],
    rotation: [0, Math.PI * 1.5, 0],
    scale: 2.3,
  },
  {
    key: "street-light-30",
    position: [50, 0, -40.9],
    rotation: [0, Math.PI * 1.5, 0],
    scale: 2.3,
  },
  {
    key: "street-light-31",
    position: [42.9, 0, -40.9],
    rotation: [0, Math.PI * 1.33, 0],
    scale: 2.3,
  },
  {
    key: "street-light-32",
    position: [41, 0, -17],
    rotation: [0, Math.PI * 2, 0],
    scale: 2.3,
  },
  {
    key: "street-light-33",
    position: [27, 0, -17],
    rotation: [0, Math.PI * 2.77, 0],
    scale: 2.3,
  },
  {
    key: "street-light-34",
    position: [29.1, 0, 0.9],
    rotation: [0, Math.PI * 2.33, 0],
    scale: 2.3,
  },
  {
    key: "street-light-35",
    position: [38, 0, 0.9],
    rotation: [0, Math.PI / 2, 0],
    scale: 2.3,
  },
  {
    key: "street-light-36",
    position: [46.9, 0, 0.9],
    rotation: [0, Math.PI / 1.33, 0],
    scale: 2.3,
  },
  {
    key: "street-light-37",
    position: [46.9, 0, -14.9],
    rotation: [0, Math.PI * 1.33, 0],
    scale: 2.3,
  },
  {
    key: "street-light-38",
    position: [30, 0, -18.9],
    rotation: [0, Math.PI * 1.5, 0],
    scale: 2.3,
  },
];

export default function StreetLights(props: JSX.IntrinsicElements["group"]) {
  return (
    <group {...props}>
      <group>
        {STREET_LIGHTS.map(({ key, position, rotation, scale }) => (
          <LitStreetLight
            key={key}
            position={position}
            rotation={rotation}
            scale={scale}
          />
        ))}
      </group>
    </group>
  );
}
