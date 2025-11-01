import { useMemo } from "react";
import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";
import { tagRoadSurfaces } from "../../../utils/markRoadSurfaces";

const MODEL_URL = `${import.meta.env.BASE_URL}models/4blocksV3.glb`;

export function RoadLevel2(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF(MODEL_URL);
  const preparedScene = useMemo(() => {
    tagRoadSurfaces(scene, { includeNameHints: ["road"] });
    return scene;
  }, [scene]);

  return (
    <group {...props}>
      <Clone object={preparedScene} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
