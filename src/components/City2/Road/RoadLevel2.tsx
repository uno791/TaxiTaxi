import { useMemo } from "react";
import { useGLTF, Clone } from "@react-three/drei";
import type { JSX } from "react/jsx-runtime";
import { tagRoadSurfaces } from "../../../utils/markRoadSurfaces";

export function RoadLevel2(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/4blocksV3.glb");
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

useGLTF.preload("/models/4blocksV3.glb");
