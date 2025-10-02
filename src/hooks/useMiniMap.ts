import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";

export interface MiniMapOptions {
  size?: number;
  padding?: number;
  visibleLayers?: number[];
}

interface SwapEntry {
  mesh: THREE.Mesh;
  material: THREE.Material | THREE.Material[];
}

export interface MiniMapHandle {
  domElement: HTMLCanvasElement | null;
  size: number;
  padding: number;
  render: () => void;
}

const MINIMAP_VIEW_EXTENT = 7;
const MINIMAP_CAMERA_HEIGHT = 20;
const MINIMAP_COLOR_BOOST = 1.35;
const DESTINATION_MARKER_HEIGHT = 0.05;

const TEMP_VEC2 = new THREE.Vector2();
const TEMP_VEC3 = new THREE.Vector3();

function boostColor(color: THREE.Color): THREE.Color {
  const boosted = color.clone().multiplyScalar(MINIMAP_COLOR_BOOST);
  boosted.r = Math.min(boosted.r, 1.2);
  boosted.g = Math.min(boosted.g, 1.2);
  boosted.b = Math.min(boosted.b, 1.2);
  return boosted;
}

function createMinimapMaterialFrom(material: THREE.Material): THREE.Material {
  const base = new THREE.MeshBasicMaterial();
  base.toneMapped = false;
  base.fog = false;
  base.transparent = material.transparent;
  base.opacity = material.opacity;
  base.side = material.side;
  base.depthTest = material.depthTest;
  base.depthWrite = material.depthWrite;
  const baseName = material.name && material.name.length > 0 ? material.name : "mat";
  base.name = `${baseName}__minimap`;

  const typed = material as THREE.MeshStandardMaterial & {
    color?: THREE.Color;
    map?: THREE.Texture | null;
    alphaMap?: THREE.Texture | null;
  };

  if (typed.map) {
    base.map = typed.map;
    base.color.set(0xffffff);
  } else if (typed.color instanceof THREE.Color) {
    base.color.copy(boostColor(typed.color));
  } else {
    base.color.set(0xcfd5e2);
  }

  if (typed.alphaMap) {
    base.alphaMap = typed.alphaMap;
  }

  return base;
}

function createMinimapMaterial(material: THREE.Material | THREE.Material[]): THREE.Material | THREE.Material[] {
  if (Array.isArray(material)) {
    return material.map((mat) => createMinimapMaterialFrom(mat));
  }
  return createMinimapMaterialFrom(material);
}

function isMesh(object: THREE.Object3D): object is THREE.Mesh {
  return (object as THREE.Mesh).isMesh === true;
}

export function useMiniMap(
  scene: THREE.Scene | null,
  playerRef: MutableRefObject<THREE.Vector3>,
  destinationRef: MutableRefObject<THREE.Vector3>,
  options?: MiniMapOptions
): MiniMapHandle {
  const size = options?.size ?? 220;
  const padding = options?.padding ?? 24;
  const visibleLayersSet = new Set<number>((options?.visibleLayers ?? []).concat(0));
  const visibleLayers = Array.from(visibleLayersSet);
  if (!visibleLayers.includes(0)) {
    visibleLayers.push(0);
  }

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const destinationMarkerRef = useRef<THREE.Mesh | null>(null);
  const swapBufferRef = useRef<SwapEntry[]>([]);
  const materialCacheRef = useRef(new Map<number, THREE.Material | THREE.Material[]>());
  const sceneRef = useRef<THREE.Scene | null>(scene);
  sceneRef.current = scene;

  const [domElement, setDomElement] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!scene) {
      return undefined;
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.pointerEvents = "none";
    rendererRef.current = renderer;
    setDomElement(renderer.domElement);

    const camera = new THREE.OrthographicCamera(
      -MINIMAP_VIEW_EXTENT,
      MINIMAP_VIEW_EXTENT,
      MINIMAP_VIEW_EXTENT,
      -MINIMAP_VIEW_EXTENT,
      0.1,
      200
    );
    camera.position.set(0, MINIMAP_CAMERA_HEIGHT, 0);
    camera.up.set(0, 0, -1);
    camera.layers.disableAll();
    visibleLayers.forEach((layer) => {
      camera.layers.enable(layer);
    });
    cameraRef.current = camera;

    const destinationMarker = new THREE.Mesh(
      new THREE.CircleGeometry(2.6, 48),
      new THREE.MeshBasicMaterial({ color: 0xff4d4d })
    );
    destinationMarker.rotation.x = -Math.PI / 2;
    destinationMarker.position.y = DESTINATION_MARKER_HEIGHT;
    destinationMarker.userData.keepOriginalForMinimap = true;
    scene.add(destinationMarker);
    destinationMarkerRef.current = destinationMarker;

    const destination = destinationRef.current;
    if (destination) {
      destinationMarker.position.set(
        destination.x,
        DESTINATION_MARKER_HEIGHT,
        destination.z
      );
    }

    return () => {
      if (rendererRef.current === renderer) {
        rendererRef.current = null;
        setDomElement(null);
      }
      renderer.dispose();

      if (scene) {
        if (destinationMarkerRef.current === destinationMarker) {
          destinationMarkerRef.current = null;
        }
        scene.remove(destinationMarker);
        destinationMarker.geometry.dispose();
        (destinationMarker.material as THREE.Material).dispose();

      }

      materialCacheRef.current.clear();
      swapBufferRef.current = [];
    };
  }, [destinationRef, playerRef, scene, size]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (renderer) {
      renderer.setSize(size, size);
    }
  }, [size]);

  const render = useCallback(() => {
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const currentScene = sceneRef.current;
    const destinationMarker = destinationMarkerRef.current;
    const playerPosition = playerRef.current;

    if (!renderer || !camera || !currentScene || !destinationMarker || !playerPosition) {
      return;
    }

    camera.position.set(playerPosition.x, MINIMAP_CAMERA_HEIGHT, playerPosition.z);
    camera.lookAt(playerPosition.x, 0, playerPosition.z);

    const destination = destinationRef.current;
    const originalDestinationPosition = TEMP_VEC3.copy(destinationMarker.position);
    const originalDestinationVisible = destinationMarker.visible;

    if (destination) {
      const offset = TEMP_VEC2.set(destination.x - playerPosition.x, destination.z - playerPosition.z);
      if (offset.length() > MINIMAP_VIEW_EXTENT) {
        offset.setLength(MINIMAP_VIEW_EXTENT);
        destinationMarker.position.set(
          playerPosition.x + offset.x,
          DESTINATION_MARKER_HEIGHT,
          playerPosition.z + offset.y
        );
      } else {
        destinationMarker.position.set(
          destination.x,
          DESTINATION_MARKER_HEIGHT,
          destination.z
        );
      }
      destinationMarker.visible = true;
    } else {
      destinationMarker.visible = false;
    }

    const swapBuffer = swapBufferRef.current;
    const cache = materialCacheRef.current;
    swapBuffer.length = 0;

    currentScene.traverse((object) => {
      if (!isMesh(object)) {
        return;
      }
      const mesh = object as THREE.Mesh;
      if (mesh.userData.keepOriginalForMinimap) {
        return;
      }
      swapBuffer.push({ mesh, material: mesh.material });
      const cachedMaterial = cache.get(mesh.id);
      if (cachedMaterial) {
        mesh.material = cachedMaterial;
        return;
      }
      const minimapMaterial = createMinimapMaterial(mesh.material as THREE.Material | THREE.Material[]);
      cache.set(mesh.id, minimapMaterial);
      mesh.material = minimapMaterial;
    });

    const originalFog = currentScene.fog;
    currentScene.fog = null;
    renderer.render(currentScene, camera);
    currentScene.fog = originalFog;

    for (let index = 0; index < swapBuffer.length; index += 1) {
      const { mesh, material } = swapBuffer[index];
      mesh.material = material;
    }
    swapBuffer.length = 0;

    destinationMarker.position.copy(originalDestinationPosition);
    destinationMarker.visible = originalDestinationVisible;
  }, [destinationRef, playerRef]);

  return useMemo(
    () => ({
      domElement,
      size,
      padding,
      render,
    }),
    [domElement, padding, render, size]
  );
}
