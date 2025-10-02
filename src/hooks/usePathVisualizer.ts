import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";

export type PathVisualizationMode = "line" | "breadcrumbs";

export interface PathVisualizerOptions {
  mode?: PathVisualizationMode;
  breadcrumbSpacing?: number;
  breadcrumbRadius?: number;
  color?: number;
  layer?: number;
  layers?: number[];
  lineRadius?: number;
}

export interface PathVisualizerHandle {
  updatePath: (points: THREE.Vector3[]) => void;
  clear: () => void;
}

const DEFAULT_COLOR = 0x3ea7ff;
const DEFAULT_LINE_RADIUS = 0.25;

export function usePathVisualizer(
  scene: THREE.Scene | null,
  options?: PathVisualizerOptions
): PathVisualizerHandle {
  const mode = options?.mode ?? "line";
  const color = options?.color ?? DEFAULT_COLOR;
  const breadcrumbRadius = options?.breadcrumbRadius ?? 0.8;
  const configuredLayers = options?.layers?.length ? options.layers : undefined;
  const targetLayers =
    configuredLayers ?? (options?.layer !== undefined ? [options.layer] : [0]);

  const applyLayers = (object: THREE.Object3D) => {
    if (targetLayers.length === 0) {
      object.layers.set(0);
      return;
    }
    object.layers.disableAll();
    object.layers.set(targetLayers[0]);
    for (let index = 1; index < targetLayers.length; index += 1) {
      object.layers.enable(targetLayers[index]);
    }
  };
  const lineRadius = options?.lineRadius ?? DEFAULT_LINE_RADIUS;

  const groupRef = useRef<THREE.Object3D | null>(null);
  const lineRef = useRef<THREE.Mesh | null>(null);
  const breadcrumbsRef = useRef<THREE.Mesh[]>([]);
  const lastLineGeometryRef = useRef<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    if (!scene) {
      return undefined;
    }

    const container = new THREE.Group();
    container.name = "PathVisualizer";
    container.userData.keepOriginalForMinimap = true;
    applyLayers(container);

    if (mode === "line") {
      const geometry = new THREE.BufferGeometry();
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.92,
      });
      material.depthTest = false;
      material.depthWrite = false;
      material.toneMapped = false;
      const mesh = new THREE.Mesh(geometry, material);
      mesh.renderOrder = 20;
      mesh.userData.keepOriginalForMinimap = true;
      applyLayers(mesh);
      mesh.visible = false;
      lineRef.current = mesh;
      lastLineGeometryRef.current = geometry;
      container.add(mesh);
    }

    if (mode === "breadcrumbs") {
      breadcrumbsRef.current = [];
    }

    scene.add(container);
    groupRef.current = container;

    return () => {
      if (mode === "line" && lineRef.current) {
        if (lastLineGeometryRef.current) {
          lastLineGeometryRef.current.dispose();
          lastLineGeometryRef.current = null;
        }
        (lineRef.current.material as THREE.Material).dispose();
        lineRef.current = null;
      }
      if (mode === "breadcrumbs") {
        breadcrumbsRef.current.forEach((mesh) => {
          mesh.geometry.dispose();
          (mesh.material as THREE.Material).dispose();
          if (groupRef.current) {
            groupRef.current.remove(mesh);
          }
        });
        breadcrumbsRef.current = [];
      }
      if (groupRef.current) {
        scene.remove(groupRef.current);
      }
      groupRef.current = null;
    };
  }, [color, mode, scene]);

  const updatePath = useCallback(
    (points: THREE.Vector3[]) => {
      if (!scene) {
        return;
      }

      if (mode === "line") {
        const mesh = lineRef.current;
        if (!mesh) {
          return;
        }
        if (points.length < 2) {
          mesh.visible = false;
          return;
        }
        const curve = new THREE.CatmullRomCurve3(
          points,
          false,
          "catmullrom",
          0.05
        );
        const tubularSegments = Math.max(points.length * 6, 60);
        const geometry = new THREE.TubeGeometry(
          curve,
          tubularSegments,
          lineRadius,
          12,
          false
        );
        const previousGeometry = lastLineGeometryRef.current;
        mesh.geometry = geometry;
        mesh.visible = true;
        if (previousGeometry && previousGeometry !== geometry) {
          previousGeometry.dispose();
        }
        lastLineGeometryRef.current = geometry;
      }

      if (mode === "breadcrumbs") {
        const breadcrumbs = breadcrumbsRef.current;
        const group = groupRef.current as THREE.Group | null;
        if (!group) {
          return;
        }
        const required = points.length;

        while (breadcrumbs.length < required) {
          const geometry = new THREE.CircleGeometry(breadcrumbRadius, 16);
          const material = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.85,
          });
          material.depthTest = false;
          material.depthWrite = false;
          material.toneMapped = false;
          const dot = new THREE.Mesh(geometry, material);
          dot.rotation.x = -Math.PI / 2;
          dot.position.y = 0;
          dot.renderOrder = 100;
          dot.userData.keepOriginalForMinimap = true;
          applyLayers(dot);
          breadcrumbs.push(dot);
          group.add(dot);
        }

        breadcrumbs.forEach((mesh, index) => {
          if (index < required) {
            const point = points[index];
            mesh.visible = true;
            mesh.position.set(point.x, point.y, point.z);
          } else {
            mesh.visible = false;
          }
        });
      }
    },
    [breadcrumbRadius, color, mode, scene]
  );

  const clear = useCallback(() => {
    if (!scene) {
      return;
    }
    if (mode === "line" && lineRef.current) {
      lineRef.current.visible = false;
    }
    if (mode === "breadcrumbs") {
      breadcrumbsRef.current.forEach((mesh) => {
        mesh.visible = false;
      });
    }
  }, [mode, scene]);

  return { updatePath, clear };
}
