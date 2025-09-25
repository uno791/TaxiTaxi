import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

export interface LoadedAsset {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
}

const loader = new GLTFLoader();
const cache = new Map<string, Promise<LoadedAsset>>();

function resolveUrl(url: string | URL): string {
  return typeof url === 'string' ? url : url.href;
}

export function loadGLTFAsset(url: string | URL): Promise<LoadedAsset> {
  const href = resolveUrl(url);
  if (!cache.has(href)) {
    cache.set(
      href,
      new Promise<LoadedAsset>((resolve, reject) => {
        loader.load(
          href,
          (gltf: GLTF) => {
            const scene = (gltf.scene ?? new THREE.Group()) as THREE.Group;
            const animations = gltf.animations || [];
            resolve({ scene, animations });
          },
          undefined,
          reject
        );
      })
    );
  }
  return cache.get(href)!.then((asset) => {
    const clonedScene = clone(asset.scene) as THREE.Group;
    return {
      scene: clonedScene,
      animations: asset.animations,
    } satisfies LoadedAsset;
  });
}
