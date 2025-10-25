import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import RoadCircuit from "./components/Road/RoadCircuit";
import { TaxiPhysics } from "./components/Taxi/TaxiPhysics";
import { CameraChase } from "./components/Taxi/CameraChase";
import AllBuildings from "./components/City/AllBuildings";
import Background from "./components/City/Background";
import { NavigationSystem } from "./components/Navigation/NavigationSystem";
import { DestinationMarker } from "./components/Navigation/DestinationMarker";
import { MiniMapOverlay } from "./hooks/useMiniMapOverlay";

import Mission, { type MissionTargetInfo } from "./components/Missions/Mission";
import GameUI from "./components/UI/GameUI";
import GameOverPopup from "./components/UI/GameOverPopup";
import { Physics } from "@react-three/cannon";
import type { ControlMode } from "./components/Taxi/useControls";
import { TaxiControlSettings } from "./components/Taxi/TaxiControlSettings";
import TaxiSpeedometer from "./components/Taxi/TaxiSpeedometer";
import UpgradeMenu from "./components/UI/UpgradeMenu";
import { MissionUIProvider } from "./components/Missions/MissionUIContext";
import MissionOverlay from "./components/Missions/MissionOverlay";
import FogEffect from "./components/FogEffect";

import LoginScreen from "./components/UI/LoginScreen";
import EntranceScreen from "./components/UI/EntranceScreen";
import CarSelector from "./components/CarSelector/CarSelector";

import { MetaProvider, useMeta } from "./context/MetaContext";
import { useFlightMode } from "./tools/FlightTool";
import NewCityRoad from "./components/City3/NewCityRoad";
import Level2 from "./components/City2/Level2";
import { MISSIONS_BY_CITY } from "./components/Missions/missionConfig";
import {
  CITY_SEQUENCE,
  CITY_SPAWN_POINTS,
  CITY_STORY_DIALOGS,
  type CityId,
} from "./constants/cities";
import CityStoryOverlay from "./components/UI/CityStoryOverlay";

function GameWorld() {
  const chaseRef = useRef<THREE.Object3D | null>(null);
  const [controlMode, setControlMode] = useState<ControlMode>("keyboard");
  const [isPaused, setIsPaused] = useState(false);
  const [dialogPaused, setDialogPaused] = useState(false); // ✅ added
  const [lightingMode, setLightingMode] = useState<"fake" | "fill">("fake");
  const [activeCity, setActiveCity] = useState<CityId>("city1");
  const completedCitiesRef = useRef<Record<CityId, boolean>>({
    city1: false,
    city2: false,
    city3: false,
  });
  const [storyCity, setStoryCity] = useState<CityId | null>(null);
  const [storyPaused, setStoryPaused] = useState(false);

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

  const missions = MISSIONS_BY_CITY[activeCity];
  const spawnPosition = CITY_SPAWN_POINTS[activeCity];
  const storyData = storyCity ? CITY_STORY_DIALOGS[storyCity] : null;
  const [testMode, setTestMode] = useState(false);

  const {
    enabled: flightEnabled,
    overlay: flightOverlay,
    flightControls,
  } = useFlightMode({
    onEnable: () => setIsPaused(false),
  });

  const toggleLightingMode = useCallback(() => {
    setLightingMode((previous) => (previous === "fake" ? "fill" : "fake"));
  }, []);

  const handleAllMissionsCompleted = useCallback((cityId: CityId) => {
    if (completedCitiesRef.current[cityId]) return;
    completedCitiesRef.current = {
      ...completedCitiesRef.current,
      [cityId]: true,
    };
    setStoryCity(cityId);
    setStoryPaused(true);
  }, []);

  const handleStoryOverlayContinue = useCallback(() => {
    setStoryPaused(false);
    setStoryCity((currentCity) => {
      if (!currentCity) return null;
      const currentIndex = CITY_SEQUENCE.indexOf(currentCity);
      const nextCity = CITY_SEQUENCE[currentIndex + 1];
      if (nextCity) {
        setActiveCity(nextCity);
      }
      return null;
    });
    setAvailableMissionTargets([]);
    destinationRef.current.set(Number.NaN, Number.NaN, Number.NaN);
  }, []);

  const handleTestTravel = useCallback((city: CityId) => {
    setStoryCity(null);
    setStoryPaused(false);
    setActiveCity(city);
    setAvailableMissionTargets([]);
    destinationRef.current.set(Number.NaN, Number.NaN, Number.NaN);
  }, []);

  const toggleTestMode = useCallback(() => {
    setTestMode((prev) => !prev);
  }, []);

  useEffect(() => {
    setAvailableMissionTargets([]);
    destinationRef.current.set(Number.NaN, Number.NaN, Number.NaN);
  }, [activeCity]);

  return (
    <MissionUIProvider>
      <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
        <Canvas shadows camera={{ position: [0, 5, -10], fov: 50 }}>
          {/* <FogEffect /> */}
          <Physics
            gravity={[0, -9.81, 0]}
            broadphase="SAP"
            allowSleep
            iterations={18}
            tolerance={1e-5}
            stepSize={1 / 120}
            maxSubSteps={6}
          >
            {/* Lighting */}
            {lightingMode === "fill" ? (
              <hemisphereLight args={["#8aa6ff", "#1b1e25", 4.35]} />
            ) : null}

            {/* World */}
            {activeCity === "city1" ? (
              <>
                <AllBuildings />
                <RoadCircuit position={[0, 0, 0]} />
                <Background position={[0, 0, 0]} />
              </>
            ) : null}
            {activeCity === "city2" ? <Level2 position={[-130,0,-20]}/> : null}
            {activeCity === "city3" ? <NewCityRoad /> : null}

            {/* Taxi */}
            <TaxiPhysics
              chaseRef={chaseRef}
              controlMode={controlMode}
              isPaused={
                isPaused || dialogPaused || storyPaused || flightEnabled
              } // ✅ includes dialog pause & story overlay
              playerPositionRef={playerPositionRef}
              spawnPosition={spawnPosition}
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
              onAllMissionsCompleted={handleAllMissionsCompleted}
            />

            <DestinationMarker destinationRef={destinationRef} />
            <NavigationSystem
              playerRef={playerPositionRef}
              destinationRef={destinationRef}
              onMiniMapCanvasChange={setMiniMapCanvas}
            />

            {/* Camera */}
            {!flightEnabled && <CameraChase target={chaseRef} />}
            {flightControls}
            <OrbitControls makeDefault />
          </Physics>
        </Canvas>

        {/* Controls */}
        <TaxiControlSettings
          controlMode={controlMode}
          onControlModeChange={setControlMode}
          isPaused={isPaused}
          onPauseChange={setIsPaused}
        />

        {/* UI overlay */}
        <TaxiSpeedometer />
        <GameUI />
        <GameOverPopup />
        <UpgradeMenu />
        <MiniMapOverlay
          canvas={miniMapCanvas}
          missions={availableMissionTargets}
          playerRef={playerPositionRef}
          size={220}
        />
        <MissionOverlay />
        <CityStoryOverlay
          cityId={storyCity}
          story={storyData}
          onContinue={handleStoryOverlayContinue}
        />
        <div
          style={{
            position: "absolute",
            bottom: 20,
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
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              background: testMode
                ? "rgba(46, 125, 50, 0.85)"
                : "rgba(24, 28, 35, 0.85)",
              color: "#f5f5f5",
              border: "1px solid rgba(255,255,255,0.25)",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            {testMode ? "Test Travel: On" : "Enable Test Travel"}
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
                  Travel to {city.toUpperCase()}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {flightOverlay}

        <button
          type="button"
          onClick={toggleLightingMode}
          style={{
            position: "absolute",
            top: 16,
            left: 84,
            zIndex: 30,
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 8,
            background: "rgba(24, 28, 35, 0.8)",
            color: "#f5f5f5",
            padding: "6px 12px",
            fontSize: "0.85rem",
            cursor: "pointer",
            backdropFilter: "blur(2px)",
          }}
          title="Toggle between fake decal lighting and a global fill light."
        >
          {lightingMode === "fake"
            ? "Lighting: Decals Only"
            : "Lighting: Global Fill"}
        </button>
      </div>
    </MissionUIProvider>
  );
}

function AppContent() {
  const { appStage } = useMeta();

  if (appStage === "login") return <LoginScreen />;
  if (appStage === "entrance") return <EntranceScreen />;
  if (appStage === "car") return <CarSelector />;

  return <GameWorld />;
}

export default function App() {
  return (
    <MetaProvider>
      <AppContent />
    </MetaProvider>
  );
}
