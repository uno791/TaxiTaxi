import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentProps, MutableRefObject } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import RoadCircuit from "./components/Road/RoadCircuit";
import { TaxiPhysics } from "./components/Taxi/TaxiPhysics";
import { CameraChase } from "./components/Taxi/CameraChase";
import AllBuildings from "./components/City/AllBuildings";
import { City1Colliders } from "./components/City/City1Colliders";
import Background from "./components/City/Background";
import { NavigationSystem } from "./components/Navigation/NavigationSystem";
import { DestinationMarker } from "./components/Navigation/DestinationMarker";
import { MiniMapOverlay } from "./hooks/useMiniMapOverlay";

import Mission, {
  type MissionProgressSummary,
  type MissionResumeState,
  type MissionTargetInfo,
} from "./components/Missions/Mission";
import GameUI from "./components/UI/GameUI";
import GameOverPopup from "./components/UI/GameOverPopup";
import { Physics } from "@react-three/cannon";
import type { ControlMode } from "./components/Taxi/useControls";
import { TaxiControlSettings } from "./components/Taxi/TaxiControlSettings";
import TaxiSpeedometer from "./components/Taxi/TaxiSpeedometer";
import UpgradeMenu from "./components/UI/UpgradeMenu";
import {
  MissionUIProvider,
  useMissionUI,
} from "./components/Missions/MissionUIContext";
import { MissionPerformanceProvider } from "./components/Missions/MissionPerformanceContext";
import MissionOverlay from "./components/Missions/MissionOverlay";
import ControllerCursor from "./components/Controls/ControllerCursor";
import { findPrimaryGamepad } from "./components/Controls/gamepadUtils";
import { Stars } from "@react-three/drei";

import LoginScreen from "./components/UI/LoginScreen";
import EntranceScreen from "./components/UI/EntranceScreen";
import CarSelector from "./components/CarSelector/CarSelector";
import IntroCinematic from "./components/UI/IntroCinematic";
import MissionTrackerHUD from "./components/UI/MissionTrackerHUD";

import { MetaProvider, useMeta } from "./context/MetaContext";
import { useGameLifecycle } from "./GameContext";
import { useFlightMode } from "./tools/FlightTool";
import {
  ColliderPainterOverlay,
  ColliderPainterProvider,
  ColliderPainterRuntime,
  useColliderPainter,
} from "./tools/ColliderPainter";
import NewCityRoad from "./components/City3/NewCityRoad";
import Level2 from "./components/City2/Level2";
import { MISSIONS_BY_CITY } from "./components/Missions/missionConfig";
import {
  CITY_SEQUENCE,
  CITY_SPAWN_POINTS,
  CITY_STORY_DIALOGS,
  CITY_INTRO_DIALOGS,
  GAME_INTRO_STORY,
  type CityId,
} from "./constants/cities";
import CityStoryOverlay from "./components/UI/CityStoryOverlay";
import FogEffect from "./components/FogEffect";
import {
  saveGameProgress,
  loadGameProgress,
  clearGameProgress,
} from "./utils/storage";

function GameWorld() {
  const savedProgress = useMemo(() => loadGameProgress(), []);
  const chaseRef = useRef<THREE.Object3D | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [controlMode, setControlMode] = useState<ControlMode>("keyboard");
  const controllerModeActive = controlMode === "controller";
  const [isPaused, setIsPaused] = useState(false);
  const [dialogPaused, setDialogPaused] = useState(false); // ✅ added
  const [lightingMode, setLightingMode] = useState<"fake" | "fill">("fake");
  const previousLightingModeRef = useRef<"fake" | "fill">("fake");
  const [clearWeather, setClearWeather] = useState(false);
  const lastPausePressRef = useRef(false);
  const lastCirclePressRef = useRef(false);
  const {
    activeCity,
    setActiveCity,
    restartGame,
    isFreeRoam,
    isCompetition,
    shouldSkipIntro,
    clearIntroSkip,
  } = useGameLifecycle();

  const { setAppStage } = useMeta();
  const completedCitiesRef = useRef<Record<CityId, boolean>>({
    city1: false,
    city2: false,
    city3: false,
  });
  const missionSummaryRef = useRef<MissionProgressSummary | null>(null);
  const resumeStatesRef = useRef<Record<CityId, MissionResumeState | null>>({
    city1:
      savedProgress && savedProgress.cityId === "city1"
        ? {
            completedMissionIds: [...savedProgress.completedMissionIds],
            nextMissionId: savedProgress.nextMissionId,
          }
        : null,
    city2:
      savedProgress && savedProgress.cityId === "city2"
        ? {
            completedMissionIds: [...savedProgress.completedMissionIds],
            nextMissionId: savedProgress.nextMissionId,
          }
        : null,
    city3:
      savedProgress && savedProgress.cityId === "city3"
        ? {
            completedMissionIds: [...savedProgress.completedMissionIds],
            nextMissionId: savedProgress.nextMissionId,
          }
        : null,
  });

  if (
    savedProgress &&
    missionSummaryRef.current === null &&
    savedProgress.cityId === activeCity
  ) {
    missionSummaryRef.current = {
      cityId: savedProgress.cityId,
      activeMissionId: null,
      nextMissionId: savedProgress.nextMissionId,
      completedMissionIds: [...savedProgress.completedMissionIds],
    };
  }
  const initialIntroCity: CityId | null = isFreeRoam
    ? null
    : savedProgress
    ? null
    : activeCity;
  const initialGameIntro = !isFreeRoam && !savedProgress && !shouldSkipIntro;
  const [introCity, setIntroCity] = useState<CityId | null>(initialIntroCity);
  const [storyCity, setStoryCity] = useState<CityId | null>(null);
  const [showGameIntro, setShowGameIntro] = useState(initialGameIntro);
  const [storyPaused, setStoryPaused] = useState(
    isFreeRoam ? false : initialGameIntro || initialIntroCity !== null
  );
  const baseCursorVisible =
    controllerModeActive &&
    (isPaused ||
      dialogPaused ||
      storyPaused ||
      showGameIntro ||
      introCity !== null ||
      storyCity !== null);

  useEffect(() => {
    if (shouldSkipIntro) {
      clearIntroSkip();
    }
  }, [shouldSkipIntro, clearIntroSkip]);

  useEffect(() => {
    if (!controllerModeActive) {
      lastPausePressRef.current = false;
      lastCirclePressRef.current = false;
      return;
    }

    let raf: number | null = null;
    const loop = () => {
      const pad = findPrimaryGamepad();
      if (pad) {
        const pausePressed = Boolean(pad.buttons[9]?.pressed);
        const circlePressed = Boolean(pad.buttons[1]?.pressed);
        if (pausePressed && !lastPausePressRef.current) {
          setIsPaused((prev) => !prev);
        }
        if (isPaused && circlePressed && !lastCirclePressRef.current) {
          setIsPaused(false);
        }
        lastPausePressRef.current = pausePressed;
        lastCirclePressRef.current = circlePressed;
      } else {
        lastPausePressRef.current = false;
        lastCirclePressRef.current = false;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      if (raf !== null) {
        cancelAnimationFrame(raf);
      }
      lastPausePressRef.current = false;
      lastCirclePressRef.current = false;
    };
  }, [controllerModeActive, isPaused]);

  const playerPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const destinationRef = useRef(
    new THREE.Vector3(Number.NaN, Number.NaN, Number.NaN)
  );
  const [miniMapCanvas, setMiniMapCanvas] = useState<HTMLCanvasElement | null>(
    null
  );
  const [availableMissionTargets, setAvailableMissionTargets] = useState<
    MissionTargetInfo[]
  >([]);

  const updateDestination = useCallback(
    (position: [number, number, number] | null) => {
      if (position) {
        destinationRef.current.set(
          position[0],
          Number.isFinite(position[1]) ? position[1] : 0,
          position[2]
        );
      } else {
        destinationRef.current.set(Number.NaN, Number.NaN, Number.NaN);
      }
    },
    [destinationRef]
  );

  const handleAvailableMissionTargetsChange = useCallback(
    (targets: MissionTargetInfo[]) => {
      setAvailableMissionTargets((previous) => {
        if (previous.length === targets.length) {
          let identical = true;
          for (let index = 0; index < targets.length; index += 1) {
            const next = targets[index];
            const prev = previous[index];
            if (!prev || prev.id !== next.id) {
              identical = false;
              break;
            }
            if (
              prev.position[0] !== next.position[0] ||
              prev.position[1] !== next.position[1] ||
              prev.position[2] !== next.position[2]
            ) {
              identical = false;
              break;
            }
          }
          if (identical) {
            return previous;
          }
        }
        return targets;
      });
    },
    []
  );

  // ✅ Callback for mission progress updates from <Mission />
  const handleMissionProgress = useCallback(
    (remaining: number, nextName: string | null) => {
      setMissionsRemaining(remaining);
      setNextMissionName(nextName);
    },
    []
  );

  // 🧭 Add this near other callbacks (for example after handleMissionProgress):

  const handleFindMission = useCallback(() => {
    if (!missionSummaryRef.current) return false;

    const nextMissionId = missionSummaryRef.current.nextMissionId;
    if (!nextMissionId) return false;

    const missionData = MISSIONS_BY_CITY[activeCity].find(
      (mission) => mission.id === nextMissionId
    );
    if (!missionData || !missionData.pickupPosition) return false;

    destinationRef.current.set(
      missionData.pickupPosition[0],
      missionData.pickupPosition[1],
      missionData.pickupPosition[2]
    );
    return true;
  }, [activeCity]);

  const handleMissionSummaryChange = useCallback(
    (summary: MissionProgressSummary) => {
      if (isCompetition) return; // 🚫 Ignore mission saves completely

      missionSummaryRef.current = summary;
      resumeStatesRef.current[summary.cityId] = {
        completedMissionIds: [...summary.completedMissionIds],
        nextMissionId: summary.nextMissionId,
      };
    },
    [isCompetition]
  );

  const missions = MISSIONS_BY_CITY[activeCity];
  const savedForActiveCity =
    savedProgress && savedProgress.cityId === activeCity ? savedProgress : null;
  const defaultSpawnPosition = CITY_SPAWN_POINTS[activeCity];
  const [spawnPosition, setSpawnPosition] =
    useState<[number, number, number]>(defaultSpawnPosition);
  const introData = introCity ? CITY_INTRO_DIALOGS[introCity] : null;
  const storyData = storyCity ? CITY_STORY_DIALOGS[storyCity] : null;
  const [testMode, setTestMode] = useState(isFreeRoam);
  // ✅ Add this here — after missions is defined
  const [missionsRemaining, setMissionsRemaining] = useState(() => {
    if (savedForActiveCity) {
      const completedInCity = new Set(savedForActiveCity.completedMissionIds);
      const completedCount = missions.filter((mission) =>
        completedInCity.has(mission.id)
      ).length;
      return Math.max(missions.length - completedCount, 0);
    }
    return missions.length;
  });
  const [nextMissionName, setNextMissionName] = useState<string | null>(
    savedForActiveCity ? savedForActiveCity.nextMissionId : null
  );

  useEffect(() => {
    const citySpawn = CITY_SPAWN_POINTS[activeCity];
    setSpawnPosition([citySpawn[0], citySpawn[1], citySpawn[2]]);
  }, [activeCity, setSpawnPosition]);

  const handleMissionFailedTeleport = useCallback(
    (startPosition: [number, number, number]) => {
      setSpawnPosition([startPosition[0], startPosition[1], startPosition[2]]);
    },
    [setSpawnPosition]
  );

  useEffect(() => {
    if (isFreeRoam || isCompetition) {
      setTestMode(true);
      setIntroCity(null);
      setStoryCity(null);
      setStoryPaused(false);
      setShowGameIntro(false);
    } else if (clearWeather) {
      setLightingMode(previousLightingModeRef.current);
      setClearWeather(false);
    }
  }, [
    isFreeRoam,
    clearWeather,
    setLightingMode,
    setTestMode,
    setIntroCity,
    setStoryCity,
    setStoryPaused,
    setClearWeather,
    setShowGameIntro,
  ]);

  const {
    enabled: flightEnabled,
    overlay: flightOverlay,
    flightControls,
  } = useFlightMode({
    allowToggle: isFreeRoam,
    onEnable: () => setIsPaused(false),
  });

  const toggleLightingMode = useCallback(() => {
    setLightingMode((previous) => (previous === "fake" ? "fill" : "fake"));
  }, [setLightingMode]);

  const handleGameIntroContinue = useCallback(() => {
    setShowGameIntro(false);
  }, [setShowGameIntro]);

  const handleIntroOverlayContinue = useCallback(() => {
    setIntroCity(null);
    setStoryPaused(false);
  }, []);

  const handleAllMissionsCompleted = useCallback(
    (cityId: CityId) => {
      if (isFreeRoam || completedCitiesRef.current[cityId]) return;
      completedCitiesRef.current = {
        ...completedCitiesRef.current,
        [cityId]: true,
      };
      setStoryCity(cityId);
      setStoryPaused(true);
    },
    [isFreeRoam]
  );

  const handleStoryOverlayContinue = useCallback(() => {
    if (!storyCity) {
      setStoryPaused(false);
      return;
    }

    const currentIndex = CITY_SEQUENCE.indexOf(storyCity);
    const nextCity =
      currentIndex >= 0 && currentIndex < CITY_SEQUENCE.length - 1
        ? CITY_SEQUENCE[currentIndex + 1]
        : null;

    setStoryCity(null);

    if (nextCity) {
      setActiveCity(nextCity);
      setIntroCity(nextCity);
      setStoryPaused(true);
    } else {
      setStoryPaused(false);
    }

    setAvailableMissionTargets([]);
    destinationRef.current.set(Number.NaN, Number.NaN, Number.NaN);
  }, [storyCity, setAvailableMissionTargets, setIntroCity, setActiveCity]);

  const handleTestTravel = useCallback(
    (city: CityId) => {
      setStoryCity(null);
      if (!isFreeRoam) {
        setIntroCity(city);
        setStoryPaused(true);
      } else {
        setIntroCity(null);
        setStoryPaused(false);
      }
      setActiveCity(city);
      setAvailableMissionTargets([]);
      destinationRef.current.set(Number.NaN, Number.NaN, Number.NaN);
    },
    [isFreeRoam, setAvailableMissionTargets, setIntroCity, setActiveCity]
  );

  const toggleTestMode = useCallback(() => {
    if (isFreeRoam) return;
    setTestMode((prev) => !prev);
  }, [isFreeRoam]);

  const handleToggleClearWeather = useCallback(() => {
    setClearWeather((prev) => {
      if (!prev) {
        previousLightingModeRef.current = lightingMode;
        setLightingMode("fill");
      } else {
        setLightingMode(previousLightingModeRef.current);
      }
      return !prev;
    });
  }, [lightingMode, setLightingMode]);

  const handleRestartLevel = useCallback(() => {
    missionSummaryRef.current = null;
    resumeStatesRef.current = {
      city1: null,
      city2: null,
      city3: null,
    } as Record<CityId, MissionResumeState | null>;
    clearGameProgress();
    setAvailableMissionTargets([]);
    destinationRef.current.set(Number.NaN, Number.NaN, Number.NaN);
    setMissionsRemaining(missions.length);
    setNextMissionName(missions.length > 0 ? missions[0].id : null);
    restartGame({ skipIntro: true });
  }, [
    missions,
    restartGame,
    setAvailableMissionTargets,
    setMissionsRemaining,
    setNextMissionName,
    clearGameProgress,
  ]);

  const handleSaveAndExit = useCallback(() => {
    const summary = missionSummaryRef.current;
    const relevantSummary =
      summary && summary.cityId === activeCity ? summary : null;

    const completedMissionIds = relevantSummary
      ? [...relevantSummary.completedMissionIds]
      : savedForActiveCity
      ? [...savedForActiveCity.completedMissionIds]
      : [];

    const nextMissionId = relevantSummary
      ? relevantSummary.nextMissionId
      : savedForActiveCity?.nextMissionId ?? null;

    saveGameProgress({
      cityId: activeCity,
      completedMissionIds,
      nextMissionId,
      savedAt: Date.now(),
    });

    setIsPaused(false);
    setAppStage("entrance");
  }, [activeCity, savedForActiveCity, setAppStage, setIsPaused]);

  useEffect(() => {
    setAvailableMissionTargets([]);
    destinationRef.current.set(Number.NaN, Number.NaN, Number.NaN);
  }, [activeCity]);

  return (
    <ColliderPainterProvider activeCity={activeCity}>
      <MissionUIProvider>
        <MissionPerformanceProvider>
          <div
            ref={containerRef}
            style={{ width: "100vw", height: "100vh", position: "relative" }}
          >
            <Canvas shadows camera={{ position: [0, 5, -10], fov: 50 }}>
              <color attach="background" args={["#0a0f2c"]} />{" "}
              <Stars
                radius={200} // spread of the starfield
                depth={80} // how deep the field goes
                count={4000} // number of stars
                factor={6} // ⭐ increase from 4 → 6 to make stars brighter/larger
                saturation={0} // keep at 0 for white/blue stars
                fade // enables distance fade
              />
              {clearWeather ? null : <FogEffect />}
              {/* dark blue night sky */}
              <Physics
                gravity={[0, -9.81, 0]}
                broadphase="SAP"
                allowSleep
                iterations={12}
                tolerance={1e-4}
                stepSize={1 / 90}
                maxSubSteps={4}
              >
                {/* Lighting */}
                {clearWeather ? (
                  <>
                    <ambientLight intensity={0.7} color="#dce5ff" />
                    <directionalLight
                      position={[12, 18, 8]}
                      intensity={1.15}
                      color="#ffffff"
                      castShadow
                    />
                    <directionalLight
                      position={[-10, 15, -12]}
                      intensity={0.6}
                      color="#f0f6ff"
                    />
                  </>
                ) : null}
                {lightingMode === "fill" ? (
                  <hemisphereLight args={["#8aa6ff", "#1b1e25", 0.35]} />
                ) : null}

                {/* World */}
                {activeCity === "city1" ? (
                  <>
                    <AllBuildings />
                    <City1Colliders playerPositionRef={playerPositionRef} />
                    <RoadCircuit position={[0, 0, 0]} />
                    <Background position={[0, 0, 0]} />
                  </>
                ) : null}
                {activeCity === "city2" ? (
                  <Level2
                    position={[-130, 0, -20]}
                    playerPositionRef={playerPositionRef}
                  />
                ) : null}
                {activeCity === "city3" ? (
                  <NewCityRoad
                    position={[0, 0, 0]}
                    playerPositionRef={playerPositionRef}
                  />
                ) : null}

                {/* Taxi */}
                <ColliderAwareTaxiPhysics
                  chaseRef={chaseRef}
                  controlMode={controlMode}
                  playerPositionRef={playerPositionRef}
                  spawnPosition={spawnPosition}
                  basePaused={
                    isPaused || dialogPaused || storyPaused || flightEnabled
                  }
                />

                <Mission
                  position={[0, 0, 0]}
                  taxiRef={chaseRef}
                  missions={missions}
                  cityId={activeCity}
                  onDestinationChange={updateDestination}
                  onAvailableMissionTargetsChange={
                    handleAvailableMissionTargetsChange
                  }
                  onPauseChange={setDialogPaused} // ✅ added: mission can pause/resume game
                  onAllMissionsCompleted={
                    isFreeRoam ? undefined : handleAllMissionsCompleted
                  }
                  onMissionProgress={handleMissionProgress}
                  onMissionSummaryChange={handleMissionSummaryChange}
                  onMissionFailed={handleMissionFailedTeleport}
                  initialResumeState={resumeStatesRef.current[activeCity]}
                  unlockAll={isFreeRoam}
                />

                <DestinationMarker destinationRef={destinationRef} />
                <NavigationSystem
                  playerRef={playerPositionRef}
                  playerObjectRef={chaseRef}
                  destinationRef={destinationRef}
                  onMiniMapCanvasChange={setMiniMapCanvas}
                />

                {/* Camera */}
                <ColliderAwareCameraChase
                  target={chaseRef}
                  flightEnabled={flightEnabled}
                />
                {flightControls}
                <ColliderAwareOrbitControls flightEnabled={flightEnabled} />
              </Physics>
              <ColliderPainterRuntime playerPositionRef={playerPositionRef} />
            </Canvas>

            {/* Controls */}
            <TaxiControlSettings
              controlMode={controlMode}
              onControlModeChange={setControlMode}
              isPaused={isPaused}
              onPauseChange={setIsPaused}
              onRestartLevel={handleRestartLevel}
              onSaveAndExit={handleSaveAndExit}
            />

            {/* UI overlay */}
            <TaxiSpeedometer />
            <GameUI />
            <GameOverPopup />
            <UpgradeMenu />

            {!isFreeRoam && !isCompetition ? (
              <MissionTrackerHUD
                remaining={missionsRemaining}
                nextMission={nextMissionName}
                onFindMission={handleFindMission}
              />
            ) : null}

            <MiniMapOverlay
              canvas={miniMapCanvas}
              missions={availableMissionTargets}
              playerRef={playerPositionRef}
              playerObjectRef={chaseRef}
              size={220}
            />
            {!isFreeRoam ? (
              <>
                {showGameIntro ? (
                  <CityStoryOverlay
                    storyId="game-intro"
                    story={GAME_INTRO_STORY}
                    onContinue={handleGameIntroContinue}
                    controllerModeActive={controllerModeActive}
                    controllerCursorActive={baseCursorVisible}
                  />
                ) : null}
                {!showGameIntro ? (
                  <>
                    <CityStoryOverlay
                      storyId={introCity}
                      story={introData}
                      controllerModeActive={controllerModeActive}
                      controllerCursorActive={baseCursorVisible}
                      onContinue={handleIntroOverlayContinue}
                    />
                    <CityStoryOverlay
                      storyId={storyCity}
                      story={storyData}
                      controllerModeActive={controllerModeActive}
                      controllerCursorActive={baseCursorVisible}
                      onContinue={handleStoryOverlayContinue}
                    />
                  </>
                ) : null}
              </>
            ) : null}
            {isFreeRoam && (
              <div
                style={{
                  position: "absolute",
                  bottom: 330,
                  left: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  zIndex: 40,
                  pointerEvents: "auto",
                }}
              >
                <button
                  type="button"
                  onClick={toggleTestMode}
                  disabled={isFreeRoam}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    background: testMode
                      ? "rgba(46, 125, 50, 0.85)"
                      : "rgba(24, 28, 35, 0.85)",
                    color: "#f5f5f5",
                    border: "1px solid rgba(255,255,255,0.25)",
                    fontSize: "0.85rem",
                    cursor: isFreeRoam ? "default" : "pointer",
                    opacity: isFreeRoam ? 0.85 : 1,
                  }}
                  title={
                    isFreeRoam
                      ? "City fast travel is always on in Free Roam."
                      : "Toggle developer travel controls."
                  }
                >
                  {isFreeRoam
                    ? "City Fast Travel (Free Roam)"
                    : testMode
                    ? "Test Travel: On"
                    : "Enable Test Travel"}
                </button>
                {testMode ? (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    {CITY_SEQUENCE.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleTestTravel(city)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1px solid rgba(255,255,255,0.25)",
                          background:
                            activeCity === city
                              ? "rgba(46, 125, 50, 0.85)"
                              : "rgba(24, 28, 35, 0.75)",
                          color: "#f5f5f5",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                        }}
                      >
                        To: {city}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
            {flightOverlay}
            <ColliderPainterOverlay />
            <MissionUrgencyEffects containerRef={containerRef} />
            <ControllerCursorBinding
              controllerModeActive={controllerModeActive}
              baseCursorVisible={baseCursorVisible}
            />

            {(isFreeRoam || isCompetition) && (
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: 80,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  zIndex: 30,
                  pointerEvents: "auto",
                }}
              >
                <button
                  type="button"
                  onClick={handleToggleClearWeather}
                  style={{
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 8,
                    background: clearWeather
                      ? "rgba(33, 150, 243, 0.85)"
                      : "rgba(0, 188, 212, 0.85)",
                    color: "#0a0f1c",

                    padding: "6px 12px",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    fontWeight: 600,
                    boxShadow: "0 8px 16px rgba(0,0,0,0.35)",
                  }}
                  title={
                    clearWeather
                      ? "Restore the city's atmospheric fog and original night lighting."
                      : "Clear the fog and flood the city with bright lights."
                  }
                >
                  {clearWeather ? "Restore Night Fog" : "Clear Skies (Fog Off)"}
                </button>
                <button
                  type="button"
                  onClick={toggleLightingMode}
                  disabled={clearWeather}
                  style={{
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 8,
                    background: clearWeather
                      ? "rgba(24, 28, 35, 0.45)"
                      : "rgba(24, 28, 35, 0.8)",
                    color: "#f5f5f5",
                    padding: "6px 12px",
                    fontSize: "0.85rem",
                    cursor: clearWeather ? "default" : "pointer",
                    backdropFilter: "blur(2px)",
                    transition: "background-color 0.2s ease",
                  }}
                  title="Toggle between fake decal lighting and a global fill light."
                >
                  {lightingMode === "fake"
                    ? "Lighting: Decals Only"
                    : "Lighting: Global Fill"}
                </button>
              </div>
            )}
          </div>
        </MissionPerformanceProvider>
      </MissionUIProvider>
    </ColliderPainterProvider>
  );
}

type TaxiPhysicsProps = ComponentProps<typeof TaxiPhysics>;

function ColliderAwareTaxiPhysics({
  basePaused,
  ...props
}: Omit<TaxiPhysicsProps, "isPaused"> & { basePaused: boolean }) {
  const { enabled: colliderEnabled } = useColliderPainter();
  return <TaxiPhysics {...props} isPaused={basePaused || colliderEnabled} />;
}

function ColliderAwareCameraChase({
  target,
  flightEnabled,
}: {
  target: MutableRefObject<THREE.Object3D | null>;
  flightEnabled: boolean;
}) {
  const { enabled: colliderEnabled } = useColliderPainter();
  if (flightEnabled || colliderEnabled) return null;
  return <CameraChase target={target} />;
}

function ColliderAwareOrbitControls({
  flightEnabled,
}: {
  flightEnabled: boolean;
}) {
  const { enabled: colliderEnabled } = useColliderPainter();
  return (
    <OrbitControls makeDefault enabled={!flightEnabled && !colliderEnabled} />
  );
}

function MissionUrgencyEffects({
  containerRef,
}: {
  containerRef: MutableRefObject<HTMLDivElement | null>;
}) {
  const { timer, missionFailureActive } = useMissionUI();
  const urgencyRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const intensityRef = useRef(0);

  const PANIC_THRESHOLD = 10;
  const timeUrgency =
    timer && timer.secondsLeft > 0 && timer.secondsLeft <= PANIC_THRESHOLD
      ? 1 - Math.max(timer.secondsLeft, 0) / PANIC_THRESHOLD
      : 0;
  const targetUrgency = missionFailureActive ? 1 : timeUrgency;
  urgencyRef.current = targetUrgency;

  useEffect(() => {
    const animate = () => {
      const container = containerRef.current;
      if (!container) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const target = urgencyRef.current;
      const nextIntensity =
        intensityRef.current + (target - intensityRef.current) * 0.1;
      intensityRef.current = nextIntensity;

      if (nextIntensity > 0.001) {
        const time = performance.now();
        const amplitude = 2.8 * nextIntensity;
        const offsetX =
          Math.sin(time * 0.07) * amplitude +
          Math.sin(time * 0.11) * amplitude * 0.5;
        const offsetY =
          Math.cos(time * 0.09) * amplitude +
          Math.cos(time * 0.14) * amplitude * 0.35;
        container.style.transform = `translate3d(${offsetX.toFixed(
          2
        )}px, ${offsetY.toFixed(2)}px, 0)`;
      } else if (container.style.transform) {
        container.style.transform = "";
        intensityRef.current = 0;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      const container = containerRef.current;
      if (container) {
        container.style.transform = "";
      }
      intensityRef.current = 0;
    };
  }, [containerRef]);

  return null;
}

function ControllerCursorBinding({
  controllerModeActive,
  baseCursorVisible,
}: {
  controllerModeActive: boolean;
  baseCursorVisible: boolean;
}) {
  const { prompt, dialog, completion, active } = useMissionUI();
  const controllerCursorEnabled =
    controllerModeActive &&
    (baseCursorVisible ||
      Boolean(prompt) ||
      Boolean(dialog) ||
      Boolean(completion) ||
      Boolean(active));

  return (
    <>
      <MissionOverlay
        controllerModeActive={controllerModeActive}
        controllerCursorActive={controllerCursorEnabled}
      />
      <ControllerCursor enabled={controllerCursorEnabled} />
    </>
  );
}


function AppContent() {
  const { appStage } = useMeta();
  const { gameInstance } = useGameLifecycle();

  if (appStage === "login") return <LoginScreen />;
  if (appStage === "entrance") return <EntranceScreen />;
  if (appStage === "car") return <CarSelector />;
  if (appStage === "cinematic") return <IntroCinematic />;

  return <GameWorld key={`game-${gameInstance}`} />;
}

export default function App() {
  return (
    <MetaProvider>
      <AppContent />
    </MetaProvider>
  );
}
