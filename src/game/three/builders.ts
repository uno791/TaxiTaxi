import * as THREE from 'three';
import { loadGLTFAsset } from './assetLoader';

const TAXI_MODEL_URL = new URL('../assets/Taxi.glb', import.meta.url);

export function createParkingMarker(options: { radius?: number; height?: number; color?: number } = {}): THREE.Mesh {
  const {
    radius = 2.4,
    height = 0.6,
    color = 0x5bc2ff,
  } = options;

  const geometry = new THREE.CylinderGeometry(radius, radius, height, 32, 1, true);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const marker = new THREE.Mesh(geometry, material);
  marker.position.y = height / 2;
  return marker;
}

export function createTaxiModel(): THREE.Group {
  const car = new THREE.Group();

  // Low-poly proxy so gameplay works while the GLB streams in.
  const proxyMaterial = new THREE.MeshStandardMaterial({ color: 0x353535, roughness: 0.9 });
  const proxyBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 2.4), proxyMaterial);
  proxyBody.position.y = 0.4;
  car.add(proxyBody);

  loadGLTFAsset(TAXI_MODEL_URL)
    .then(({ scene }) => {
      const model = scene;
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });

      const baseBox = new THREE.Box3().setFromObject(model);
      const originalSize = baseBox.getSize(new THREE.Vector3());
      const targetLength = 4.2;
      const scale = targetLength / originalSize.z;
      model.scale.setScalar(scale);

      const scaledBox = new THREE.Box3().setFromObject(model);
      const center = scaledBox.getCenter(new THREE.Vector3());
      const scaledSize = scaledBox.getSize(new THREE.Vector3());
      model.position.sub(center);
      model.position.y += scaledSize.y / 2;

      while (car.children.length > 0) {
        car.remove(car.children[0]);
      }
      car.add(model);
    })
    .catch((error) => {
      console.error('Failed to load taxi model', error);
    });

  return car;
}

export function createHouseStructure(options: { width?: number; depth?: number } = {}): THREE.Group {
  const { width = 6, depth = 5 } = options;
  const house = new THREE.Group();

  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3b2525, roughness: 0.85 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, 3, depth), bodyMaterial);
  body.position.y = 1.5;
  house.add(body);

  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x562222, roughness: 0.95 });
  const roof = new THREE.Mesh(new THREE.ConeGeometry(width * 0.75, 2.2, 4), roofMaterial);
  roof.position.y = 3 + 1.1;
  roof.rotation.y = Math.PI / 4;
  house.add(roof);

  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0xb4d4ff,
    emissive: 0x1b2a47,
    emissiveIntensity: 0.5,
    roughness: 0.2,
  });
  const windowGeometry = new THREE.PlaneGeometry(1.2, 1.4);
  const leftWindow = new THREE.Mesh(windowGeometry, windowMaterial);
  leftWindow.position.set(-width * 0.35, 1.6, depth * 0.5 + 0.01);
  house.add(leftWindow);
  const rightWindow = leftWindow.clone();
  rightWindow.position.x = width * 0.35;
  house.add(rightWindow);

  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x1a120d, roughness: 0.6 });
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.2), doorMaterial);
  door.position.set(0, 1.1, depth * 0.5 + 0.015);
  house.add(door);

  const awningMaterial = new THREE.MeshStandardMaterial({ color: 0x2f1a1a, roughness: 0.4 });
  const awning = new THREE.Mesh(new THREE.BoxGeometry(width * 0.6, 0.25, 1.1), awningMaterial);
  awning.position.set(0, 2.1, depth * 0.5 + 0.55);
  house.add(awning);

  return house;
}

interface HousePlotOptions {
  pathLength?: number;
  width?: number;
  depth?: number;
  orientation?: number;
  porchLightColor?: number;
}

export function createHousePlot(position: THREE.Vector3, options: HousePlotOptions = {}): THREE.Group {
  const {
    pathLength = 10,
    width = 6,
    depth = 5,
    orientation = 0,
    porchLightColor = 0xffc173,
  } = options;

  const group = new THREE.Group();
  const house = createHouseStructure({ width, depth });

  const pathGeometry = new THREE.PlaneGeometry(2.4, pathLength);
  const pathMaterial = new THREE.MeshStandardMaterial({ color: 0x2c2c31, roughness: 1.0 });
  const path = new THREE.Mesh(pathGeometry, pathMaterial);
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.02, pathLength * 0.5);
  path.receiveShadow = true;
  group.add(path);

  const stepGeometry = new THREE.BoxGeometry(2.2, 0.2, 1.2);
  const stepMaterial = new THREE.MeshStandardMaterial({ color: 0x1d1d20, roughness: 0.8 });
  const step = new THREE.Mesh(stepGeometry, stepMaterial);
  step.position.set(0, 0.1, pathLength + depth * 0.5 - 0.6);
  step.castShadow = true;
  step.receiveShadow = true;
  group.add(step);

  const porchLight = new THREE.PointLight(porchLightColor, 0.8, 12, 2);
  porchLight.position.set(0, 2.4, pathLength + depth * 0.5 + 0.4);
  group.add(porchLight);

  house.position.set(0, 0, pathLength + depth * 0.5);
  group.add(house);

  const outlineGeometry = new THREE.PlaneGeometry(width + 2, depth + 2);
  const outlineMaterial = new THREE.MeshStandardMaterial({ color: 0x202022, roughness: 1 });
  const yard = new THREE.Mesh(outlineGeometry, outlineMaterial);
  yard.rotation.x = -Math.PI / 2;
  yard.position.set(0, 0.01, pathLength + depth * 0.5);
  yard.receiveShadow = true;
  group.add(yard);

  group.position.copy(position);
  group.rotation.y = orientation;

  return group;
}

export function createRoadSurface(length = 800, width = 10): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(width, length, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x1b1b1f, roughness: 1.0 });
  const road = new THREE.Mesh(geometry, material);
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0;
  return road;
}

export function createRoadStripes(count = 25, spacing = 20): THREE.Mesh[] {
  const stripes: THREE.Mesh[] = [];
  const geometry = new THREE.PlaneGeometry(0.5, 6);
  const material = new THREE.MeshStandardMaterial({ color: 0xf9f4d0 });

  const offset = (count * spacing) / 2;
  for (let i = 0; i < count; i += 1) {
    const stripe = new THREE.Mesh(geometry, material);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(0, 0.01, i * spacing - offset);
    stripe.receiveShadow = true;
    stripes.push(stripe);
  }

  return stripes;
}

export function createFogBillboard(): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(200, 80, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0x111111,
    transparent: true,
    opacity: 0.05,
    depthWrite: false,
  });
  const fog = new THREE.Mesh(geometry, material);
  fog.position.set(0, 30, -200);
  return fog;
}
