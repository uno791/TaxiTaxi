export type CarData = {
  name: string;
  modelPath: string;
  requiredLevel: number;
  scale: number;
  offset: [number, number, number];
};

export const cars: CarData[] = [
  {
    name: "Taxi",
    modelPath: "/models/Taxi.glb",
    requiredLevel: 1,
    scale: 0.3,
    offset: [0, -0.11, 0.02],
  },
  {
    name: "Convertible",
    modelPath: "/models/Convertible.glb",
    requiredLevel: 2,
    scale: 0.1,
    offset: [0, 0.01, 0],
  },
  {
    name: "Nissan GTR",
    modelPath: "/models/Nissan GTR.glb",
    requiredLevel: 2,
    scale: 0.17,
    offset: [0, 0.08, 0],
  },

  {
    name: "Ferrari F40",
    modelPath: "/models/Ferrari F40.glb",
    requiredLevel: 2,
    scale: 0.12,
    offset: [0, -0.07, 0],
  },
  {
    name: "Lamborghini",
    modelPath: "/models/lamborghini.glb",
    requiredLevel: 3,
    scale: 0.002,
    offset: [0, 0.08, 0],
  },
  {
    name: "Rolls Royce",
    modelPath: "/models/Rolls Royce.glb",
    requiredLevel: 3,
    scale: 0.006,
    offset: [0, 0.12, 0],
  },
];
