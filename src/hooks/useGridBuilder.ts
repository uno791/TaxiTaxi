import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

const DOWN_VECTOR = new THREE.Vector3(0, -1, 0);
const RAYCAST_HEIGHT = 40;

export interface GridBounds {
  min: { x: number; z: number };
  max: { x: number; z: number };
}

export interface SurfacePoint {
  x: number;
  y: number;
  z: number;
}

export interface GridData {
  grid: number[][];
  rows: number;
  cols: number;
  cellSize: number;
  origin: { x: number; z: number };
  ready: boolean;
  version: number;
  surfacePoints: (SurfacePoint | null)[][];
  worldToCell: (position: THREE.Vector3) => { row: number; col: number } | null;
  cellToWorld: (row: number, col: number) => SurfacePoint;
}

export interface GridBuilderOptions {
  cellSize?: number;
}

const DEFAULT_CELL_SIZE = 1.2;

export function useGridBuilder(
  scene: THREE.Scene | null,
  bounds: GridBounds | null,
  options?: GridBuilderOptions
): GridData {
  const cellSize = options?.cellSize ?? DEFAULT_CELL_SIZE;

  const [gridState, setGridState] = useState<{
    grid: number[][];
    rows: number;
    cols: number;
    version: number;
    origin: { x: number; z: number };
    surfacePoints: (SurfacePoint | null)[][];
  } | null>(null);

  useEffect(() => {
    if (!scene || !bounds) {
      setGridState(null);
      return;
    }

    const origin = { x: bounds.min.x, z: bounds.min.z };
    const width = bounds.max.x - bounds.min.x;
    const depth = bounds.max.z - bounds.min.z;
    const rows = Math.max(1, Math.ceil(depth / cellSize));
    const cols = Math.max(1, Math.ceil(width / cellSize));

    const grid: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));
    const surfacePoints: (SurfacePoint | null)[][] = Array.from({ length: rows }, () =>
      new Array(cols).fill(null)
    );

    const roadMeshes: THREE.Mesh[] = [];
    scene.traverse((object) => {
      if ((object as THREE.Mesh).isMesh && object.userData.isRoadSurface) {
        roadMeshes.push(object as THREE.Mesh);
      }
    });

    if (roadMeshes.length === 0) {
      setGridState({ grid, rows, cols, version: Date.now(), origin, surfacePoints });
      return;
    }

    const raycaster = new THREE.Raycaster();
    const rayOrigin = new THREE.Vector3();
    raycaster.far = RAYCAST_HEIGHT + 5;

    for (let row = 0; row < rows; row += 1) {
      const worldZ = origin.z + (row + 0.5) * cellSize;
      for (let col = 0; col < cols; col += 1) {
        const worldX = origin.x + (col + 0.5) * cellSize;
        rayOrigin.set(worldX, RAYCAST_HEIGHT, worldZ);
        raycaster.set(rayOrigin, DOWN_VECTOR);
        const intersections = raycaster.intersectObjects(roadMeshes, false);
        if (intersections.length === 0) {
          continue;
        }
        const hit = intersections[0];
        grid[row][col] = 1;
        surfacePoints[row][col] = {
          x: hit.point.x,
          y: hit.point.y,
          z: hit.point.z,
        } satisfies SurfacePoint;
      }
    }

    setGridState({ grid, rows, cols, version: Date.now(), origin, surfacePoints });
  }, [bounds, cellSize, scene]);

  return useMemo(() => {
    if (!gridState) {
      return {
        grid: [],
        rows: 0,
        cols: 0,
        cellSize,
        origin: { x: 0, z: 0 },
        ready: false,
        version: 0,
        surfacePoints: [],
        worldToCell: () => null,
        cellToWorld: () => ({ x: 0, y: 0, z: 0 }),
      } satisfies GridData;
    }

    const { grid, rows, cols, version, origin, surfacePoints } = gridState;

    const worldToCell = (position: THREE.Vector3) => {
      const col = Math.floor((position.x - origin.x) / cellSize);
      const row = Math.floor((position.z - origin.z) / cellSize);
      if (col < 0 || col >= cols || row < 0 || row >= rows) {
        return null;
      }
      return { row, col };
    };

    const cellToWorld = (row: number, col: number) => {
      const stored = surfacePoints[row]?.[col];
      if (stored) {
        return stored;
      }
      return {
        x: origin.x + (col + 0.5) * cellSize,
        y: 0,
        z: origin.z + (row + 0.5) * cellSize,
      } satisfies SurfacePoint;
    };

    return {
      grid,
      rows,
      cols,
      cellSize,
      origin,
      ready: true,
      version,
      surfacePoints,
      worldToCell,
      cellToWorld,
    } satisfies GridData;
  }, [cellSize, gridState]);
}
