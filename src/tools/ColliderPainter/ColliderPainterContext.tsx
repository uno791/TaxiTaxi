import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { CityId } from "../../constants/cities";
import { CITY_SEQUENCE } from "../../constants/cities";
import type {
  ColliderDescriptor,
  ColliderRecord,
  ColliderShape,
} from "./types";

type CollidersByCity = Record<CityId, ColliderRecord[]>;

type ColliderPainterContextValue = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  toggleEnabled: () => void;
  shape: ColliderShape;
  setShape: (shape: ColliderShape) => void;
  cameraHeight: number;
  adjustCameraHeight: (delta: number) => void;
  collidersByCity: CollidersByCity;
  getCollidersForCity: (cityId: CityId) => ColliderRecord[];
  addCollider: (collider: ColliderDescriptor & { cityId: CityId }) => void;
  clearCity: (cityId: CityId) => void;
  serializeCity: (cityId: CityId) => string;
  copyCityToClipboard: (cityId: CityId) => Promise<void>;
  activeCity: CityId;
};

const STORAGE_KEY = "taxi-taxi-collider-painter-state";

function createDefaultState(): CollidersByCity {
  return CITY_SEQUENCE.reduce<CollidersByCity>((accumulator, city) => {
    return { ...accumulator, [city]: [] };
  }, {} as CollidersByCity);
}

const ColliderPainterContext =
  createContext<ColliderPainterContextValue | null>(null);

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `collider-${Math.random().toString(36).slice(2, 10)}`;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeCollidersList(
  list: unknown,
  cityId: CityId,
): ColliderRecord[] {
  if (!Array.isArray(list)) return [];

  const normalized: ColliderRecord[] = [];

  for (const entry of list) {
    if (!entry || (entry.shape !== "box" && entry.shape !== "cylinder")) {
      continue;
    }

    const position = entry.mapPosition;
    if (
      !position ||
      !isFiniteNumber(position.x) ||
      !isFiniteNumber(position.y) ||
      !isFiniteNumber(position.z)
    ) {
      continue;
    }

    if (!isFiniteNumber(entry.height)) {
      continue;
    }

    const baseRecord = {
      id: typeof entry.id === "string" ? entry.id : generateId(),
      cityId,
      createdAt:
        typeof entry.createdAt === "number" ? entry.createdAt : Date.now(),
      mapPosition: {
        x: position.x,
        y: position.y,
        z: position.z,
      },
      height: entry.height as number,
    } as const;

    if (entry.shape === "box") {
      if (!isFiniteNumber(entry.width) || !isFiniteNumber(entry.length)) {
        continue;
      }

      normalized.push({
        ...baseRecord,
        shape: "box",
        width: entry.width,
        length: entry.length,
      });
      continue;
    }

    if (!isFiniteNumber(entry.radiusX) || !isFiniteNumber(entry.radiusZ)) {
      continue;
    }

    const segments = isFiniteNumber(entry.segments) ? entry.segments : 32;

    normalized.push({
      ...baseRecord,
      shape: "cylinder",
      radiusX: entry.radiusX,
      radiusZ: entry.radiusZ,
      segments,
    });
  }

  return normalized;
}

type ColliderPainterProviderProps = {
  activeCity: CityId;
  children: ReactNode;
};

export function ColliderPainterProvider({
  activeCity,
  children,
}: ColliderPainterProviderProps) {
  const [enabled, setEnabled] = useState(false);
  const [shape, setShape] = useState<ColliderShape>("box");
  const [cameraHeight, setCameraHeight] = useState(60);
  const [collidersByCity, setCollidersByCity] = useState<CollidersByCity>(() => {
    if (typeof window === "undefined") return createDefaultState();
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return createDefaultState();
      const parsed = JSON.parse(stored) as Partial<CollidersByCity>;
      const base = createDefaultState();
      (Object.keys(parsed) as CityId[]).forEach((cityId) => {
        base[cityId] = normalizeCollidersList(parsed[cityId], cityId);
      });
      return base;
    } catch {
      return createDefaultState();
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(collidersByCity)
      );
    } catch {
      // ignore quota errors
    }
  }, [collidersByCity]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      ) {
        return;
      }

      if (event.key === "'") {
        event.preventDefault();
        setEnabled((previous) => !previous);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const getCollidersForCity = useCallback(
    (cityId: CityId) => collidersByCity[cityId] ?? [],
    [collidersByCity]
  );

  const addCollider = useCallback(
    (collider: ColliderDescriptor & { cityId: CityId }) => {
      setCollidersByCity((previous) => {
        const id = generateId();
        const entry: ColliderRecord = {
          ...collider,
          id,
          createdAt: Date.now(),
        };
        const existing = previous[collider.cityId] ?? [];
        return {
          ...previous,
          [collider.cityId]: [...existing, entry],
        };
      });
    },
    []
  );

  const clearCity = useCallback((cityId: CityId) => {
    setCollidersByCity((previous) => {
      if (!previous[cityId]?.length) return previous;
      return { ...previous, [cityId]: [] };
    });
  }, []);

  const adjustCameraHeight = useCallback((delta: number) => {
    setCameraHeight((previous) => Math.max(5, previous + delta));
  }, []);

  const serializeCity = useCallback(
    (cityId: CityId) => {
      const colliders = getCollidersForCity(cityId);
      if (!colliders.length) return "[]";

      const formatNumber = (value: number) => {
        const rounded = Math.round(value * 1000) / 1000;
        return Number.isInteger(rounded) ? rounded.toString() : rounded;
      };

      const serializeDescriptor = (
        descriptor: ColliderDescriptor,
      ): string | null => {
        const position = descriptor.mapPosition;
        const common = `  mapPosition: { x: ${formatNumber(position.x)}, y: ${formatNumber(
          position.y
        )}, z: ${formatNumber(position.z)} },\n  height: ${formatNumber(
          descriptor.height
        )},`;

        if (descriptor.shape === "box") {
          if (
            typeof descriptor.width !== "number" ||
            typeof descriptor.length !== "number"
          ) {
            return null;
          }
          return `{
  shape: "box",
${common}
  width: ${formatNumber(descriptor.width)},
  length: ${formatNumber(descriptor.length)},
}`;
        }

        if (
          typeof descriptor.radiusX !== "number" ||
          typeof descriptor.radiusZ !== "number"
        ) {
          return null;
        }

        return `{
  shape: "cylinder",
${common}
  radiusX: ${formatNumber(descriptor.radiusX)},
  radiusZ: ${formatNumber(descriptor.radiusZ)},
  segments: ${descriptor.segments},
}`;
      };

      return `[
${colliders
  .map(
    ({ cityId: _cityId, id: _id, createdAt: _createdAt, ...descriptor }) =>
      serializeDescriptor(descriptor as ColliderDescriptor),
  )
  .filter((entry): entry is string => Boolean(entry))
  .join(",\n")}
]`;
    },
    [getCollidersForCity]
  );

  const copyCityToClipboard = useCallback(
    async (cityId: CityId) => {
      const payload = serializeCity(cityId);
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(payload);
          // eslint-disable-next-line no-console
          console.info(
            `[ColliderPainter] Copied ${cityId} colliders to clipboard.`,
            payload
          );
          return;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn(
            "[ColliderPainter] Failed to copy to clipboard. See payload below."
          );
        }
      }
      // eslint-disable-next-line no-console
      console.info(`[ColliderPainter] ${cityId} colliders:\n${payload}`);
    },
    [serializeCity]
  );

  const value = useMemo<ColliderPainterContextValue>(
    () => ({
      enabled,
      setEnabled,
      toggleEnabled: () => setEnabled((previous) => !previous),
      shape,
      setShape,
      cameraHeight,
      adjustCameraHeight,
      collidersByCity,
      getCollidersForCity,
      addCollider,
      clearCity,
      serializeCity,
      copyCityToClipboard,
      activeCity,
    }),
    [
      enabled,
      shape,
      cameraHeight,
      collidersByCity,
      getCollidersForCity,
      addCollider,
      clearCity,
      serializeCity,
      copyCityToClipboard,
      activeCity,
    ]
  );

  useEffect(() => {
    if (enabled) {
      // eslint-disable-next-line no-console
      console.info(
        "[ColliderPainter] Editing mode enabled. Press 3 for boxes, 4 for cylinders, click-drag to add."
      );
    }
  }, [enabled]);

  useEffect(() => {
    (window as any).colliderPainter = {
      state: collidersByCity,
      serialize: serializeCity,
    };
    return () => {
      delete (window as any).colliderPainter;
    };
  }, [collidersByCity, serializeCity]);

  return (
    <ColliderPainterContext.Provider value={value}>
      {children}
    </ColliderPainterContext.Provider>
  );
}

export function useColliderPainter() {
  const context = useContext(ColliderPainterContext);
  if (!context) {
    throw new Error(
      "useColliderPainter must be used within a ColliderPainterProvider"
    );
  }
  return context;
}
