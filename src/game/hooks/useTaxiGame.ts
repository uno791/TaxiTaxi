import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { DecisionOption, Ride, RideMetrics, TaxiGameUIState, Vector2 } from '../types';
import { RIDES } from '../data/rides';
import { createCamera, createRenderer, createScene, setupEnvironment } from '../three/environment';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

interface GameRuntime {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  car: THREE.Group;
  stripes: THREE.Mesh[];
  keys: Record<string, boolean>;
  frameId: number | null;
  lastTimestamp: number;
  mixers: THREE.AnimationMixer[];
  cityBounds: { x: number; z: number };
  pointerControls: PointerLockControls;
}

export interface UseTaxiGameResult extends TaxiGameUIState {
  currentRide: Ride;
  speed: number;
  distanceToDestination: number;
  interactionMode: InteractionMode;
  ready: boolean;
  startRide: () => void;
  chooseDecision: (choice: DecisionOption) => void;
}

type InteractionMode = 'drive' | 'walk';

const INITIAL_METRICS: RideMetrics = {
  startTime: null,
  elapsed: 0,
  speed: 0,
  angle: 0,
  crashes: 0,
};

const DEFAULT_START_POSITION: Vector2 = { x: 0, z: -48 };
const WALK_HEIGHT = 1.6;
const REENTRY_DISTANCE = 4;

function computeHeading(from: Vector2, to: Vector2): number {
  return Math.atan2(to.x - from.x, to.z - from.z);
}

export function useTaxiGame(containerRef: React.RefObject<HTMLDivElement | null>): UseTaxiGameResult {
  const runtimeRef = useRef<GameRuntime | null>(null);
  const metricsRef = useRef<RideMetrics>({ ...INITIAL_METRICS });
  const rideIndexRef = useRef(0);
  const rideInProgressRef = useRef(false);
  const showDecisionRef = useRef(false);
  const gameEndedRef = useRef(false);
  const timerRef = useRef(0);
  const speedRef = useRef(0);
  const timeoutHandlesRef = useRef<number[]>([]);
  const destinationRef = useRef(new THREE.Vector3());
  const destinationRadiusRef = useRef(6);
  const distanceRef = useRef(Infinity);
  const interactionModeRef = useRef<InteractionMode>('drive');

  const [ready, setReady] = useState(false);
  const [rideIndex, setRideIndex] = useState(0);
  const [dialogueQueue, setDialogueQueue] = useState<string[]>([]);
  const [dialogue, setDialogue] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [rideInProgress, setRideInProgress] = useState(false);
  const [showDecision, setShowDecision] = useState(false);
  const [decisionMade, setDecisionMade] = useState<DecisionOption | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [crashes, setCrashes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [distanceToDestination, setDistanceToDestination] = useState(Infinity);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('drive');

  rideIndexRef.current = rideIndex;
  rideInProgressRef.current = rideInProgress;
  showDecisionRef.current = showDecision;
  gameEndedRef.current = gameEnded;
  interactionModeRef.current = interactionMode;

  const clearScheduledTimeouts = useCallback(() => {
    timeoutHandlesRef.current.forEach((id) => window.clearTimeout(id));
    timeoutHandlesRef.current = [];
  }, []);

  const scheduleTimeout = useCallback(
    (fn: () => void, delay: number) => {
      const handle = window.setTimeout(() => {
        timeoutHandlesRef.current = timeoutHandlesRef.current.filter((id) => id !== handle);
        fn();
      }, delay);
      timeoutHandlesRef.current.push(handle);
      return handle;
    },
    []
  );

  useEffect(() => () => clearScheduledTimeouts(), [clearScheduledTimeouts]);

  const resetMetrics = useCallback(() => {
    metricsRef.current = { ...INITIAL_METRICS };
    timerRef.current = 0;
    speedRef.current = 0;
  }, []);

  const resetCarPosition = useCallback((ride: Ride) => {
    const runtime = runtimeRef.current;
    if (!runtime) {
      return;
    }

    const startPosition = ride.start?.position ?? DEFAULT_START_POSITION;
    const destinationPosition = ride.destination.position;
    const heading = ride.start?.heading ?? computeHeading(startPosition, destinationPosition);

    runtime.car.position.set(startPosition.x, 0.45, startPosition.z);
    runtime.car.rotation.set(0, heading, 0);

    metricsRef.current.angle = heading;
    metricsRef.current.speed = 0;
  }, []);

  const currentRide = useMemo(() => RIDES[rideIndex], [rideIndex]);

  const handleRideComplete = useCallback(
    (ride: Ride) => {
      rideInProgressRef.current = false;
      setRideInProgress(false);
      const metrics = metricsRef.current;
      metrics.speed = 0;
      distanceRef.current = 0;
      setDistanceToDestination(0);
      const timeTaken = metrics.elapsed;
      const crashCount = metrics.crashes;
      const penalty = crashCount * 5 + Math.floor(timeTaken);
      const payout = Math.max(0, ride.pay - penalty);
      if (!ride.decision) {
        if (payout > 0) {
          setEarnings((prev) => prev + payout);
        }
        setDialogue(`Ride complete. Earned THB ${payout.toFixed(0)}.`);
        setStatusMessage('Passenger dropped off safely.');
        scheduleTimeout(() => {
          const nextIndex = rideIndexRef.current + 1;
          if (nextIndex < RIDES.length) {
            setRideIndex(nextIndex);
          } else {
            setDialogue('Your shift ends as the sirens fade into the fog.');
            setGameEnded(true);
          }
        }, 4000);
      } else {
        setDialogue('We have arrived at the field. What do you do?');
        setStatusMessage('The air is too still. Decide quickly.');
        setShowDecision(true);
      }
    },
    [scheduleTimeout]
  );

  const toggleInteractionMode = useCallback(() => {
    const runtime = runtimeRef.current;
    if (!runtime) {
      return;
    }

    if (interactionModeRef.current === 'drive') {
      if ((metricsRef.current.speed || 0) > 0.02) {
        setStatusMessage('Bring the taxi to a full stop before exiting.');
        return;
      }

      const exitPosition = runtime.car.position.clone();
      exitPosition.y = WALK_HEIGHT;
      const exitHeading = runtime.car.rotation.y;

      const playerObject = runtime.pointerControls.object;
      playerObject.position.copy(exitPosition);
      playerObject.rotation.set(0, exitHeading, 0);

      metricsRef.current.speed = 0;
      speedRef.current = 0;
      setSpeed(0);

      interactionModeRef.current = 'walk';
      setInteractionMode('walk');
      runtime.pointerControls.lock();
      setStatusMessage('Walk mode: WASD to move, mouse to look. Press E near the taxi to get back in.');
    } else {
      const runtimePlayer = runtime.pointerControls.object;
      const carPosition = runtime.car.position.clone();
      const distanceToCar = runtimePlayer.position.distanceTo(carPosition);

      if (distanceToCar > REENTRY_DISTANCE) {
        setStatusMessage('Move closer to the taxi (within 4m) to hop back in.');
        return;
      }

      interactionModeRef.current = 'drive';
      setInteractionMode('drive');
      runtime.pointerControls.unlock();
      const followOffset = new THREE.Vector3(0, 5.5, -11)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), runtime.car.rotation.y)
        .add(carPosition.clone());
      runtime.camera.position.copy(followOffset);
      runtime.camera.lookAt(carPosition.x, carPosition.y + 0.6, carPosition.z + 2);
      setStatusMessage('Back in the driver seat. Eyes on the road.');
    }
  }, [setStatusMessage, setInteractionMode, setSpeed]);

  const startRide = useCallback(() => {
    if (
      !ready ||
      rideInProgressRef.current ||
      showDecisionRef.current ||
      gameEndedRef.current ||
      interactionModeRef.current !== 'drive'
    ) {
      return;
    }
    resetMetrics();
    metricsRef.current.startTime = null;
    setStatusMessage('Passenger is watching the road signs fade…');
    setRideInProgress(true);
    rideInProgressRef.current = true;
  }, [ready, resetMetrics]);

  const chooseDecision = useCallback(
    (choice: DecisionOption) => {
      setDecisionMade(choice);
      setShowDecision(false);
      rideInProgressRef.current = false;
      metricsRef.current.speed = 0;
      distanceRef.current = 0;
      setDistanceToDestination(0);
      const runtime = runtimeRef.current;
      if (runtime) {
        runtime.car.rotation.y = 0;
      }
      if (choice === 'field') {
        setDialogue('You deliver the stranger into the darkness. The engine cuts, and the world goes quiet.');
        setStatusMessage('You never make it back to town.');
      } else {
        setDialogue('You speed toward the station. Officers swarm the cab and take the stranger away.');
        setStatusMessage('The missing regulars are finally found. You are hailed as a hero.');
        setEarnings((prev) => prev + 120);
      }
      setGameEnded(true);
    },
    []
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || runtimeRef.current) {
      return;
    }

    const width = container.clientWidth || container.offsetWidth || window.innerWidth;
    const height = container.clientHeight || container.offsetHeight || window.innerHeight;

    const scene = createScene();
    const camera = createCamera(width, height);
    const renderer = createRenderer(width, height);
    container.appendChild(renderer.domElement);

    const { car, stripes, mixers, cityBounds } = setupEnvironment(scene);

    const pointerControls = new PointerLockControls(camera, renderer.domElement);
    pointerControls.object.position.set(0, WALK_HEIGHT, -60);
    scene.add(pointerControls.object);

    const runtime: GameRuntime = {
      scene,
      camera,
      renderer,
      car,
      stripes,
      keys: {},
      frameId: null,
      lastTimestamp: 0,
      mixers,
      cityBounds,
      pointerControls,
    };
    runtimeRef.current = runtime;

    const currentRideData = RIDES[rideIndexRef.current];
    resetCarPosition(currentRideData);
    const destination = currentRideData.destination.position;
    destinationRef.current.set(destination.x, 0, destination.z);
    destinationRadiusRef.current = currentRideData.destination.radius ?? 5;
    const carPos = runtime.car.position;
    const dx = carPos.x - destination.x;
    const dz = carPos.z - destination.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    distanceRef.current = distance;
    setDistanceToDestination(Number(distance.toFixed(1)));

    const handleKeyDown = (event: KeyboardEvent) => {
      runtime.keys[event.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
        event.preventDefault();
      }
      if (event.code === 'KeyE') {
        toggleInteractionMode();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      runtime.keys[event.code] = false;
    };

    const handleResize = () => {
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;
      renderer.setSize(newWidth, newHeight);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', handleResize);

    const animate = (timestamp: number) => {
      const activeRuntime = runtimeRef.current;
      if (!activeRuntime) {
        return;
      }

      const delta = activeRuntime.lastTimestamp ? (timestamp - activeRuntime.lastTimestamp) / 1000 : 0;
      activeRuntime.lastTimestamp = timestamp;

      if (delta > 0 && activeRuntime.mixers.length > 0) {
        activeRuntime.mixers.forEach((mixer) => mixer.update(delta));
      }

      const bounds = activeRuntime.cityBounds;

      if (interactionModeRef.current === 'walk') {
        const controls = activeRuntime.pointerControls;
        const forwardInput = Number(activeRuntime.keys['KeyW'] || activeRuntime.keys['ArrowUp']) -
          Number(activeRuntime.keys['KeyS'] || activeRuntime.keys['ArrowDown']);
        const strafeInput = Number(activeRuntime.keys['KeyD'] || activeRuntime.keys['ArrowRight']) -
          Number(activeRuntime.keys['KeyA'] || activeRuntime.keys['ArrowLeft']);

        const walkSpeed = 4.0;
        if (forwardInput !== 0) {
          controls.moveForward(forwardInput * walkSpeed * delta);
        }
        if (strafeInput !== 0) {
          controls.moveRight(strafeInput * walkSpeed * delta);
        }

        const playerObject = controls.object;
        playerObject.position.y = WALK_HEIGHT;
        playerObject.position.x = THREE.MathUtils.clamp(playerObject.position.x, -bounds.x, bounds.x);
        playerObject.position.z = THREE.MathUtils.clamp(playerObject.position.z, -bounds.z, bounds.z);

        const destination = destinationRef.current;
        const dxPlayer = playerObject.position.x - destination.x;
        const dzPlayer = playerObject.position.z - destination.z;
        const playerDistance = Math.sqrt(dxPlayer * dxPlayer + dzPlayer * dzPlayer);

        if (Math.abs(playerDistance - distanceRef.current) >= 0.05) {
          distanceRef.current = playerDistance;
          setDistanceToDestination(Number(playerDistance.toFixed(1)));
        }

        if (rideInProgressRef.current && playerDistance <= destinationRadiusRef.current) {
          const ride = RIDES[rideIndexRef.current];
          handleRideComplete(ride);
        }

        activeRuntime.renderer.render(activeRuntime.scene, activeRuntime.camera);
        activeRuntime.frameId = window.requestAnimationFrame(animate);
        return;
      }

      if (rideInProgressRef.current && !showDecisionRef.current && !gameEndedRef.current) {
        const metrics = metricsRef.current;
        if (metrics.startTime === null) {
          metrics.startTime = timestamp;
        }
        metrics.elapsed = (timestamp - metrics.startTime) / 1000;

        if (Math.abs(metrics.elapsed - timerRef.current) >= 0.05) {
          timerRef.current = metrics.elapsed;
          setTimer(Number(metrics.elapsed.toFixed(1)));
        }

        let currentSpeed = metrics.speed || 0;
        const maxSpeed = 0.65;
        const accel = 0.012;
        const decel = 0.02;
        if (activeRuntime.keys['ArrowUp'] || activeRuntime.keys['KeyW']) {
          currentSpeed = Math.min(maxSpeed, currentSpeed + accel);
        } else {
          currentSpeed = Math.max(0, currentSpeed - decel * 0.5);
        }
        if (activeRuntime.keys['ArrowDown'] || activeRuntime.keys['KeyS']) {
          currentSpeed = Math.max(0, currentSpeed - decel);
        }

        let angle = metrics.angle || 0;
        if (activeRuntime.keys['ArrowLeft'] || activeRuntime.keys['KeyA']) {
          angle += 0.03;
        }
        if (activeRuntime.keys['ArrowRight'] || activeRuntime.keys['KeyD']) {
          angle -= 0.03;
        }

        metrics.speed = currentSpeed;
        metrics.angle = angle;

        if (Math.abs(currentSpeed - speedRef.current) >= 0.01) {
          speedRef.current = currentSpeed;
          setSpeed(Math.round(currentSpeed * 180));
        }

        const carObject = activeRuntime.car;
        carObject.rotation.y = angle;
        const dx = Math.sin(angle) * currentSpeed;
        const dz = Math.cos(angle) * currentSpeed;
        carObject.position.x += dx;
        carObject.position.z += dz;

        if (Math.abs(carObject.position.x) > bounds.x || Math.abs(carObject.position.z) > bounds.z) {
          metrics.crashes += 1;
          setCrashes((prev) => prev + 1);
          carObject.position.x = THREE.MathUtils.clamp(carObject.position.x, -bounds.x, bounds.x);
          carObject.position.z = THREE.MathUtils.clamp(carObject.position.z, -bounds.z, bounds.z);
          metrics.speed = Math.max(0, currentSpeed * 0.35);
          speedRef.current = metrics.speed;
        }

        const camOffset = new THREE.Vector3(0, 5.5, -11);
        const carPos = carObject.position.clone();
        const desiredCamPos = camOffset
          .clone()
          .applyAxisAngle(new THREE.Vector3(0, 1, 0), angle)
          .add(carPos);
        activeRuntime.camera.position.lerp(desiredCamPos, 0.1);
        activeRuntime.camera.lookAt(carPos.x, carPos.y + 0.6, carPos.z + 2);

        activeRuntime.stripes.forEach((stripe) => {
          if (stripe.position.z - carObject.position.z > 40) {
            stripe.position.z -= 40 * 4;
          }
        });

        const ride = RIDES[rideIndexRef.current];
        const destination = destinationRef.current;
        const dxToDest = carObject.position.x - destination.x;
        const dzToDest = carObject.position.z - destination.z;
        const planarDistance = Math.sqrt(dxToDest * dxToDest + dzToDest * dzToDest);

        if (Math.abs(planarDistance - distanceRef.current) >= 0.05) {
          distanceRef.current = planarDistance;
          setDistanceToDestination(Number(planarDistance.toFixed(1)));
        }

        if (planarDistance <= destinationRadiusRef.current) {
          handleRideComplete(ride);
        }
      }

      activeRuntime.renderer.render(activeRuntime.scene, activeRuntime.camera);
      activeRuntime.frameId = window.requestAnimationFrame(animate);
    };

    runtime.frameId = window.requestAnimationFrame(animate);

    setReady(true);

    return () => {
      if (runtime.frameId) {
        window.cancelAnimationFrame(runtime.frameId);
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      pointerControls.unlock();
      renderer.dispose();
      container.removeChild(renderer.domElement);
      runtimeRef.current = null;
    };
  }, [containerRef, handleRideComplete, resetCarPosition, toggleInteractionMode]);

  useEffect(() => {
    resetMetrics();
    resetCarPosition(currentRide);
    const destination = currentRide.destination.position;
    destinationRef.current.set(destination.x, 0, destination.z);
    destinationRadiusRef.current = currentRide.destination.radius ?? 5;

    const runtime = runtimeRef.current;
    if (runtime) {
      const position = runtime.car.position;
      const dx = position.x - destination.x;
      const dz = position.z - destination.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      distanceRef.current = distance;
      setDistanceToDestination(Number(distance.toFixed(1)));
    } else {
      distanceRef.current = Infinity;
      setDistanceToDestination(Infinity);
    }

    setCrashes(0);
    setTimer(0);
    setSpeed(0);
    setRideInProgress(false);
    setShowDecision(false);
    setDecisionMade(null);
    setInteractionMode('drive');
    interactionModeRef.current = 'drive';
    setStatusMessage(currentRide.destination.description);
    clearScheduledTimeouts();
    setDialogueQueue([...currentRide.dialogues]);
    setDialogue('');

    if (runtime) {
      runtime.pointerControls.unlock();
      runtime.pointerControls.object.position.set(runtime.car.position.x, WALK_HEIGHT, runtime.car.position.z);
    }
  }, [clearScheduledTimeouts, currentRide, resetCarPosition, resetMetrics]);

  useEffect(() => {
    if (dialogueQueue.length === 0) {
      setDialogue('');
      return;
    }
    const line = dialogueQueue[0];
    setDialogue(line);
    const timeoutId = scheduleTimeout(() => {
      setDialogueQueue((queue) => queue.slice(1));
    }, 3800);
    return () => {
      window.clearTimeout(timeoutId);
      timeoutHandlesRef.current = timeoutHandlesRef.current.filter((id) => id !== timeoutId);
    };
  }, [dialogueQueue, scheduleTimeout]);

  useEffect(() => {
    if (
      ready &&
      dialogueQueue.length === 0 &&
      !rideInProgressRef.current &&
      !showDecisionRef.current &&
      !gameEndedRef.current
    ) {
      scheduleTimeout(startRide, 600);
    }
  }, [dialogueQueue.length, ready, scheduleTimeout, startRide]);

  useEffect(() => () => {
    clearScheduledTimeouts();
  }, [clearScheduledTimeouts]);

  return {
    currentRide,
    dialogue,
    timer,
    crashes,
    rideInProgress,
    showDecision,
    decisionMade,
    gameEnded,
    statusMessage,
    earnings,
    speed,
    distanceToDestination,
    interactionMode,
    ready,
    startRide,
    chooseDecision,
  };
}
