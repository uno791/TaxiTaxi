import * as THREE from "three";

export interface RoadSurfaceTagOptions {
  /**
   * Custom predicate to decide whether a mesh should be tagged as road surface.
   * If provided, the helper falls back to tagging every mesh only when this predicate
   * returns false for all meshes.
   */
  predicate?: (mesh: THREE.Mesh) => boolean;
  /**
   * Optional substrings that hint the helper toward meshes that represent roads.
   * Checked against mesh names, parent names, and material names.
   */
  includeNameHints?: string[];
  /**
   * When false, the helper will not fall back to tagging every mesh if nothing matched.
   */
  fallbackToAllMeshes?: boolean;
}

const DEFAULT_NAME_HINTS = [
  "road",
  "street",
  "lane",
  "avenue",
  "asphalt",
  "highway",
  "track",
];

function createNameHintPredicate(
  hints: string[]
): (mesh: THREE.Mesh) => boolean {
  const lowered = hints.map((hint) => hint.toLowerCase());

  return (mesh: THREE.Mesh) => {
    const namesToCheck: string[] = [];

    if (mesh.name) {
      namesToCheck.push(mesh.name);
    }

    if (mesh.parent?.name) {
      namesToCheck.push(mesh.parent.name);
    }

    const material = mesh.material;
    if (Array.isArray(material)) {
      for (const item of material) {
        if (item?.name) {
          namesToCheck.push(item.name);
        }
      }
    } else if (material?.name) {
      namesToCheck.push(material.name);
    }

    const haystack = namesToCheck.join(" ").toLowerCase();
    return lowered.some((hint) => haystack.includes(hint));
  };
}

/**
 * Tags meshes in the provided object tree with {@link userData.isRoadSurface} so they can be
 * consumed by the shared navigation/grid builders.
 *
 * Returns the number of meshes tagged as road surfaces.
 */
export function tagRoadSurfaces(
  root: THREE.Object3D | null | undefined,
  options?: RoadSurfaceTagOptions
): number {
  if (!root) {
    return 0;
  }

  const {
    predicate,
    includeNameHints = DEFAULT_NAME_HINTS,
    fallbackToAllMeshes = true,
  } = options ?? {};

  const matcher =
    predicate ??
    (includeNameHints.length > 0
      ? createNameHintPredicate(includeNameHints)
      : () => false);

  const tagged = new Set<THREE.Mesh>();

  root.traverse((object) => {
    if (!(object as THREE.Mesh).isMesh) {
      return;
    }

    const mesh = object as THREE.Mesh;
    if (matcher(mesh)) {
      mesh.userData = { ...mesh.userData, isRoadSurface: true };
      tagged.add(mesh);
    }
  });

  if (tagged.size === 0 && fallbackToAllMeshes) {
    root.traverse((object) => {
      if (!(object as THREE.Mesh).isMesh) {
        return;
      }

      const mesh = object as THREE.Mesh;
      mesh.userData = { ...mesh.userData, isRoadSurface: true };
      tagged.add(mesh);
    });
  }

  return tagged.size;
}
