import {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
} from "react";
import type { ReactNode } from "react";
import {
  MAX_UPGRADE_LEVEL,
  baseMaxBoost,
  brakeIncreasePerLevel,
  brakeUpgradePrice,
  boostCapacityIncreasePerLevel,
  boostForceIncreasePerLevel,
  boostUpgradePrice,
  speedIncreasePerLevel,
  speedUpgradePrice,
  missionFinderPrice,
} from "./constants/upgrades";
import { CITY_SEQUENCE, type CityId } from "./constants/cities";
import { loadGameProgress } from "./utils/storage";

export type GameMode = "campaign" | "freeRoam" | "competition";

type GameContextType = {
  money: number;
  setMoney: React.Dispatch<React.SetStateAction<number>>;
  kilometers: number;
  setKilometers: React.Dispatch<React.SetStateAction<number>>;
  speed: number;
  setSpeed: React.Dispatch<React.SetStateAction<number>>;
  boost: number;
  setBoost: React.Dispatch<React.SetStateAction<number>>;
  maxBoost: number;
  isBoosting: boolean;
  setIsBoosting: React.Dispatch<React.SetStateAction<boolean>>;
  gameOver: boolean;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  speedLevel: number;
  brakeLevel: number;
  boostLevel: number;
  speedMultiplier: number;
  brakeMultiplier: number;
  boostForceMultiplier: number;
  upgradeSpeed: () => void;
  upgradeBrakes: () => void;
  upgradeBoost: () => void;
  speedUpgradePrice: number;
  brakeUpgradePrice: number;
  boostUpgradePrice: number;
  missionFinderPrice: number;
  missionFinderCharges: number;
  purchaseMissionFinder: () => void;
  consumeMissionFinderCharge: () => boolean;
  gameMode: GameMode;
  setGameMode: React.Dispatch<React.SetStateAction<GameMode>>;
  isFreeRoam: boolean;
};

type RestartOptions = {
  mode?: GameMode;
  skipIntro?: boolean;
};

type GameLifecycleContextType = {
  restartGame: (options?: RestartOptions) => void;
  gameInstance: number;
  activeCity: CityId;
  setActiveCity: React.Dispatch<React.SetStateAction<CityId>>;
  gameMode: GameMode;
  setGameMode: React.Dispatch<React.SetStateAction<GameMode>>;
  isFreeRoam: boolean;
  isCompetition: boolean; // ✅ ADD THIS
  shouldSkipIntro: boolean;
  clearIntroSkip: () => void;
  competitionName: string | null;
  setCompetitionName: React.Dispatch<React.SetStateAction<string | null>>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);
const GameLifecycleContext = createContext<
  GameLifecycleContextType | undefined
>(undefined);

type EconomyState = {
  money: number;
  speedLevel: number;
  brakeLevel: number;
  boostLevel: number;
  missionFinderCharges: number;
};

const initialEconomyState: EconomyState = {
  money: 1000,
  speedLevel: 0,
  brakeLevel: 0,
  boostLevel: 0,
  missionFinderCharges: 5,
};

const DEFAULT_CITY = (CITY_SEQUENCE[0] ?? "city1") as CityId;
const FREE_ROAM_MONEY = 999_999;

const buildEconomyState = (mode: GameMode): EconomyState =>
  mode === "freeRoam" || mode === "competition"
    ? { ...initialEconomyState, money: FREE_ROAM_MONEY }
    : { ...initialEconomyState };

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameMode, setGameMode] = useState<GameMode>("campaign");
  const [economy, setEconomy] = useState<EconomyState>(() =>
    buildEconomyState("campaign")
  );
  const [kilometers, setKilometers] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [boost, setBoost] = useState(0);
  const [isBoosting, setIsBoosting] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameInstance, setGameInstance] = useState(0);
  const [activeCity, setActiveCity] = useState<CityId>(() => {
    const saved = loadGameProgress();
    return saved?.cityId ?? DEFAULT_CITY;
  });
  const [shouldSkipIntro, setShouldSkipIntro] = useState(false);
  const [competitionName, setCompetitionName] = useState<string | null>(null);
  const isFreeRoam = gameMode === "freeRoam";
  const isCompetition = gameMode === "competition";

  const { money, speedLevel, brakeLevel, boostLevel, missionFinderCharges } =
    economy;

  const setMoney = useCallback(
    (update: React.SetStateAction<number>) => {
      setEconomy((previous) => {
        const currentMoney = previous.money;
        const nextValue =
          typeof update === "function"
            ? (update as (value: number) => number)(currentMoney)
            : update;

        if (gameMode === "freeRoam" || gameMode === "competition") {
          const target = Math.max(
            typeof nextValue === "number" ? nextValue : currentMoney,
            FREE_ROAM_MONEY
          );
          if (target === currentMoney) return previous;
          return { ...previous, money: target };
        }

        const rawNext =
          typeof nextValue === "number" ? nextValue : currentMoney;

        // Clamp to zero so it never goes negative
        const nextMoney = Math.max(0, rawNext);

        // Trigger Game Over when money reaches 0
        if (nextMoney <= 0 && previous.money > 0) {
          setGameOver(true);
        }

        if (nextMoney === previous.money) return previous;
        return { ...previous, money: nextMoney };
      });
    },
    [setEconomy, setGameOver, gameMode]
  );

  const speedMultiplier = 1 + speedLevel * speedIncreasePerLevel;
  const brakeMultiplier = 1 + brakeLevel * brakeIncreasePerLevel;
  const boostForceMultiplier = 1 + boostLevel * boostForceIncreasePerLevel;
  const maxBoost =
    baseMaxBoost * (1 + boostLevel * boostCapacityIncreasePerLevel);

  const upgradeSpeed = useCallback(() => {
    setEconomy((previous) => {
      if (previous.speedLevel >= MAX_UPGRADE_LEVEL) {
        if (gameMode === "freeRoam" || gameMode === "competition") {
          const ensuredMoney = Math.max(previous.money, FREE_ROAM_MONEY);
          if (ensuredMoney === previous.money) return previous;
          return { ...previous, money: ensuredMoney };
        }
        return previous;
      }

      if (gameMode === "freeRoam" || gameMode === "competition") {
        return {
          ...previous,
          speedLevel: previous.speedLevel + 1,
          money: Math.max(previous.money, FREE_ROAM_MONEY),
        };
      }

      if (previous.money < speedUpgradePrice) {
        return previous;
      }

      return {
        ...previous,
        speedLevel: previous.speedLevel + 1,
        money: previous.money - speedUpgradePrice,
      };
    });
  }, [gameMode]);

  const upgradeBrakes = useCallback(() => {
    setEconomy((previous) => {
      if (previous.brakeLevel >= MAX_UPGRADE_LEVEL) {
        if (gameMode === "freeRoam" || gameMode === "competition") {
          const ensuredMoney = Math.max(previous.money, FREE_ROAM_MONEY);
          if (ensuredMoney === previous.money) return previous;
          return { ...previous, money: ensuredMoney };
        }
        return previous;
      }

      if (gameMode === "freeRoam" || gameMode === "competition") {
        return {
          ...previous,
          brakeLevel: previous.brakeLevel + 1,
          money: Math.max(previous.money, FREE_ROAM_MONEY),
        };
      }

      if (previous.money < brakeUpgradePrice) {
        return previous;
      }

      return {
        ...previous,
        brakeLevel: previous.brakeLevel + 1,
        money: previous.money - brakeUpgradePrice,
      };
    });
  }, [gameMode]);

  const upgradeBoost = useCallback(() => {
    setEconomy((previous) => {
      if (previous.boostLevel >= MAX_UPGRADE_LEVEL) {
        if (gameMode === "freeRoam" || gameMode === "competition") {
          const ensuredMoney = Math.max(previous.money, FREE_ROAM_MONEY);
          if (ensuredMoney === previous.money) return previous;
          return { ...previous, money: ensuredMoney };
        }
        return previous;
      }

      if (gameMode === "freeRoam" || gameMode === "competition") {
        return {
          ...previous,
          boostLevel: previous.boostLevel + 1,
          money: Math.max(previous.money, FREE_ROAM_MONEY),
        };
      }

      if (previous.money < boostUpgradePrice) {
        return previous;
      }

      return {
        ...previous,
        boostLevel: previous.boostLevel + 1,
        money: previous.money - boostUpgradePrice,
      };
    });
  }, [gameMode]);

  const consumeMissionFinderCharge = useCallback(() => {
    let didConsume = false;
    setEconomy((previous) => {
      if (previous.missionFinderCharges <= 0) {
        return previous;
      }
      didConsume = true;
      return {
        ...previous,
        missionFinderCharges: previous.missionFinderCharges - 1,
      };
    });
    return didConsume;
  }, []);

  const purchaseMissionFinder = useCallback(() => {
    setEconomy((previous) => {
      if (gameMode === "freeRoam" || gameMode === "competition") {
        return {
          ...previous,
          missionFinderCharges: previous.missionFinderCharges + 1,
          money: Math.max(previous.money, FREE_ROAM_MONEY),
        };
      }

      if (previous.money < missionFinderPrice) {
        return previous;
      }

      return {
        ...previous,
        money: previous.money - missionFinderPrice,
        missionFinderCharges: previous.missionFinderCharges + 1,
      };
    });
  }, [gameMode]);

  const restartGame = useCallback(
    (options?: RestartOptions) => {
      const mode = options?.mode ?? gameMode;
      if (mode !== gameMode) {
        setGameMode(mode);
      }
      if (mode !== "competition") {
        setCompetitionName(null);
      }
      setShouldSkipIntro(Boolean(options?.skipIntro));
      setEconomy(buildEconomyState(mode));
      setKilometers(0);
      setSpeed(0);
      setBoost(0);
      setIsBoosting(false);
      setGameOver(false);
      setGameInstance((value) => value + 1);
    },
    [
      gameMode,
      setGameMode,
      setEconomy,
      setKilometers,
      setSpeed,
      setBoost,
      setIsBoosting,
      setGameOver,
      setGameInstance,
      setShouldSkipIntro,
      setCompetitionName,
    ]
  );

  const clearIntroSkip = useCallback(() => {
    setShouldSkipIntro(false);
  }, [setShouldSkipIntro]);

  const stateValue = useMemo(
    () => ({
      money,
      setMoney,
      kilometers,
      setKilometers,
      speed,
      setSpeed,
      boost,
      setBoost,
      isBoosting,
      setIsBoosting,
      maxBoost,
      gameOver,
      setGameOver,
      speedLevel,
      brakeLevel,
      boostLevel,
      speedMultiplier,
      brakeMultiplier,
      boostForceMultiplier,
      upgradeSpeed,
      upgradeBrakes,
      upgradeBoost,
      speedUpgradePrice,
      brakeUpgradePrice,
      boostUpgradePrice,
      missionFinderPrice,
      missionFinderCharges,
      purchaseMissionFinder,
      consumeMissionFinderCharge,
      gameMode,
      setGameMode,
      isFreeRoam,
      isCompetition,
    }),
    [
      money,
      setMoney,
      kilometers,
      setKilometers,
      speed,
      setSpeed,
      boost,
      setBoost,
      isBoosting,
      setIsBoosting,
      maxBoost,
      gameOver,
      setGameOver,
      speedLevel,
      brakeLevel,
      boostLevel,
      speedMultiplier,
      brakeMultiplier,
      boostForceMultiplier,
      upgradeSpeed,
      upgradeBrakes,
      upgradeBoost,
      missionFinderPrice,
      missionFinderCharges,
      purchaseMissionFinder,
      consumeMissionFinderCharge,
      gameMode,
      setGameMode,
      isFreeRoam,
      isCompetition,
    ]
  );

  const lifecycleValue = useMemo(
    () => ({
      restartGame,
      gameInstance,
      activeCity,
      setActiveCity,
      gameMode,
      setGameMode,
      isFreeRoam,
      isCompetition, // ✅ ADD THIS
      shouldSkipIntro,
      clearIntroSkip,
      competitionName,
      setCompetitionName,
    }),

    [
      restartGame,
      gameInstance,
      activeCity,
      setActiveCity,
      gameMode,
      setGameMode,
      isFreeRoam,
      shouldSkipIntro,
      clearIntroSkip,
      isCompetition,
      competitionName,
      setCompetitionName,
    ]
  );

  return (
    <GameLifecycleContext.Provider value={lifecycleValue}>
      <GameContext.Provider value={stateValue}>{children}</GameContext.Provider>
    </GameLifecycleContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}

export function useGameLifecycle() {
  const ctx = useContext(GameLifecycleContext);
  if (!ctx)
    throw new Error("useGameLifecycle must be used inside GameProvider");
  return ctx;
}
