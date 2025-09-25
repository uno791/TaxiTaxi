import * as THREE from 'three';
import {
  createRoadStripes,
  createRoadSurface,
  createTaxiModel,
  createFogBillboard,
  createHousePlot,
  createParkingMarker,
} from './builders';

export interface EnvironmentAssets {
  car: THREE.Group;
  stripes: THREE.Mesh[];
  mixers: THREE.AnimationMixer[];
  cityBounds: { x: number; z: number };
}

const CITY_BOUNDS = { x: 65, z: 160 };

export function createScene(): THREE.Scene {
  const scene = new THREE.Scene();
  const fogColor = new THREE.Color(0x101018);
  scene.background = fogColor;
  scene.fog = new THREE.FogExp2(fogColor.getHex(), 0.02);
  return scene;
}

export function createCamera(width: number, height: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
  camera.position.set(0, 6, -12);
  camera.lookAt(0, 1, 10);
  return camera;
}

export function createRenderer(width: number, height: number): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  return renderer;
}

export function setupEnvironment(scene: THREE.Scene): EnvironmentAssets {
  const car = createTaxiModel();
  car.castShadow = true;
  scene.add(car);

  const mainRoad = createRoadSurface(320, 14);
  mainRoad.receiveShadow = true;
  mainRoad.position.set(0, 0, 40);
  scene.add(mainRoad);

  const southRoad = createRoadSurface(220, 12);
  southRoad.receiveShadow = true;
  southRoad.position.set(0, 0, -60);
  scene.add(southRoad);

  const eastWestRoad = createRoadSurface(14, 220);
  eastWestRoad.receiveShadow = true;
  eastWestRoad.position.set(0, 0, 20);
  scene.add(eastWestRoad);

  const northConnector = createRoadSurface(12, 180);
  northConnector.receiveShadow = true;
  northConnector.position.set(0, 0, 110);
  scene.add(northConnector);

  const stripes = createRoadStripes();
  stripes.forEach((stripe) => scene.add(stripe));

  const fogWall = createFogBillboard();
  scene.add(fogWall);

  const hemisphere = new THREE.HemisphereLight(0x3c4864, 0x0a0a0f, 0.9);
  scene.add(hemisphere);

  const ambient = new THREE.AmbientLight(0x735d80, 0.45);
  scene.add(ambient);

  const moonLight = new THREE.DirectionalLight(0xd9b6a3, 0.75);
  moonLight.position.set(-18, 24, -26);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(1024, 1024);
  moonLight.shadow.camera.near = 1;
  moonLight.shadow.camera.far = 80;
  moonLight.shadow.camera.left = -30;
  moonLight.shadow.camera.right = 30;
  moonLight.shadow.camera.top = 30;
  moonLight.shadow.camera.bottom = -30;
  scene.add(moonLight);

  const plazaLight = new THREE.PointLight(0xffdfb0, 1.6, 42, 1.8);
  plazaLight.position.set(-6, 5, 32);
  scene.add(plazaLight);

  const neonLight = new THREE.PointLight(0x62c4ff, 1.4, 36, 2.4);
  neonLight.position.set(18, 4, 16);
  scene.add(neonLight);

  const stationLight = new THREE.SpotLight(0xfff4ce, 1.1, 60, Math.PI / 6, 0.4, 1.2);
  stationLight.position.set(0, 9, -6);
  stationLight.target.position.set(0, 0, 20);
  scene.add(stationLight);
  scene.add(stationLight.target);

  const housePlots = [
    { position: new THREE.Vector3(-9, 0, 60) },
    { position: new THREE.Vector3(9, 0, 78), options: { porchLightColor: 0x94caff } },
    { position: new THREE.Vector3(-11, 0, 102), options: { porchLightColor: 0xffa07a } },
    { position: new THREE.Vector3(11, 0, 118), options: { porchLightColor: 0xf6c78b } },
  ];

  housePlots.forEach(({ position, options }) => {
    const plot = createHousePlot(position, options);
    scene.add(plot);

    const marker = createParkingMarker();
    marker.position.copy(position);
    marker.position.y = (marker.geometry as THREE.CylinderGeometry).parameters.height / 2;
    scene.add(marker);
  });

  return {
    car,
    stripes,
    mixers: [],
    cityBounds: CITY_BOUNDS,
  };
}
