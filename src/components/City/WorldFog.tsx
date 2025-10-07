import { useEffect, useMemo } from "react";
import type { JSX } from "react/jsx-runtime";
import { Fog } from "three";
import { useThree } from "@react-three/fiber";

export type WorldFogProps = JSX.IntrinsicElements["group"] & {
  color?: string;
  near?: number;
  far?: number;
};

export function WorldFog({
  color = "#050505",
  near = 40,
  far = 260,
  ...groupProps
}: WorldFogProps) {
  const { scene } = useThree();
  const fog = useMemo(() => new Fog(color, near, far), [color, near, far]);

  useEffect(() => {
    const previousFog = scene.fog;
    scene.fog = fog;
    return () => {
      scene.fog = previousFog ?? null;
    };
  }, [scene, fog]);

  return <group {...groupProps} />;
}
