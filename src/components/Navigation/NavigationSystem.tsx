import { useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { useGridBuilder, type GridBounds } from "../../hooks/useGridBuilder";
import { useMiniMap } from "../../hooks/useMiniMap";
import { usePathfinding, type GridCell } from "../../hooks/usePathfinding";
import { usePathVisualizer } from "../../hooks/usePathVisualizer";

interface NavigationSystemProps {
  playerRef: MutableRefObject<THREE.Vector3>;
  destinationRef: MutableRefObject<THREE.Vector3>;
  onMiniMapCanvasChange: (canvas: HTMLCanvasElement | null) => void;
}

const BOUNDS_EPSILON = 0.05;
const PATH_SURFACE_OFFSET = 0.04;

function boundsApproximatelyEqual(a: GridBounds | null, b: GridBounds | null): boolean {
  if (!a || !b) {
    return a === b;
  }
  return (
    Math.abs(a.min.x - b.min.x) < BOUNDS_EPSILON &&
    Math.abs(a.min.z - b.min.z) < BOUNDS_EPSILON &&
    Math.abs(a.max.x - b.max.x) < BOUNDS_EPSILON &&
    Math.abs(a.max.z - b.max.z) < BOUNDS_EPSILON
  );
}

function computeRoadBounds(scene: THREE.Scene): GridBounds | null {
  const box = new THREE.Box3();
  let hasRoad = false;

  scene.traverse((object) => {
    if ((object as THREE.Mesh).isMesh && object.userData.isRoadSurface) {
      box.expandByObject(object);
      hasRoad = true;
    }
  });

  if (!hasRoad) {
    return null;
  }

  box.expandByScalar(1.2);

  return {
    min: { x: box.min.x, z: box.min.z },
    max: { x: box.max.x, z: box.max.z },
  };
}

export function NavigationSystem({
  playerRef,
  destinationRef,
  onMiniMapCanvasChange,
}: NavigationSystemProps) {
  const { scene } = useThree();
  const [bounds, setBounds] = useState<GridBounds | null>(null);

  const miniMap = useMiniMap(scene, playerRef, destinationRef, {
    size: 220,
    padding: 24,
    visibleLayers: [0, 2],
  });
  const gridData = useGridBuilder(scene, bounds, { cellSize: 1.2 });
  const { findPath } = usePathfinding(gridData);
  const { updatePath, clear: clearPath } = usePathVisualizer(scene, {
    mode: "line",
    color: 0x0d1a8c,
    layer: 2,
  });

  const lastPathCellsRef = useRef<GridCell[]>([]);
  const lastPathKeyRef = useRef<string | null>(null);
  const lastPlayerPositionRef = useRef(new THREE.Vector3(Number.NaN, Number.NaN, Number.NaN));
  const lastDestinationPositionRef = useRef(new THREE.Vector3(Number.NaN, Number.NaN, Number.NaN));

  const resolveCell = (position: THREE.Vector3): GridCell | null => {
    const candidate = gridData.worldToCell(position);
    if (!candidate) {
      return null;
    }

    const { grid, rows, cols, surfacePoints } = gridData;

    const checkAndScore = (row: number, col: number) => {
      if (row < 0 || row >= rows || col < 0 || col >= cols) {
        return null;
      }
      if (grid[row][col] !== 1) {
        return null;
      }
      const point = surfacePoints[row]?.[col];
      if (!point) {
        return null;
      }
      const dx = position.x - point.x;
      const dz = position.z - point.z;
      return { cell: { row, col }, distanceSq: dx * dx + dz * dz } as const;
    };

    const directHit = checkAndScore(candidate.row, candidate.col);
    if (directHit) {
      return directHit.cell;
    }

    const maxRadius = 6;
    let best: { row: number; col: number } | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let radius = 1; radius <= maxRadius; radius += 1) {
      let foundAtCurrentRadius = false;
      for (let deltaRow = -radius; deltaRow <= radius; deltaRow += 1) {
        for (let deltaCol = -radius; deltaCol <= radius; deltaCol += 1) {
          if (Math.abs(deltaRow) !== radius && Math.abs(deltaCol) !== radius) {
            continue;
          }
          const scored = checkAndScore(candidate.row + deltaRow, candidate.col + deltaCol);
          if (!scored) {
            continue;
          }
          if (scored.distanceSq < bestDistance) {
            bestDistance = scored.distanceSq;
            best = scored.cell;
            foundAtCurrentRadius = true;
          }
        }
      }
      if (foundAtCurrentRadius && best) {
        return best;
      }
    }

    return best;
  };

  useEffect(() => {
    onMiniMapCanvasChange(miniMap.domElement);
    return () => {
      onMiniMapCanvasChange(null);
    };
  }, [miniMap.domElement, onMiniMapCanvasChange]);

  useEffect(() => {
    if (!scene) {
      setBounds(null);
      return undefined;
    }

    let disposed = false;

    const updateBounds = () => {
      if (!scene || disposed) {
        return;
      }
      const nextBounds = computeRoadBounds(scene);
      setBounds((previous) => {
        if (boundsApproximatelyEqual(previous, nextBounds)) {
          return previous;
        }
        return nextBounds;
      });
    };

    updateBounds();
    const interval = window.setInterval(updateBounds, 1000);

    return () => {
      disposed = true;
      window.clearInterval(interval);
    };
  }, [scene]);

  useFrame(() => {
    miniMap.render();

    if (!gridData.ready) {
      clearPath();
      lastPathKeyRef.current = null;
      lastPathCellsRef.current = [];
      return;
    }

    const playerPosition = playerRef.current;
    const destinationPosition = destinationRef.current;
    const hasDestination = Number.isFinite(destinationPosition.x) && Number.isFinite(destinationPosition.z);

    if (!playerPosition || !hasDestination) {
      clearPath();
      lastPathKeyRef.current = null;
      lastPathCellsRef.current = [];
      lastDestinationPositionRef.current.set(Number.NaN, Number.NaN, Number.NaN);
      return;
    }

    const startCell = resolveCell(playerPosition);
    const goalCell = resolveCell(destinationPosition);

    if (!startCell || !goalCell) {
      clearPath();
      lastPathKeyRef.current = null;
      lastPathCellsRef.current = [];
      return;
    }

    const pathKey = `${startCell.row}:${startCell.col}-${goalCell.row}:${goalCell.col}-${gridData.version}`;
    const hasLastPlayer = Number.isFinite(lastPlayerPositionRef.current.x);
    const hasLastDestination = Number.isFinite(lastDestinationPositionRef.current.x);
    const playerMoved = !hasLastPlayer ||
      playerPosition.distanceTo(lastPlayerPositionRef.current) > gridData.cellSize * 0.35;
    const destinationMoved = !hasLastDestination ||
      destinationPosition.distanceTo(lastDestinationPositionRef.current) > gridData.cellSize * 0.35;
    const pathUnknown = lastPathCellsRef.current.length === 0;

    let pathChanged = false;
    if (pathKey !== lastPathKeyRef.current || destinationMoved || pathUnknown) {
      const cells = findPath(startCell, goalCell);
      lastPathCellsRef.current = cells;
      lastPathKeyRef.current = pathKey;
      pathChanged = true;
    }

    if (!playerMoved && !destinationMoved && !pathChanged && pathKey === lastPathKeyRef.current && !pathUnknown) {
      return;
    }

    lastPlayerPositionRef.current.copy(playerPosition);
    lastDestinationPositionRef.current.copy(destinationPosition);

    const cells = lastPathCellsRef.current;
    if (cells.length === 0) {
      clearPath();
      return;
    }

    const points = cells.map((cell) => {
      const surfacePoint = gridData.cellToWorld(cell.row, cell.col);
      return new THREE.Vector3(
        surfacePoint.x,
        surfacePoint.y + PATH_SURFACE_OFFSET,
        surfacePoint.z
      );
    });

    if (points.length > 0) {
      const startSurface = gridData.cellToWorld(startCell.row, startCell.col);
      points[0].set(
        startSurface.x,
        startSurface.y + PATH_SURFACE_OFFSET,
        startSurface.z
      );

      const goalSurface = gridData.cellToWorld(goalCell.row, goalCell.col);
      points[points.length - 1].set(
        goalSurface.x,
        goalSurface.y + PATH_SURFACE_OFFSET,
        goalSurface.z
      );
    }

    if (points.length === 1) {
      const only = points[0];
      const duplicate = only.clone();
      duplicate.x += 0.01;
      points.push(duplicate);
    }

    updatePath(points);
  });

  return null;
}
