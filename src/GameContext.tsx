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
} from "./constants/upgrades";
import { CITY_SEQUENCE, type CityId } from "./constants/cities";

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
};

type GameLifecycleContextType = {
  restartGame: () => void;
  gameInstance: number;
  activeCity: CityId;
  setActiveCity: React.Dispatch<React.SetStateAction<CityId>>;
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
};

const initialEconomyState: EconomyState = {
  money: 1000,
  speedLevel: 0,
  brakeLevel: 0,
  boostLevel: 0,
};

const DEFAULT_CITY = (CITY_SEQUENCE[0] ?? "city1") as CityId;

export function GameProvider({ children }: { children: ReactNode }) {
  const [economy, setEconomy] = useState<EconomyState>(initialEconomyState);
  const [kilometers, setKilometers] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [boost, setBoost] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameInstance, setGameInstance] = useState(0);
  const [activeCity, setActiveCity] = useState<CityId>(DEFAULT_CITY);

  const { money, speedLevel, brakeLevel, boostLevel } = economy;

  const setMoney = useCallback(
    (update: React.SetStateAction<number>) => {
      setEconomy((previous) => {
        const rawNext =
          typeof update === "function"
            ? (update as (value: number) => number)(previous.money)
            : update;

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
    [setEconomy, setGameOver]
  );

  const speedMultiplier = 1 + speedLevel * speedIncreasePerLevel;
  const brakeMultiplier = 1 + brakeLevel * brakeIncreasePerLevel;
  const boostForceMultiplier = 1 + boostLevel * boostForceIncreasePerLevel;
  const maxBoost =
    baseMaxBoost * (1 + boostLevel * boostCapacityIncreasePerLevel);

  const upgradeSpeed = useCallback(() => {
    setEconomy((previous) => {
      if (
        previous.speedLevel >= MAX_UPGRADE_LEVEL ||
        previous.money < speedUpgradePrice
      ) {
        return previous;
      }

      return {
        ...previous,
        speedLevel: previous.speedLevel + 1,
        money: previous.money - speedUpgradePrice,
      };
    });
  }, []);

  const upgradeBrakes = useCallback(() => {
    setEconomy((previous) => {
      if (
        previous.brakeLevel >= MAX_UPGRADE_LEVEL ||
        previous.money < brakeUpgradePrice
      ) {
        return previous;
      }

      return {
        ...previous,
        brakeLevel: previous.brakeLevel + 1,
        money: previous.money - brakeUpgradePrice,
      };
    });
  }, []);

  const upgradeBoost = useCallback(() => {
    setEconomy((previous) => {
      if (
        previous.boostLevel >= MAX_UPGRADE_LEVEL ||
        previous.money < boostUpgradePrice
      ) {
        return previous;
      }

      return {
        ...previous,
        boostLevel: previous.boostLevel + 1,
        money: previous.money - boostUpgradePrice,
      };
    });
  }, []);

  const restartGame = useCallback(() => {
    setEconomy(() => ({ ...initialEconomyState }));
    setKilometers(0);
    setSpeed(0);
    setBoost(0);
    setGameOver(false);
    setGameInstance((value) => value + 1);
  }, []);

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
    ]
  );

  const lifecycleValue = useMemo(
    () => ({
      restartGame,
      gameInstance,
      activeCity,
      setActiveCity,
    }),
    [restartGame, gameInstance, activeCity, setActiveCity]
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
