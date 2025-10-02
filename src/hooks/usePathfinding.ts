import { useCallback, useMemo } from "react";

import type { GridData } from "./useGridBuilder";

export interface GridCell {
  row: number;
  col: number;
}

interface Node extends GridCell {
  g: number;
  f: number;
  parent?: Node;
}

const NEIGHBOURS: Array<[number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function cellKey(cell: GridCell): string {
  return `${cell.row}:${cell.col}`;
}

export interface PathfindingHandle {
  findPath: (start: GridCell | null, goal: GridCell | null) => GridCell[];
}

export function usePathfinding(gridData: GridData): PathfindingHandle {
  const findPath = useCallback(
    (start: GridCell | null, goal: GridCell | null) => {
      if (!gridData.ready || !start || !goal) {
        return [];
      }

      const { grid, rows, cols } = gridData;

      if (grid[start.row]?.[start.col] !== 1 || grid[goal.row]?.[goal.col] !== 1) {
        return [];
      }

      const openSet = new Map<string, Node>();
      const openArray: Node[] = [];
      const closedSet = new Set<string>();

      const heuristic = (cell: GridCell) => Math.abs(cell.row - goal.row) + Math.abs(cell.col - goal.col);

      const startNode: Node = { ...start, g: 0, f: heuristic(start) };
      openSet.set(cellKey(start), startNode);
      openArray.push(startNode);

      while (openArray.length > 0) {
        openArray.sort((a, b) => a.f - b.f);
        const current = openArray.shift()!;
        const key = cellKey(current);

        if (current.row === goal.row && current.col === goal.col) {
          const path: GridCell[] = [];
          let node: Node | undefined = current;
          while (node) {
            path.push({ row: node.row, col: node.col });
            node = node.parent;
          }
          path.reverse();
          return path;
        }

        openSet.delete(key);
        closedSet.add(key);

        for (const [dr, dc] of NEIGHBOURS) {
          const nextRow = current.row + dr;
          const nextCol = current.col + dc;

          if (nextRow < 0 || nextRow >= rows || nextCol < 0 || nextCol >= cols) {
            continue;
          }
          if (grid[nextRow][nextCol] !== 1) {
            continue;
          }

          const neighbourKey = cellKey({ row: nextRow, col: nextCol });
          if (closedSet.has(neighbourKey)) {
            continue;
          }

          const tentativeG = current.g + 1;
          const existing = openSet.get(neighbourKey);

          if (existing && tentativeG >= existing.g) {
            continue;
          }

          const neighbourNode: Node = {
            row: nextRow,
            col: nextCol,
            g: tentativeG,
            f: tentativeG + heuristic({ row: nextRow, col: nextCol }),
            parent: current,
          };

          openSet.set(neighbourKey, neighbourNode);
          if (!existing) {
            openArray.push(neighbourNode);
          }
        }
      }

      return [];
    },
    [gridData]
  );

  return useMemo(
    () => ({
      findPath,
    }),
    [findPath]
  );
}
