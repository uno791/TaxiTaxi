import { useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { useCompoundBody } from "@react-three/cannon";
import type { CompoundBodyProps } from "@pmndrs/cannon-worker-api";
import type { Vector3 } from "three";
import { ColliderBox } from "../Taxi/ColliderBox";
import { ColliderCylinder } from "../Taxi/ColliderCylinder";
import {
  useColliderPainter,
  type ColliderDescriptor,
} from "../../tools/ColliderPainter";
import { CITY_SPAWN_POINTS, type CityId } from "../../constants/cities";
import { CITY1_STATIC_COLLIDERS } from "./city1StaticColliders";

type Triplet = [number, number, number];

type ChunkShape = {
  type: "Box";
  position: Triplet;
  args: Triplet;
};

type DebugBox = {
  position: Triplet;
  size: Triplet;
};

type ChunkData = {
  key: string;
  cellX: number;
  cellZ: number;
  shapes: ChunkShape[];
  debugBoxes: DebugBox[];
};

export type City1CollidersProps = ThreeElements["group"] & {
  debug?: boolean;
  playerPositionRef?: MutableRefObject<Vector3>;
};

const CITY_ID: CityId = "city1";
const CHUNK_SIZE = 30;
const CHUNK_RADIUS = 1;
const MAX_CHUNKS_PER_FRAME = 1;

const STATIC_COLLIDER_CHUNKS: ReadonlyMap<string, ChunkData> = (() => {
  const buckets = new Map<string, ChunkData>();

  const getBucket = (cellX: number, cellZ: number) => {
    const key = `${cellX},${cellZ}`;
    const existing = buckets.get(key);
    if (existing) return existing;
    const created: ChunkData = {
      key,
      cellX,
      cellZ,
      shapes: [],
      debugBoxes: [],
    };
    buckets.set(key, created);
    return created;
  };

  for (const collider of CITY1_STATIC_COLLIDERS) {
    const {
      mapPosition: { x, y, z },
    } = collider;
    const cellX = Math.floor(x / CHUNK_SIZE);
    const cellZ = Math.floor(z / CHUNK_SIZE);
    const bucket = getBucket(cellX, cellZ);

    const width =
      collider.shape === "box" ? collider.width : collider.radiusX * 2;
    const length =
      collider.shape === "box" ? collider.length : collider.radiusZ * 2;
    const height = collider.height;

    const position: Triplet = [x, y, z];
    const size: Triplet = [width, height, length];

    bucket.shapes.push({
      type: "Box",
      position,
      args: size,
    });

    bucket.debugBoxes.push({
      position,
      size,
    });
  }

  buckets.forEach((bucket, key) => {
    bucket.shapes = bucket.shapes.map((shape) => ({
      type: shape.type,
      position: [...shape.position] as Triplet,
      args: [...shape.args] as Triplet,
    }));
    bucket.debugBoxes = bucket.debugBoxes.map((box) => ({
      position: [...box.position] as Triplet,
      size: [...box.size] as Triplet,
    }));
    buckets.set(key, bucket);
  });

  return buckets;
})();

const SPAWN_POINT = CITY_SPAWN_POINTS[CITY_ID];
const INITIAL_CELL_X = Math.floor(SPAWN_POINT[0] / CHUNK_SIZE);
const INITIAL_CELL_Z = Math.floor(SPAWN_POINT[2] / CHUNK_SIZE);

function collectChunks(centerCellX: number, centerCellZ: number): ChunkData[] {
  const result: ChunkData[] = [];
  for (let dz = -CHUNK_RADIUS; dz <= CHUNK_RADIUS; dz += 1) {
    for (let dx = -CHUNK_RADIUS; dx <= CHUNK_RADIUS; dx += 1) {
      const key = `${centerCellX + dx},${centerCellZ + dz}`;
      const chunk = STATIC_COLLIDER_CHUNKS.get(key);
      if (!chunk) continue;
      result.push(chunk);
    }
  }
  return result;
}

type ChunkColliderProps = {
  chunk: ChunkData;
  debug?: boolean;
  cityOffset: Triplet;
};

function ChunkCollider({ chunk, debug, cityOffset }: ChunkColliderProps) {
  const [ref] = useCompoundBody(
    () => ({
      type: "Static",
      allowSleep: true,
      shapes: chunk.shapes as unknown as CompoundBodyProps["shapes"],
    }),
    undefined,
    [chunk]
  );

  return (
    <group ref={ref} name={`City1ColliderChunk-${chunk.key}`}>
      {debug
        ? chunk.debugBoxes.map((box, index) => (
            <mesh
              key={`${chunk.key}-debug-${index}`}
              position={[
                box.position[0] - cityOffset[0],
                box.position[1] - cityOffset[1],
                box.position[2] - cityOffset[2],
              ]}
            >
              <boxGeometry args={box.size} />
              <meshBasicMaterial color="orange" transparent opacity={0.3} />
            </mesh>
          ))
        : null}
    </group>
  );
}

function renderPainterCollider(
  collider: ColliderDescriptor,
  key: string,
  renderOffset: { x: number; y: number; z: number },
  debug: boolean
) {
  if (collider.shape === "box") {
    return (
      <ColliderBox
        key={key}
        mapPosition={collider.mapPosition}
        width={collider.width}
        height={collider.height}
        length={collider.length}
        renderOffset={renderOffset}
        debug={debug}
      />
    );
  }

  return (
    <ColliderCylinder
      key={key}
      mapPosition={collider.mapPosition}
      radiusX={collider.radiusX}
      radiusZ={collider.radiusZ}
      height={collider.height}
      segments={collider.segments}
      renderOffset={renderOffset}
      debug={debug}
    />
  );
}

export function City1Colliders({
  debug = false,
  playerPositionRef,
  ...groupProps
}: City1CollidersProps) {
  const { getCollidersForCity } = useColliderPainter();
  const dynamicColliders = getCollidersForCity(CITY_ID);
  const shouldTrackChunks = Boolean(playerPositionRef);

  const positionProp = groupProps.position;
  const renderOffset =
    Array.isArray(positionProp)
      ? {
          x: positionProp[0] ?? 0,
          y: positionProp[1] ?? 0,
          z: positionProp[2] ?? 0,
        }
      : positionProp && typeof positionProp === "object" && "x" in positionProp
      ? {
          x: (positionProp.x as number | undefined) ?? 0,
          y: (positionProp.y as number | undefined) ?? 0,
          z: (positionProp.z as number | undefined) ?? 0,
        }
      : { x: 0, y: 0, z: 0 };
  const cityOffset: Triplet = [renderOffset.x, renderOffset.y, renderOffset.z];

  const initialChunks = useMemo(() => {
    if (!STATIC_COLLIDER_CHUNKS.size) return [];
    if (!shouldTrackChunks) {
      return Array.from(STATIC_COLLIDER_CHUNKS.values());
    }
    return collectChunks(INITIAL_CELL_X, INITIAL_CELL_Z);
  }, [shouldTrackChunks]);

  const [chunkVersion, setChunkVersion] = useState(0);

  const visibleChunkKeysRef = useRef(
    new Set(initialChunks.map((chunk) => chunk.key))
  );
  const targetChunkKeysRef = useRef(new Set(visibleChunkKeysRef.current));
  const currentCellRef = useRef<{ x: number; z: number }>({
    x: INITIAL_CELL_X,
    z: INITIAL_CELL_Z,
  });
  const pendingAdditionsRef = useRef<string[]>([]);
  const pendingRemovalsRef = useRef<string[]>([]);

  const visibleChunks = useMemo(() => {
    if (!STATIC_COLLIDER_CHUNKS.size) return [];
    const chunks: ChunkData[] = [];
    for (const key of visibleChunkKeysRef.current) {
      const chunk = STATIC_COLLIDER_CHUNKS.get(key);
      if (chunk) chunks.push(chunk);
    }
    chunks.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
    return chunks;
  }, [chunkVersion]);

  useFrame(() => {
    if (!shouldTrackChunks) return;
    const reference = playerPositionRef?.current;
    if (!reference) return;
    if (!Number.isFinite(reference.x) || !Number.isFinite(reference.z)) return;

    const cellX = Math.floor(reference.x / CHUNK_SIZE);
    const cellZ = Math.floor(reference.z / CHUNK_SIZE);

    const current = currentCellRef.current;
    if (current.x === cellX && current.z === cellZ) return;

    currentCellRef.current = { x: cellX, z: cellZ };
    const nextChunks = collectChunks(cellX, cellZ);
    const nextKeys = new Set(nextChunks.map((chunk) => chunk.key));
    targetChunkKeysRef.current = nextKeys;

    const visibleKeys = visibleChunkKeysRef.current;
    const additions: string[] = [];
    for (const key of nextKeys) {
      if (!visibleKeys.has(key)) additions.push(key);
    }

    const removals: string[] = [];
    for (const key of visibleKeys) {
      if (!nextKeys.has(key)) removals.push(key);
    }

    const additionsQueue = pendingAdditionsRef.current;
    const removalsQueue = pendingRemovalsRef.current;

    for (const key of additions) {
      if (!additionsQueue.includes(key)) {
        additionsQueue.push(key);
      }
      const removalIndex = removalsQueue.indexOf(key);
      if (removalIndex >= 0) {
        removalsQueue.splice(removalIndex, 1);
      }
    }

    for (const key of removals) {
      if (!removalsQueue.includes(key) && !additionsQueue.includes(key)) {
        removalsQueue.push(key);
      }
    }
  });

  useFrame(() => {
    if (!shouldTrackChunks) return;
    const additionsQueue = pendingAdditionsRef.current;
    const removalsQueue = pendingRemovalsRef.current;
    const visibleKeys = visibleChunkKeysRef.current;
    const targetKeys = targetChunkKeysRef.current;
    let changed = false;
    let processed = 0;

    while (additionsQueue.length > 0 && processed < MAX_CHUNKS_PER_FRAME) {
      const key = additionsQueue.shift();
      if (!key) break;
      if (!targetKeys.has(key)) continue;
      if (visibleKeys.has(key)) continue;
      visibleKeys.add(key);
      changed = true;
      processed += 1;
    }

    if (processed < MAX_CHUNKS_PER_FRAME && additionsQueue.length === 0) {
      while (removalsQueue.length > 0 && processed < MAX_CHUNKS_PER_FRAME) {
        const key = removalsQueue.shift();
        if (!key) break;
        if (targetKeys.has(key)) continue;
        if (!visibleKeys.delete(key)) continue;
        changed = true;
        processed += 1;
      }
    }

    if (changed) {
      setChunkVersion((previous) => (previous + 1) % Number.MAX_SAFE_INTEGER);
    }
  });

  return (
    <group name="City1Colliders" {...groupProps}>
      {visibleChunks.map((chunk) => (
        <ChunkCollider
          key={chunk.key}
          chunk={chunk}
          debug={debug}
          cityOffset={cityOffset}
        />
      ))}
      {dynamicColliders.map((collider) =>
        renderPainterCollider(collider, collider.id, renderOffset, debug)
      )}
    </group>
  );
}
